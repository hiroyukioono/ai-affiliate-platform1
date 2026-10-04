import { Hono } from 'hono';
import { getDb, J, P } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { body, user, logAction, notFound } from '../lib/http.js';
import { str, int, oneOf, assert, slugify } from '../lib/security.js';
import { ai } from '../ai/service.js';
import { getPageSnapshot, saveVersion, applySnapshot, defaultComponents } from '../lib/builder.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));

// AI output may be a string / object instead of an array; normalize to string[]
const toStrArray = (v) => Array.isArray(v) ? v.map(x => typeof x === 'string' ? x : (x?.name || x?.keyword || JSON.stringify(x))).filter(Boolean).slice(0, 50) : typeof v === 'string' ? v.split(/[,、\n]/).map(x => x.trim()).filter(Boolean) : [];
const parseSite = (s) => s && ({ ...s, theme_summary: P(s.theme_summary, null), seo_keywords: P(s.seo_keywords, []), settings: P(s.settings, {}) });

r.get('/', (c) => {
  const db = getDb();
  const sites = db.all(`SELECT s.*, d.name AS design_name, m.name AS mobile_prompt_name,
      (SELECT COUNT(*) FROM site_pages p WHERE p.site_id=s.id) AS page_count,
      (SELECT COUNT(*) FROM analytics_events e WHERE e.site_id=s.id AND e.event_type='pageview') AS pv
    FROM sites s LEFT JOIN design_themes d ON d.id=s.design_theme_id LEFT JOIN mobile_design_prompts m ON m.id=s.mobile_prompt_id ORDER BY s.id DESC`);
  return c.json(sites.map(parseSite));
});

// AI: analyze ad title -> theme proposal (NOT saved as site yet; admin confirms)
r.post('/analyze-theme', requireAuth('editor'), async (c) => {
  const b = await body(c);
  const adTitle = str(b.adTitle, { name: 'adTitle', required: true, max: 200 });
  const db = getDb();
  const started = Date.now();
  const theme = await ai.analyzeSiteTheme(adTitle, { notes: b.notes || '' });
  const res = db.run('INSERT INTO ai_analysis(site_id,analysis_type,input_summary,result,model,provider,duration_ms,created_by) VALUES(?,?,?,?,?,?,?,?)',
    [null, 'theme', J(theme.inputSummary), J(theme.result), theme.model, theme.provider, Date.now() - started, user(c).id]);
  logAction(c, 'AI_THEME_ANALYSIS', 'ai_analysis', res.lastInsertRowid, { adTitle });
  return c.json({ analysisId: res.lastInsertRowid, adTitle, theme: theme.result, model: theme.model, durationMs: theme.durationMs });
});

// AI: generate structure from a confirmed theme (still preview, not saved)
r.post('/generate-structure', requireAuth('editor'), async (c) => {
  const b = await body(c);
  assert(b.theme && typeof b.theme === 'object', 'theme object required');
  const out = await ai.generateSiteStructure({ adTitle: b.adTitle, theme: b.theme });
  const pages = Array.isArray(out.result.pages) ? out.result.pages : [];
  return c.json({ pages, model: out.model, durationMs: out.durationMs });
});

// Create site (optionally with AI-generated pages/structure provided by admin after confirmation)
r.post('/', requireAuth('editor'), async (c) => {
  const b = await body(c);
  const name = str(b.name, { name: 'name', required: true, max: 120 });
  const db = getDb();
  let slug = slugify(b.slug || name);
  if (db.get('SELECT id FROM sites WHERE slug=?', [slug])) slug = `${slug}-${Date.now().toString(36)}`;
  const designId = int(b.design_theme_id, { name: 'design_theme_id' }) || db.get('SELECT id FROM design_themes WHERE is_active=1 ORDER BY id LIMIT 1')?.id || null;
  const mobileId = int(b.mobile_prompt_id, { name: 'mobile_prompt_id' }) || db.get("SELECT id FROM mobile_design_prompts WHERE status='ACTIVE' ORDER BY id LIMIT 1")?.id || null;
  const respId = int(b.responsive_set_id, { name: 'responsive_set_id' }) || db.get('SELECT id FROM responsive_design_sets ORDER BY id LIMIT 1')?.id || null;

  const siteId = db.transaction(() => {
    const res = db.run(`INSERT INTO sites(name,slug,ad_title,theme_summary,target_audience,seo_keywords,design_theme_id,mobile_prompt_id,responsive_set_id,settings,created_by)
      VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      [name, slug, b.ad_title || null, b.theme ? J(b.theme) : null, b.theme?.target_audience ? String(b.theme.target_audience).slice(0, 300) : null, J(toStrArray(b.theme?.seo_keywords)), designId, mobileId, respId, J(b.settings || {}), user(c).id]);
    const siteId = res.lastInsertRowid;
    db.run('INSERT INTO mobile_design_settings(site_id) VALUES(?)', [siteId]);
    // categories from theme
    for (const [i, cat] of (Array.isArray(b.theme?.categories) ? b.theme.categories : []).entries()) {
      if (!cat || typeof cat !== 'object' || !cat.name) continue;
      let cslug = slugify(cat.slug || cat.name);
      if (db.get('SELECT id FROM categories WHERE site_id=? AND slug=?', [siteId, cslug])) cslug += '-' + i;
      db.run('INSERT INTO categories(site_id,name,slug,description,sort_order) VALUES(?,?,?,?,?)', [siteId, String(cat.name).slice(0, 100), cslug, cat.description || null, i]);
    }
    // pages
    const pages = Array.isArray(b.pages) && b.pages.length ? b.pages : [{ title: name, slug: 'home', page_type: 'home', components: defaultComponents(name) }];
    let hasHome = false;
    pages.filter(pg => pg && typeof pg === 'object').forEach((pg, i) => {
      let pslug = slugify(pg.slug || pg.title || `page-${i}`);
      // AI output is normalized, never trusted: unknown page types fall back to 'page'
      let ptype = ['home', 'page', 'article', 'category'].includes(pg.page_type) ? pg.page_type : (/article|post|blog|記事/i.test(pg.page_type || '') ? 'article' : /categor/i.test(pg.page_type || '') ? 'category' : 'page');
      if (ptype === 'home' || i === 0) { if (!hasHome) { pslug = 'home'; ptype = 'home'; hasHome = true; } else ptype = 'page'; }
      if (db.get('SELECT id FROM site_pages WHERE site_id=? AND slug=?', [siteId, pslug])) pslug += '-' + i;
      const pr = db.run(`INSERT INTO site_pages(site_id,title,slug,page_type,seo_title,meta_description,sort_order) VALUES(?,?,?,?,?,?,?)`,
        [siteId, String(pg.title || name).slice(0, 200), pslug, ptype, pg.seo_title ? String(pg.seo_title).slice(0, 200) : null, pg.meta_description ? String(pg.meta_description).slice(0, 300) : null, i]);
      const pageId = pr.lastInsertRowid;
      const comps = Array.isArray(pg.components) && pg.components.length ? pg.components : defaultComponents(pg.title || name);
      comps.filter(cp => cp && typeof cp === 'object').forEach((cp, j) => {
        const type = ['heading', 'text', 'image', 'button', 'cta', 'affiliate_ad', 'product', 'comparison_table', 'ranking', 'article', 'faq', 'search', 'banner', 'spacer', 'divider', 'html', 'video'].includes(cp.type) ? cp.type : 'text';
        let props = cp.props && typeof cp.props === 'object' && !Array.isArray(cp.props) ? cp.props : {};
        if (type === 'text' && !props.html && !props.text) props = { html: `<p>${String(cp.content || cp.text || cp.props || '').replace(/[<>]/g, '')}</p>` };
        if (type === 'heading' && !props.text) props = { text: String(cp.text || cp.content || pg.title || name).slice(0, 200), level: Number(props.level) || 2 };
        const cfg = (o) => (o && typeof o === 'object' && !Array.isArray(o) ? o : {});
        db.run('INSERT INTO site_components(page_id,type,props,desktop_config,tablet_config,mobile_config,sort_order) VALUES(?,?,?,?,?,?,?)',
          [pageId, type, J(props), J(cfg(cp.desktop_config)), J(cfg(cp.tablet_config)), J(cfg(cp.mobile_config)), j]);
      });
      saveVersion(db, siteId, pageId, 'manual', 'Initial', user(c).id);
    });
    return siteId;
  });
  logAction(c, 'SITE_CREATE', 'site', siteId, { name, slug });
  return c.json(parseSite(db.get('SELECT * FROM sites WHERE id=?', [siteId])), 201);
});

r.get('/:id', (c) => {
  const db = getDb();
  const site = db.get('SELECT * FROM sites WHERE id=?', [c.req.param('id')]);
  if (!site) return notFound(c, 'Site');
  const pages = db.all('SELECT * FROM site_pages WHERE site_id=? ORDER BY sort_order, id', [site.id]);
  const categories = db.all('SELECT * FROM categories WHERE site_id=? ORDER BY sort_order, id', [site.id]);
  const mobile = db.get('SELECT * FROM mobile_design_settings WHERE site_id=?', [site.id]);
  return c.json({ ...parseSite(site), pages, categories, mobile_settings: mobile ? { ...mobile, visibility: P(mobile.visibility, {}), extra: P(mobile.extra, {}) } : null });
});

r.put('/:id', requireAuth('editor'), async (c) => {
  const db = getDb(); const id = Number(c.req.param('id')); const b = await body(c);
  const site = db.get('SELECT * FROM sites WHERE id=?', [id]); if (!site) return notFound(c, 'Site');
  const name = b.name !== undefined ? str(b.name, { name: 'name', max: 120, required: true }) : site.name;
  const fields = {
    name, ad_title: b.ad_title ?? site.ad_title, target_audience: b.target_audience ?? site.target_audience,
    seo_keywords: b.seo_keywords ? J(toStrArray(b.seo_keywords)) : site.seo_keywords,
    design_theme_id: b.design_theme_id !== undefined ? int(b.design_theme_id, { name: 'design_theme_id' }) ?? null : site.design_theme_id,
    mobile_prompt_id: b.mobile_prompt_id !== undefined ? int(b.mobile_prompt_id, { name: 'mobile_prompt_id' }) ?? null : site.mobile_prompt_id,
    responsive_set_id: b.responsive_set_id !== undefined ? int(b.responsive_set_id, { name: 'responsive_set_id' }) ?? null : site.responsive_set_id,
    settings: b.settings ? J({ ...P(site.settings, {}), ...b.settings }) : site.settings,
    status: b.status ? oneOf(b.status, ['draft', 'published', 'archived'], 'status') : site.status
  };
  db.run(`UPDATE sites SET name=?,ad_title=?,target_audience=?,seo_keywords=?,design_theme_id=?,mobile_prompt_id=?,responsive_set_id=?,settings=?,status=?,updated_at=datetime('now') WHERE id=?`,
    [fields.name, fields.ad_title, fields.target_audience, fields.seo_keywords, fields.design_theme_id, fields.mobile_prompt_id, fields.responsive_set_id, fields.settings, fields.status, id]);
  logAction(c, 'SITE_UPDATE', 'site', id, Object.keys(b));
  return c.json(parseSite(db.get('SELECT * FROM sites WHERE id=?', [id])));
});

r.delete('/:id', requireAuth('admin'), (c) => {
  const db = getDb(); const id = Number(c.req.param('id'));
  const res = db.run('DELETE FROM sites WHERE id=?', [id]);
  if (!res.changes) return notFound(c, 'Site');
  logAction(c, 'SITE_DELETE', 'site', id);
  return c.json({ ok: true });
});

// Mobile settings
r.put('/:id/mobile-settings', requireAuth('editor'), async (c) => {
  const db = getDb(); const id = Number(c.req.param('id')); const b = await body(c);
  if (!db.get('SELECT id FROM sites WHERE id=?', [id])) return notFound(c, 'Site');
  const cols = ['font_size', 'line_height', 'margin', 'padding', 'width', 'height', 'display', 'position', 'image_size', 'button_size', 'cta_width', 'card_layout', 'table_layout', 'navigation'];
  const cur = db.get('SELECT * FROM mobile_design_settings WHERE site_id=?', [id]) || {};
  const vals = cols.map(k => b[k] !== undefined ? str(String(b[k]), { name: k, max: 100 }) : cur[k] ?? null);
  db.run(`INSERT INTO mobile_design_settings(site_id,${cols.join(',')},visibility,extra,updated_at) VALUES(?,${cols.map(() => '?').join(',')},?,?,datetime('now'))
          ON CONFLICT(site_id) DO UPDATE SET ${cols.map(k => `${k}=excluded.${k}`).join(',')}, visibility=excluded.visibility, extra=excluded.extra, updated_at=excluded.updated_at`,
    [id, ...vals, J(b.visibility ?? P(cur.visibility, {})), J(b.extra ?? P(cur.extra, {}))]);
  logAction(c, 'MOBILE_SETTINGS_UPDATE', 'site', id);
  const m = db.get('SELECT * FROM mobile_design_settings WHERE site_id=?', [id]);
  return c.json({ ...m, visibility: P(m.visibility, {}), extra: P(m.extra, {}) });
});

// Publish: copies current draft state to a publish version and marks site published
r.post('/:id/publish', requireAuth('editor'), async (c) => {
  const db = getDb(); const id = Number(c.req.param('id'));
  const site = db.get('SELECT * FROM sites WHERE id=?', [id]); if (!site) return notFound(c, 'Site');
  const pages = db.all('SELECT id FROM site_pages WHERE site_id=?', [id]);
  const versions = db.transaction(() => {
    const vs = [];
    for (const p of pages) {
      const v = saveVersion(db, id, p.id, 'publish', 'Publish', user(c).id);
      db.run("UPDATE site_pages SET status='published', updated_at=datetime('now') WHERE id=?", [p.id]);
      vs.push({ pageId: p.id, ...v });
    }
    db.run("UPDATE sites SET status='published', published_version_id=?, updated_at=datetime('now') WHERE id=?", [vs[0]?.id || null, id]);
    return vs;
  });
  logAction(c, 'SITE_PUBLISH', 'site', id, { versions });
  return c.json({ ok: true, status: 'published', versions, url: `/s/${site.slug}/` });
});
r.post('/:id/unpublish', requireAuth('editor'), (c) => {
  const db = getDb(); const id = Number(c.req.param('id'));
  db.run("UPDATE sites SET status='draft', updated_at=datetime('now') WHERE id=?", [id]);
  db.run("UPDATE site_pages SET status='draft' WHERE site_id=?", [id]);
  logAction(c, 'SITE_UNPUBLISH', 'site', id);
  return c.json({ ok: true, status: 'draft' });
});

// ---- Pages ----
r.post('/:id/pages', requireAuth('editor'), async (c) => {
  const db = getDb(); const siteId = Number(c.req.param('id')); const b = await body(c);
  if (!db.get('SELECT id FROM sites WHERE id=?', [siteId])) return notFound(c, 'Site');
  const title = str(b.title, { name: 'title', required: true, max: 200 });
  let slug = slugify(b.slug || title);
  if (db.get('SELECT id FROM site_pages WHERE site_id=? AND slug=?', [siteId, slug])) slug += '-' + Date.now().toString(36);
  const pageType = oneOf(b.page_type || 'page', ['home', 'page', 'article', 'category'], 'page_type');
  const pageId = db.transaction(() => {
    const pr = db.run('INSERT INTO site_pages(site_id,title,slug,page_type,category_id,seo_title,meta_description,sort_order) VALUES(?,?,?,?,?,?,?,?)',
      [siteId, title, slug, pageType, int(b.category_id, { name: 'category_id' }) ?? null, b.seo_title || null, b.meta_description || null, int(b.sort_order, { name: 'sort_order' }) ?? 99]);
    const pid = pr.lastInsertRowid;
    const comps = Array.isArray(b.components) && b.components.length ? b.components : defaultComponents(title);
    comps.forEach((cp, j) => db.run('INSERT INTO site_components(page_id,type,props,desktop_config,tablet_config,mobile_config,sort_order) VALUES(?,?,?,?,?,?,?)',
      [pid, cp.type || 'text', J(cp.props || {}), J(cp.desktop_config || {}), J(cp.tablet_config || {}), J(cp.mobile_config || {}), j]));
    saveVersion(db, siteId, pid, 'manual', 'Page created', user(c).id);
    return pid;
  });
  logAction(c, 'PAGE_CREATE', 'site_page', pageId, { siteId, slug });
  return c.json(db.get('SELECT * FROM site_pages WHERE id=?', [pageId]), 201);
});

r.put('/:id/pages/:pageId', requireAuth('editor'), async (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId')); const b = await body(c);
  const p = db.get('SELECT * FROM site_pages WHERE id=? AND site_id=?', [pageId, c.req.param('id')]); if (!p) return notFound(c, 'Page');
  const title = b.title !== undefined ? str(b.title, { name: 'title', max: 200, required: true }) : p.title;
  const robots = b.robots !== undefined ? str(b.robots, { name: 'robots', max: 60 }) : p.robots;
  db.run(`UPDATE site_pages SET title=?,seo_title=?,meta_description=?,canonical_url=?,robots=?,og_image=?,structured_data=?,category_id=?,sort_order=?,updated_at=datetime('now') WHERE id=?`,
    [title, b.seo_title ?? p.seo_title, b.meta_description ?? p.meta_description, b.canonical_url ?? p.canonical_url, robots, b.og_image ?? p.og_image,
      b.structured_data !== undefined ? (b.structured_data ? J(b.structured_data) : null) : p.structured_data, b.category_id !== undefined ? int(b.category_id, { name: 'category_id' }) ?? null : p.category_id,
      b.sort_order !== undefined ? int(b.sort_order, { name: 'sort_order' }) : p.sort_order, pageId]);
  logAction(c, 'PAGE_UPDATE', 'site_page', pageId);
  return c.json(db.get('SELECT * FROM site_pages WHERE id=?', [pageId]));
});

r.delete('/:id/pages/:pageId', requireAuth('editor'), (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  const p = db.get('SELECT * FROM site_pages WHERE id=? AND site_id=?', [pageId, c.req.param('id')]); if (!p) return notFound(c, 'Page');
  assert(p.slug !== 'home', 'ホームページは削除できません');
  db.run('DELETE FROM site_pages WHERE id=?', [pageId]);
  logAction(c, 'PAGE_DELETE', 'site_page', pageId);
  return c.json({ ok: true });
});

// ---- Categories ----
r.post('/:id/categories', requireAuth('editor'), async (c) => {
  const db = getDb(); const siteId = Number(c.req.param('id')); const b = await body(c);
  const name = str(b.name, { name: 'name', required: true, max: 100 });
  let slug = slugify(b.slug || name);
  if (db.get('SELECT id FROM categories WHERE site_id=? AND slug=?', [siteId, slug])) slug += '-' + Date.now().toString(36);
  const res = db.run('INSERT INTO categories(site_id,name,slug,description,sort_order) VALUES(?,?,?,?,?)', [siteId, name, slug, b.description || null, int(b.sort_order, { name: 'sort_order' }) ?? 0]);
  logAction(c, 'CATEGORY_CREATE', 'category', res.lastInsertRowid);
  return c.json(db.get('SELECT * FROM categories WHERE id=?', [res.lastInsertRowid]), 201);
});
r.put('/:id/categories/:catId', requireAuth('editor'), async (c) => {
  const db = getDb(); const b = await body(c); const catId = Number(c.req.param('catId'));
  const cat = db.get('SELECT * FROM categories WHERE id=? AND site_id=?', [catId, c.req.param('id')]); if (!cat) return notFound(c, 'Category');
  db.run('UPDATE categories SET name=?,description=?,sort_order=? WHERE id=?', [b.name ? str(b.name, { max: 100 }) : cat.name, b.description ?? cat.description, int(b.sort_order, { name: 'sort_order' }) ?? cat.sort_order, catId]);
  return c.json(db.get('SELECT * FROM categories WHERE id=?', [catId]));
});
r.delete('/:id/categories/:catId', requireAuth('editor'), (c) => {
  getDb().run('DELETE FROM categories WHERE id=? AND site_id=?', [c.req.param('catId'), c.req.param('id')]);
  return c.json({ ok: true });
});

// ---- Site-level snapshot export (used by AI and preview) ----
r.get('/:id/snapshot', (c) => {
  const db = getDb(); const siteId = Number(c.req.param('id'));
  const pages = db.all('SELECT id FROM site_pages WHERE site_id=? ORDER BY sort_order', [siteId]);
  return c.json(pages.map(p => getPageSnapshot(db, p.id)));
});

export default r;
