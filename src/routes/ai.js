import { Hono } from 'hono';
import { getDb, J, P } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { body, user, logAction, notFound } from '../lib/http.js';
import { str, int, oneOf, assert } from '../lib/security.js';
import { ai, AI_FUNCTION_LIST } from '../ai/service.js';
import { getProvider, createProvider } from '../ai/provider.js';
import { siteMetrics, pageSummaryForAI } from '../lib/metrics.js';
import { getPageSnapshot, saveVersion, mutate } from '../lib/builder.js';
import { mobileQualityCheck } from '../render/mobileCheck.js';
import { publicConfig } from '../config.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));

const CATEGORIES = ['SEO', 'CONTENT', 'CTA', 'DESIGN', 'MOBILE', 'AFFILIATE', 'INTERNAL_LINK', 'CONVERSION', 'REVENUE'];

// ---- Ollama status / test ----
r.get('/status', async (c) => {
  const provider = getProvider();
  const health = await provider.healthCheck();
  return c.json({ ...health, config: publicConfig().ai, functions: AI_FUNCTION_LIST.map(([k, n]) => ({ key: k, name: n })) });
});
r.post('/test', requireAuth('editor'), async (c) => {
  const b = await body(c);
  // optional temporary override to test alternative URL/model without persisting secrets
  const provider = (b.baseUrl || b.model) ? createProvider({ baseUrl: b.baseUrl || undefined, model: b.model || undefined }) : getProvider();
  const health = await provider.healthCheck();
  logAction(c, 'AI_CONNECTION_TEST', 'ai', null, { status: health.status });
  return c.json(health);
});
r.post('/prompt', requireAuth('editor'), async (c) => {
  const b = await body(c);
  const prompt = str(b.prompt, { name: 'prompt', required: true, max: 4000 });
  const out = await getProvider().chat([{ role: 'user', content: prompt }], { temperature: 0.5, maxTokens: int(b.maxTokens, { name: 'maxTokens', min: 16, max: 4096 }) || 512 });
  return c.json(out);
});

function saveAnalysis(db, c, siteId, pageId, type, out) {
  const res = db.run('INSERT INTO ai_analysis(site_id,page_id,analysis_type,input_summary,result,model,provider,duration_ms,created_by) VALUES(?,?,?,?,?,?,?,?,?)',
    [siteId, pageId, type, J(out.inputSummary), J(out.result), out.model, out.provider, out.durationMs, user(c).id]);
  logAction(c, 'AI_ANALYSIS', 'ai_analysis', res.lastInsertRowid, { type, siteId });
  return res.lastInsertRowid;
}

// Persist AI suggestions as recommendations (pending)
function saveRecommendations(db, siteId, pageId, analysisId, suggestions) {
  const ids = [];
  for (const s of suggestions || []) {
    if (!s || !s.title) continue;
    const cat = CATEGORIES.includes(String(s.category || '').toUpperCase()) ? String(s.category).toUpperCase() : 'CONTENT';
    const res = db.run('INSERT INTO ai_recommendations(site_id,page_id,analysis_id,category,title,description,rationale,uncertainty,proposed_changes,priority) VALUES(?,?,?,?,?,?,?,?,?,?)',
      [siteId, pageId, analysisId, cat, String(s.title).slice(0, 200), s.description || null, s.rationale || null, s.uncertainty || null, J(Array.isArray(s.proposed_changes) ? s.proposed_changes : []), ['high', 'medium', 'low'].includes(s.priority) ? s.priority : 'medium']);
    ids.push(res.lastInsertRowid);
  }
  return ids;
}

// ---- Generic analysis endpoint ----
// POST /api/ai/analyze { siteId, pageId?, type: access|click|conversion|revenue|seo|cta|ad_placement|mobile_issues|site, saveRecommendations?: bool }
r.post('/analyze', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const siteId = int(b.siteId, { name: 'siteId', required: true });
  const site = db.get('SELECT * FROM sites WHERE id=?', [siteId]); assert(site, 'site not found', 404);
  const type = oneOf(b.type, ['access', 'click', 'conversion', 'revenue', 'seo', 'cta', 'ad_placement', 'mobile_issues', 'site'], 'type');
  const pageId = int(b.pageId, { name: 'pageId' }) ?? null;
  const metrics = siteMetrics(db, siteId, { from: b.from, to: b.to });
  const base = { site: { name: site.name, ad_title: site.ad_title, target_audience: site.target_audience }, period: { from: b.from || 'all', to: b.to || 'now' } };
  let out;
  switch (type) {
    case 'access': out = await ai.analyzeAccess({ ...base, pv: metrics.pv, visits: metrics.visits, byDevice: metrics.byDevice, byPage: metrics.byPage, daily: metrics.daily }); break;
    case 'click': out = await ai.analyzeClicks({ ...base, pv: metrics.pv, affiliateClicks: metrics.affiliateClicks, ctr: metrics.ctr, byDevice: metrics.byDevice, byAd: metrics.byAd, byPage: metrics.byPage, dailyClicks: metrics.dailyClicks }); break;
    case 'conversion': out = await ai.analyzeConversions({ ...base, affiliateClicks: metrics.affiliateClicks, cv: metrics.cv, cvr: metrics.cvr, byDevice: metrics.byDevice, byAd: metrics.byAd }); break;
    case 'revenue': out = await ai.analyzeRevenue({ ...base, revenue: metrics.revenue, cv: metrics.cv, byDevice: metrics.byDevice, byAd: metrics.byAd }); break;
    case 'seo': {
      const pages = pageId ? [pageSummaryForAI(db, pageId)] : db.all('SELECT id FROM site_pages WHERE site_id=? ORDER BY sort_order LIMIT 8', [siteId]).map(p => pageSummaryForAI(db, p.id));
      const seo = pages.filter(Boolean).map(p => ({ page: p.page, headings: p.components.filter(x => x.type === 'heading').map(x => ({ level: x.props.level, text: x.props.text })), internalLinks: p.components.filter(x => x.type === 'button' || x.type === 'cta').map(x => x.props.url).filter(u => u && u.startsWith('/')), componentCount: p.components.length }));
      out = await ai.analyzeSeo({ ...base, seo_keywords: P(site.seo_keywords, []), pages: seo }); break;
    }
    case 'cta': {
      const ctas = db.all("SELECT c.id,c.page_id,c.props,c.desktop_config,c.tablet_config,c.mobile_config,c.sort_order FROM site_components c JOIN site_pages p ON p.id=c.page_id WHERE p.site_id=? AND c.type IN ('cta','button')", [siteId])
        .map(x => ({ id: x.id, pageId: x.page_id, props: P(x.props, {}), desktop: P(x.desktop_config, {}), tablet: P(x.tablet_config, {}), mobile: P(x.mobile_config, {}), order: x.sort_order,
          views: db.get('SELECT COUNT(*) n FROM analytics_events WHERE component_id=? AND event_type=?', [x.id, 'cta_view']).n, clicks: db.get('SELECT COUNT(*) n FROM analytics_events WHERE component_id=? AND event_type=?', [x.id, 'cta_click']).n }));
      out = await ai.analyzeCta({ ...base, ctas, byDevice: metrics.byDevice }); break;
    }
    case 'ad_placement': {
      const ads = db.all("SELECT c.id,c.page_id,c.props,c.sort_order,c.sort_order_mobile,c.desktop_config,c.mobile_config FROM site_components c JOIN site_pages p ON p.id=c.page_id WHERE p.site_id=? AND c.type='affiliate_ad'", [siteId])
        .map(x => { const props = P(x.props, {}); delete props.code; return { id: x.id, pageId: x.page_id, adId: props.adId, order: x.sort_order, mobileOrder: x.sort_order_mobile, desktop: P(x.desktop_config, {}), mobile: P(x.mobile_config, {}), clicks: db.get('SELECT COUNT(*) n FROM affiliate_clicks WHERE component_id=?', [x.id]).n }; });
      out = await ai.analyzeAdPlacement({ ...base, adComponents: ads, byAd: metrics.byAd, byDevice: metrics.byDevice }); break;
    }
    case 'mobile_issues': {
      const pages = db.all('SELECT id FROM site_pages WHERE site_id=? ORDER BY sort_order LIMIT 6', [siteId]);
      const checks = pages.map(p => ({ pageId: p.id, ...mobileQualityCheck(db, p.id) }));
      out = await ai.analyzeMobileIssues({ ...base, qualityChecks: checks, mobile: metrics.byDevice.mobile, desktop: metrics.byDevice.desktop, vitals: metrics.vitals }); break;
    }
    case 'site': out = await ai.suggestSiteImprovements({ ...base, metrics: { pv: metrics.pv, ctr: metrics.ctr, cv: metrics.cv, cvr: metrics.cvr, revenue: metrics.revenue, byDevice: metrics.byDevice }, pages: db.all('SELECT title,slug,page_type,seo_title FROM site_pages WHERE site_id=?', [siteId]) }); break;
  }
  const analysisId = saveAnalysis(db, c, siteId, pageId, type, out);
  let recommendationIds = [];
  if (b.saveRecommendations !== false) recommendationIds = saveRecommendations(db, siteId, pageId, analysisId, out.result.suggestions);
  return c.json({ analysisId, type, result: out.result, recommendationIds, model: out.model, durationMs: out.durationMs, dataUsedSummary: out.inputSummary });
});

r.get('/analyses', (c) => {
  const db = getDb(); const siteId = c.req.query('siteId');
  const rows = siteId ? db.all('SELECT * FROM ai_analysis WHERE site_id=? ORDER BY id DESC LIMIT 100', [siteId]) : db.all('SELECT * FROM ai_analysis ORDER BY id DESC LIMIT 100');
  return c.json(rows.map(x => ({ ...x, result: P(x.result, {}), input_summary: undefined })));
});
r.get('/analyses/:id', (c) => { const x = getDb().get('SELECT * FROM ai_analysis WHERE id=?', [c.req.param('id')]); return x ? c.json({ ...x, result: P(x.result, {}), input_summary: P(x.input_summary, {}) }) : notFound(c, 'Analysis'); });

// ---- Recommendations ----
r.post('/recommendations/generate', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const siteId = int(b.siteId, { name: 'siteId', required: true }); const site = db.get('SELECT * FROM sites WHERE id=?', [siteId]); assert(site, 'site not found', 404);
  const pageId = int(b.pageId, { name: 'pageId' }) ?? db.get("SELECT id FROM site_pages WHERE site_id=? AND slug='home'", [siteId])?.id ?? null;
  const metrics = siteMetrics(db, siteId);
  const pageSummary = pageId ? pageSummaryForAI(db, pageId) : null;
  const recentAnalyses = db.all('SELECT analysis_type, result FROM ai_analysis WHERE site_id=? ORDER BY id DESC LIMIT 3', [siteId]).map(x => ({ type: x.analysis_type, summary: P(x.result, {}).summary }));
  const out = await ai.generateRecommendations({ site: { name: site.name, ad_title: site.ad_title }, focus: b.focus || 'all', metrics: { pv: metrics.pv, ctr: metrics.ctr, cv: metrics.cv, cvr: metrics.cvr, revenue: metrics.revenue, byDevice: metrics.byDevice }, page: pageSummary, recentAnalyses });
  const analysisId = saveAnalysis(db, c, siteId, pageId, 'recommendations', out);
  const ids = saveRecommendations(db, siteId, pageId, analysisId, out.result.recommendations);
  return c.json({ analysisId, recommendationIds: ids, recommendations: db.all(`SELECT * FROM ai_recommendations WHERE id IN (${ids.map(() => '?').join(',') || 'NULL'})`, ids).map(x => ({ ...x, proposed_changes: P(x.proposed_changes, []) })), model: out.model, durationMs: out.durationMs });
});

r.get('/recommendations', (c) => {
  const db = getDb(); const siteId = c.req.query('siteId'); const status = c.req.query('status'); const category = c.req.query('category');
  const w = []; const p = [];
  if (siteId) { w.push('r.site_id=?'); p.push(siteId); } if (status) { w.push('r.status=?'); p.push(status); } if (category) { w.push('r.category=?'); p.push(category); }
  const rows = db.all(`SELECT r.*, s.name site_name, pg.title page_title FROM ai_recommendations r LEFT JOIN sites s ON s.id=r.site_id LEFT JOIN site_pages pg ON pg.id=r.page_id ${w.length ? 'WHERE ' + w.join(' AND ') : ''} ORDER BY r.id DESC LIMIT 300`, p);
  return c.json(rows.map(x => ({ ...x, proposed_changes: P(x.proposed_changes, []) })));
});
r.get('/recommendations/categories', (c) => c.json(CATEGORIES));

// Preview: what would change (no mutation)
r.get('/recommendations/:id/preview', (c) => {
  const db = getDb(); const rec = db.get('SELECT * FROM ai_recommendations WHERE id=?', [c.req.param('id')]); if (!rec) return notFound(c, 'Recommendation');
  const changes = P(rec.proposed_changes, []);
  const preview = changes.map(ch => {
    const comp = ch.component_id ? db.get('SELECT * FROM site_components WHERE id=?', [ch.component_id]) : null;
    return { ...ch, exists: !!comp, componentType: comp?.type, current: comp ? resolveField(comp, ch.field) : undefined, applicable: !!comp && !!ch.field && !isAdCodeField(comp, ch.field) };
  });
  return c.json({ recommendation: { ...rec, proposed_changes: changes }, preview, applicableCount: preview.filter(p => p.applicable).length });
});

function isAdCodeField(comp, field) { return comp.type === 'affiliate_ad' && /props\.(code|adId)|original_code/.test(String(field)); }
function resolveField(comp, field) {
  const [root, ...rest] = String(field || '').split('.');
  const obj = ['props', 'desktop_config', 'tablet_config', 'mobile_config'].includes(root) ? P(comp[root], {}) : null;
  if (!obj) return undefined;
  return rest.reduce((o, k) => (o && typeof o === 'object' ? o[k] : undefined), obj);
}
function setField(comp, field, value) {
  const [root, ...rest] = String(field).split('.');
  assert(['props', 'desktop_config', 'tablet_config', 'mobile_config'].includes(root), `unsupported field root: ${root}`);
  const obj = P(comp[root], {});
  let cur = obj;
  for (let i = 0; i < rest.length - 1; i++) { if (typeof cur[rest[i]] !== 'object' || cur[rest[i]] === null) cur[rest[i]] = {}; cur = cur[rest[i]]; }
  if (rest.length) cur[rest[rest.length - 1]] = value; else return { root, value: typeof value === 'object' ? value : obj };
  return { root, value: obj };
}

// Approve / Reject / Hold
r.post('/recommendations/:id/review', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const rec = db.get('SELECT * FROM ai_recommendations WHERE id=?', [c.req.param('id')]); if (!rec) return notFound(c, 'Recommendation');
  const decision = oneOf(b.decision, ['approve', 'reject', 'hold'], 'decision');
  const status = decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'hold';
  db.run("UPDATE ai_recommendations SET status=?, reviewed_by=?, reviewed_at=datetime('now'), review_note=? WHERE id=?", [status, user(c).id, b.note ? str(b.note, { max: 1000 }) : null, rec.id]);
  logAction(c, 'RECOMMENDATION_REVIEW', 'ai_recommendation', rec.id, { decision });
  return c.json({ ...db.get('SELECT * FROM ai_recommendations WHERE id=?', [rec.id]), proposed_changes: P(rec.proposed_changes, []) });
});

// Apply: only if approved. Applies proposed_changes to components (draft only; NOT publish). Records improvement_history.
r.post('/recommendations/:id/apply', requireAuth('editor'), async (c) => {
  const db = getDb(); const rec = db.get('SELECT * FROM ai_recommendations WHERE id=?', [c.req.param('id')]); if (!rec) return notFound(c, 'Recommendation');
  assert(rec.status === 'approved', `承認済み(approved)の改善案のみ適用できます (現在: ${rec.status})`, 409);
  const changes = P(rec.proposed_changes, []).filter(ch => ch.component_id && ch.field);
  const pageIds = [...new Set(changes.map(ch => db.get('SELECT page_id FROM site_components WHERE id=?', [ch.component_id])?.page_id).filter(Boolean))];
  const pageId = rec.page_id || pageIds[0] || null;
  const beforeMetrics = siteMetrics(db, rec.site_id);
  const before = pageId ? getPageSnapshot(db, pageId) : null;
  const applied = [];
  const doApply = () => {
    for (const ch of changes) {
      const comp = db.get('SELECT * FROM site_components WHERE id=?', [ch.component_id]); if (!comp) continue;
      if (isAdCodeField(comp, ch.field)) continue; // never touch ad code
      const { root, value } = setField(comp, ch.field, ch.to);
      db.run(`UPDATE site_components SET ${root}=?, updated_at=datetime('now') WHERE id=?`, [J(value), comp.id]);
      applied.push({ component_id: comp.id, field: ch.field, from: ch.from, to: ch.to });
    }
  };
  if (pageId) mutate(db, pageId, user(c).id, `ai_apply:#${rec.id}`, doApply); else db.transaction(doApply);
  const after = pageId ? getPageSnapshot(db, pageId) : null;
  const ver = pageId ? saveVersion(db, rec.site_id, pageId, 'ai_apply', `AI recommendation #${rec.id}`, user(c).id) : null;
  const hist = db.run('INSERT INTO improvement_history(site_id,page_id,recommendation_id,title,before_snapshot,change_summary,after_snapshot,before_metrics,applied_by) VALUES(?,?,?,?,?,?,?,?,?)',
    [rec.site_id, pageId, rec.id, rec.title, J(before), J({ applied, category: rec.category, description: rec.description }), J(after), J({ pv: beforeMetrics.pv, ctr: beforeMetrics.ctr, cv: beforeMetrics.cv, cvr: beforeMetrics.cvr, revenue: beforeMetrics.revenue, byDevice: beforeMetrics.byDevice, capturedAt: new Date().toISOString() }), user(c).id]);
  db.run("UPDATE ai_recommendations SET status='applied', applied_at=datetime('now') WHERE id=?", [rec.id]);
  logAction(c, 'RECOMMENDATION_APPLY', 'ai_recommendation', rec.id, { applied: applied.length, pageId });
  return c.json({ ok: true, applied, appliedCount: applied.length, skipped: changes.length - applied.length, version: ver, improvementHistoryId: hist.lastInsertRowid, published: false, note: '変更は下書きに適用されました。公開するにはPublishを実行してください。' });
});

// ---- Mobile optimization flow: analyze -> proposal (recommendation, pending) -> preview -> approve -> apply ----
r.post('/mobile/optimize', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const pageId = int(b.pageId, { name: 'pageId', required: true });
  const page = db.get('SELECT * FROM site_pages WHERE id=?', [pageId]); assert(page, 'page not found', 404);
  const site = db.get('SELECT * FROM sites WHERE id=?', [page.site_id]);
  const promptId = int(b.promptId, { name: 'promptId' }) ?? site.mobile_prompt_id;
  const prompt = promptId ? db.get("SELECT * FROM mobile_design_prompts WHERE id=?", [promptId]) : null;
  assert(prompt, 'Mobile Promptが設定されていません', 400);
  assert(prompt.status === 'ACTIVE', 'INACTIVEなMobile Promptは使用できません', 400);
  const settings = db.get('SELECT * FROM mobile_design_settings WHERE site_id=?', [site.id]);
  const design = site.design_theme_id ? db.get('SELECT css FROM design_themes WHERE id=?', [site.design_theme_id]) : null;
  const summary = pageSummaryForAI(db, pageId);
  const qc = mobileQualityCheck(db, pageId);
  const out = await ai.optimizeMobile({ mobilePrompt: { name: prompt.name, instruction: prompt.prompt, rules: P(prompt.rules, {}) }, currentMobileSettings: settings, css: (design?.css || '').slice(0, 3000), page: summary.page, components: summary.components, qualityCheck: qc });
  const analysisId = saveAnalysis(db, c, site.id, pageId, 'mobile', out);
  const changes = (out.result.changes || []).filter(ch => ch.component_id && ch.field).map(ch => ({ component_id: Number(ch.component_id), field: /^(props|desktop_config|tablet_config|mobile_config)\./.test(ch.field) ? ch.field : `mobile_config.${ch.field}`, from: ch.from, to: ch.to, reason: ch.reason }));
  const rec = db.run('INSERT INTO ai_recommendations(site_id,page_id,analysis_id,category,title,description,rationale,uncertainty,proposed_changes,priority) VALUES(?,?,?,?,?,?,?,?,?,?)',
    [site.id, pageId, analysisId, 'MOBILE', `AI Mobile Optimization (${prompt.name})`, out.result.summary || null, out.result.reasoning || null, out.result.uncertainty || null, J(changes), 'high']);
  logAction(c, 'AI_MOBILE_OPTIMIZE', 'ai_recommendation', rec.lastInsertRowid, { pageId, changes: changes.length });
  return c.json({ analysisId, recommendationId: rec.lastInsertRowid, result: out.result, changes, cssSuggestions: out.result.css_suggestions || [], qualityCheck: qc, status: 'pending', model: out.model, durationMs: out.durationMs, next: 'Preview -> Approve -> Apply -> Save -> Publish' });
});

// Mobile quality check (deterministic, no AI)
r.get('/mobile/quality-check/:pageId', (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  if (!db.get('SELECT id FROM site_pages WHERE id=?', [pageId])) return notFound(c, 'Page');
  return c.json(mobileQualityCheck(db, pageId));
});

// ---- Experiments (A/B) ----
r.get('/experiments', (c) => {
  const db = getDb(); const siteId = c.req.query('siteId');
  const rows = siteId ? db.all('SELECT e.*, s.name site_name FROM experiments e LEFT JOIN sites s ON s.id=e.site_id WHERE e.site_id=? ORDER BY e.id DESC', [siteId]) : db.all('SELECT e.*, s.name site_name FROM experiments e LEFT JOIN sites s ON s.id=e.site_id ORDER BY e.id DESC');
  return c.json(rows.map(e => ({ ...experimentDetail(db, e.id), site_name: e.site_name })));
});
r.post('/experiments', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const siteId = int(b.siteId ?? b.site_id, { name: 'siteId', required: true }); assert(db.get('SELECT id FROM sites WHERE id=?', [siteId]), 'site not found', 404);
  const name = str(b.name, { name: 'name', required: true, max: 150 });
  const variants = Array.isArray(b.variants) && b.variants.length >= 2 ? b.variants : [{ name: 'A', description: 'Control', overrides: {} }, { name: 'B', description: 'Variant', overrides: b.overridesB || {} }];
  const id = db.transaction(() => {
    const res = db.run('INSERT INTO experiments(site_id,page_id,name,hypothesis,min_sample_size,created_by) VALUES(?,?,?,?,?,?)', [siteId, int(b.pageId ?? b.page_id, { name: 'pageId' }) ?? null, name, b.hypothesis || null, int(b.min_sample_size, { name: 'min_sample_size', min: 10 }) || 100, user(c).id]);
    for (const v of variants) db.run('INSERT INTO experiment_variants(experiment_id,name,description,weight,overrides) VALUES(?,?,?,?,?)', [res.lastInsertRowid, str(v.name, { max: 20, required: true }), v.description || null, int(v.weight, { name: 'weight', min: 0, max: 100 }) ?? 50, J(v.overrides || {})]);
    return res.lastInsertRowid;
  });
  logAction(c, 'EXPERIMENT_CREATE', 'experiment', id);
  return c.json(experimentDetail(db, id), 201);
});
function experimentDetail(db, id) {
  const e = db.get('SELECT * FROM experiments WHERE id=?', [id]); if (!e) return null;
  const variants = db.all('SELECT * FROM experiment_variants WHERE experiment_id=?', [id]).map(v => {
    const m = siteMetrics(db, e.site_id, { variantId: v.id });
    return { ...v, overrides: P(v.overrides, {}), metrics: { pv: m.pv, ctaViews: m.ctaViews, ctaClicks: m.ctaClicks, affiliateClicks: m.affiliateClicks, ctr: m.ctr, cv: m.cv, cvr: m.cvr, revenue: m.revenue } };
  });
  const totalPv = variants.reduce((a, v) => a + v.metrics.pv, 0);
  const sufficient = variants.every(v => v.metrics.pv >= e.min_sample_size);
  return { ...e, variants, totalPv, sufficientData: sufficient, verdict: sufficient ? 'データ十分: 指標を比較してください（統計的有意性は別途確認）' : `判断にはデータ不足（各バリアント ${e.min_sample_size} PV以上必要）` };
}
r.get('/experiments/:id', (c) => { const d = experimentDetail(getDb(), Number(c.req.param('id'))); return d ? c.json(d) : notFound(c, 'Experiment'); });
r.put('/experiments/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const e = db.get('SELECT * FROM experiments WHERE id=?', [c.req.param('id')]); if (!e) return notFound(c, 'Experiment');
  const status = b.status ? oneOf(b.status, ['draft', 'running', 'paused', 'completed'], 'status') : e.status;
  db.run('UPDATE experiments SET name=?,hypothesis=?,status=?,min_sample_size=?,started_at=?,ended_at=? WHERE id=?',
    [b.name ? str(b.name, { max: 150 }) : e.name, b.hypothesis ?? e.hypothesis, status, int(b.min_sample_size, { name: 'min_sample_size', min: 10 }) ?? e.min_sample_size,
      status === 'running' && !e.started_at ? new Date().toISOString() : e.started_at, status === 'completed' ? new Date().toISOString() : e.ended_at, e.id]);
  if (Array.isArray(b.variants)) for (const v of b.variants) if (v.id) db.run('UPDATE experiment_variants SET description=?, weight=?, overrides=? WHERE id=? AND experiment_id=?', [v.description ?? null, int(v.weight, { name: 'weight', min: 0, max: 100 }) ?? 50, J(v.overrides || {}), v.id, e.id]);
  logAction(c, 'EXPERIMENT_UPDATE', 'experiment', e.id, { status });
  return c.json(experimentDetail(db, e.id));
});
r.delete('/experiments/:id', requireAuth('editor'), (c) => { getDb().run('DELETE FROM experiments WHERE id=?', [c.req.param('id')]); return c.json({ ok: true }); });
r.post('/experiments/:id/analyze', requireAuth('editor'), async (c) => {
  const db = getDb(); const d = experimentDetail(db, Number(c.req.param('id'))); if (!d) return notFound(c, 'Experiment');
  const out = await ai.analyzeAbTest({ experiment: { name: d.name, hypothesis: d.hypothesis, min_sample_size: d.min_sample_size, status: d.status }, variants: d.variants.map(v => ({ name: v.name, description: v.description, metrics: v.metrics })), sufficientData: d.sufficientData });
  const analysisId = saveAnalysis(db, c, d.site_id, d.page_id, 'ab_test', out);
  if (!d.sufficientData) out.result.verdict = '判断にはデータ不足';
  return c.json({ analysisId, result: out.result, sufficientData: d.sufficientData, model: out.model, durationMs: out.durationMs });
});

// ---- Improvement history ----
r.get('/improvements', (c) => {
  const db = getDb(); const siteId = c.req.query('siteId');
  const rows = siteId ? db.all('SELECT * FROM improvement_history WHERE site_id=? ORDER BY id DESC', [siteId]) : db.all('SELECT h.*, s.name site_name FROM improvement_history h LEFT JOIN sites s ON s.id=h.site_id ORDER BY h.id DESC LIMIT 200');
  return c.json(rows.map(h => ({ ...h, change_summary: P(h.change_summary, {}), before_metrics: P(h.before_metrics, {}), after_metrics: P(h.after_metrics, null), before_snapshot: undefined, after_snapshot: undefined })));
});
r.get('/improvements/:id', (c) => { const h = getDb().get('SELECT * FROM improvement_history WHERE id=?', [c.req.param('id')]); return h ? c.json({ ...h, change_summary: P(h.change_summary, {}), before_metrics: P(h.before_metrics, {}), after_metrics: P(h.after_metrics, null), before_snapshot: P(h.before_snapshot, null), after_snapshot: P(h.after_snapshot, null) }) : notFound(c, 'Improvement'); });
// Capture "after" metrics now and run AI post-change analysis
r.post('/improvements/:id/analyze', requireAuth('editor'), async (c) => {
  const db = getDb(); const h = db.get('SELECT * FROM improvement_history WHERE id=?', [c.req.param('id')]); if (!h) return notFound(c, 'Improvement');
  const m = siteMetrics(db, h.site_id, { from: h.applied_at });
  const after = { pv: m.pv, ctr: m.ctr, cv: m.cv, cvr: m.cvr, revenue: m.revenue, byDevice: m.byDevice, capturedAt: new Date().toISOString(), since: h.applied_at };
  const out = await ai.analyzePostChange({ title: h.title, change: P(h.change_summary, {}), before: P(h.before_metrics, {}), after, note: '改善前は全期間の累積、改善後は適用日以降の集計。期間長が異なる点に注意。' });
  const analysisId = saveAnalysis(db, c, h.site_id, h.page_id, 'post_change', out);
  db.run('UPDATE improvement_history SET after_metrics=?, ai_post_analysis_id=? WHERE id=?', [J(after), analysisId, h.id]);
  return c.json({ analysisId, after, result: out.result, model: out.model, durationMs: out.durationMs });
});

export default r;
