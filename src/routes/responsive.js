import { Hono } from 'hono';
import { getDb, J, P } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { body, user, logAction, notFound } from '../lib/http.js';
import { str, assert } from '../lib/security.js';
import { ai } from '../ai/service.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));
const parse = (s) => s && ({ ...s, desktop_config: P(s.desktop_config, {}), tablet_config: P(s.tablet_config, {}), mobile_config: P(s.mobile_config, {}), breakpoints: P(s.breakpoints, {}) });

r.get('/', (c) => c.json(getDb().all('SELECT s.*, (SELECT COUNT(*) FROM sites x WHERE x.responsive_set_id=s.id) AS site_count FROM responsive_design_sets s ORDER BY s.id').map(parse)));
r.get('/:id', (c) => { const s = getDb().get('SELECT * FROM responsive_design_sets WHERE id=?', [c.req.param('id')]); return s ? c.json(parse(s)) : notFound(c, 'Responsive set'); });

r.post('/', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const name = str(b.name, { name: 'name', required: true, max: 100 });
  const bp = b.breakpoints && typeof b.breakpoints === 'object' ? b.breakpoints : { tablet: 1024, mobile: 767 };
  assert(Number(bp.mobile) < Number(bp.tablet), 'mobile breakpoint must be < tablet breakpoint');
  const res = db.run('INSERT INTO responsive_design_sets(name,description,desktop_config,tablet_config,mobile_config,breakpoints,created_by) VALUES(?,?,?,?,?,?,?)',
    [name, b.description || null, J(b.desktop_config || {}), J(b.tablet_config || {}), J(b.mobile_config || {}), J(bp), user(c).id]);
  logAction(c, 'RESPONSIVE_CREATE', 'responsive_design_set', res.lastInsertRowid);
  return c.json(parse(db.get('SELECT * FROM responsive_design_sets WHERE id=?', [res.lastInsertRowid])), 201);
});

r.put('/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const id = Number(c.req.param('id'));
  const s = db.get('SELECT * FROM responsive_design_sets WHERE id=?', [id]); if (!s) return notFound(c, 'Responsive set');
  const bp = b.breakpoints ? { ...P(s.breakpoints, {}), ...b.breakpoints } : P(s.breakpoints, {});
  db.run("UPDATE responsive_design_sets SET name=?,description=?,desktop_config=?,tablet_config=?,mobile_config=?,breakpoints=?,updated_at=datetime('now') WHERE id=?",
    [b.name ? str(b.name, { max: 100 }) : s.name, b.description ?? s.description, J(b.desktop_config ?? P(s.desktop_config, {})), J(b.tablet_config ?? P(s.tablet_config, {})), J(b.mobile_config ?? P(s.mobile_config, {})), J(bp), id]);
  logAction(c, 'RESPONSIVE_UPDATE', 'responsive_design_set', id);
  return c.json(parse(db.get('SELECT * FROM responsive_design_sets WHERE id=?', [id])));
});

r.post('/:id/duplicate', requireAuth('editor'), (c) => {
  const db = getDb(); const s = db.get('SELECT * FROM responsive_design_sets WHERE id=?', [c.req.param('id')]); if (!s) return notFound(c, 'Responsive set');
  const res = db.run('INSERT INTO responsive_design_sets(name,description,desktop_config,tablet_config,mobile_config,breakpoints,created_by) VALUES(?,?,?,?,?,?,?)',
    [`${s.name} (Copy)`, s.description, s.desktop_config, s.tablet_config, s.mobile_config, s.breakpoints, user(c).id]);
  return c.json(parse(db.get('SELECT * FROM responsive_design_sets WHERE id=?', [res.lastInsertRowid])), 201);
});

r.delete('/:id', requireAuth('editor'), (c) => {
  const db = getDb(); const id = Number(c.req.param('id'));
  const inUse = db.get('SELECT COUNT(*) n FROM sites WHERE responsive_set_id=?', [id]).n;
  assert(!inUse, `この設定は ${inUse} サイトで使用中のため削除できません`, 409);
  const res = db.run('DELETE FROM responsive_design_sets WHERE id=?', [id]); if (!res.changes) return notFound(c, 'Responsive set');
  logAction(c, 'RESPONSIVE_DELETE', 'responsive_design_set', id);
  return c.json({ ok: true });
});

// AI responsive analysis for a given site
r.post('/ai/analyze', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const site = db.get('SELECT * FROM sites WHERE id=?', [b.siteId]); assert(site, 'site not found', 404);
  const set = site.responsive_set_id ? parse(db.get('SELECT * FROM responsive_design_sets WHERE id=?', [site.responsive_set_id])) : null;
  const comps = db.all('SELECT c.id, c.type, c.props, c.desktop_config, c.tablet_config, c.mobile_config, c.sort_order, c.sort_order_mobile FROM site_components c JOIN site_pages p ON p.id=c.page_id WHERE p.site_id=? ORDER BY p.id, c.sort_order LIMIT 60', [site.id])
    .map(x => ({ id: x.id, type: x.type, props: P(x.props, {}), desktop: P(x.desktop_config, {}), tablet: P(x.tablet_config, {}), mobile: P(x.mobile_config, {}), order: x.sort_order, mobileOrder: x.sort_order_mobile }));
  const out = await ai.analyzeResponsive({ site: { name: site.name }, responsiveSet: set && { name: set.name, desktop: set.desktop_config, tablet: set.tablet_config, mobile: set.mobile_config, breakpoints: set.breakpoints }, components: comps });
  const res = db.run('INSERT INTO ai_analysis(site_id,analysis_type,input_summary,result,model,provider,duration_ms,created_by) VALUES(?,?,?,?,?,?,?,?)',
    [site.id, 'responsive', J(out.inputSummary), J(out.result), out.model, out.provider, out.durationMs, user(c).id]);
  return c.json({ analysisId: res.lastInsertRowid, result: out.result, model: out.model, durationMs: out.durationMs });
});

export default r;
