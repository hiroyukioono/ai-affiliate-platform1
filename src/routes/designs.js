import { Hono } from 'hono';
import { getDb, J, P } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { body, user, logAction, notFound } from '../lib/http.js';
import { str, int, oneOf, assert } from '../lib/security.js';
import { ai } from '../ai/service.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));

// Build CSS from tokens (same generator as seed). Values are sanitized to prevent CSS injection.
const safeCss = (v) => String(v ?? '').replace(/[{};<>]/g, '').slice(0, 200);
export function cssFromTokens(t) {
  const g = (k, d) => safeCss(t[k] ?? d);
  return `:root{--c-primary:${g('primary', '#2563eb')};--c-secondary:${g('secondary', '#1e40af')};--c-accent:${g('accent', '#3b82f6')};--c-bg:${g('bg', '#ffffff')};--c-surface:${g('surface', '#ffffff')};--c-text:${g('text', '#111827')};--c-muted:${g('muted', '#6b7280')};--radius:${g('radius', '8px')};--font-base:${g('font', 'system-ui,sans-serif')};--font-head:${g('fontHead', 'inherit')};--max-w:${g('maxWidth', '1100px')}}
body{font-family:var(--font-base);background:var(--c-bg);color:var(--c-text)}
h1,h2,h3{font-family:var(--font-head)}
.site-header{background:${g('headerBg', '#ffffff')};color:${g('headerText', '#111827')}}
.btn-primary,.cta-button{background:var(--c-primary);color:#fff;border-radius:var(--radius)}
.cta-box{background:var(--c-surface);border:2px solid var(--c-accent);border-radius:var(--radius)}
.card{background:var(--c-surface);border-radius:var(--radius);box-shadow:${g('shadow', '0 2px 8px rgba(0,0,0,.06)')}}
.site-footer{background:${g('footerBg', '#111827')};color:${g('footerText', '#f3f4f6')}}`;
}

const parse = (d) => d && ({ ...d, tokens: P(d.tokens, {}) });

r.get('/', (c) => c.json(getDb().all('SELECT d.*, (SELECT COUNT(*) FROM sites s WHERE s.design_theme_id=d.id) AS site_count FROM design_themes d ORDER BY d.id').map(parse)));
r.get('/:id', (c) => { const d = getDb().get('SELECT * FROM design_themes WHERE id=?', [c.req.param('id')]); return d ? c.json(parse(d)) : notFound(c, 'Design'); });
r.get('/:id/versions', (c) => c.json(getDb().all('SELECT id,version,note,created_at FROM design_versions WHERE design_theme_id=? ORDER BY version DESC', [c.req.param('id')])));

r.post('/', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const name = str(b.name, { name: 'name', required: true, max: 100 });
  const tokens = b.tokens && typeof b.tokens === 'object' ? b.tokens : {};
  const css = typeof b.css === 'string' && b.css.trim() && !b.regenerateCss ? b.css.slice(0, 20000) : cssFromTokens(tokens);
  const res = db.run('INSERT INTO design_themes(name,description,category,tokens,css,created_by) VALUES(?,?,?,?,?,?)', [name, b.description || null, str(b.category || 'custom', { max: 50 }), J(tokens), css, user(c).id]);
  db.run('INSERT INTO design_versions(design_theme_id,version,tokens,css,note,created_by) VALUES(?,?,?,?,?,?)', [res.lastInsertRowid, 1, J(tokens), css, 'Created', user(c).id]);
  logAction(c, 'DESIGN_CREATE', 'design_theme', res.lastInsertRowid);
  return c.json(parse(db.get('SELECT * FROM design_themes WHERE id=?', [res.lastInsertRowid])), 201);
});

r.put('/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const id = Number(c.req.param('id'));
  const d = db.get('SELECT * FROM design_themes WHERE id=?', [id]); if (!d) return notFound(c, 'Design');
  const tokens = b.tokens && typeof b.tokens === 'object' ? { ...P(d.tokens, {}), ...b.tokens } : P(d.tokens, {});
  const css = typeof b.css === 'string' && b.css.trim() && !b.regenerateCss ? b.css.slice(0, 20000) : cssFromTokens(tokens);
  const version = d.current_version + 1;
  db.transaction(() => {
    db.run("UPDATE design_themes SET name=?,description=?,category=?,tokens=?,css=?,is_active=?,current_version=?,updated_at=datetime('now') WHERE id=?",
      [b.name ? str(b.name, { max: 100 }) : d.name, b.description ?? d.description, b.category ? str(b.category, { max: 50 }) : d.category, J(tokens), css, b.is_active === undefined ? d.is_active : (b.is_active ? 1 : 0), version, id]);
    db.run('INSERT INTO design_versions(design_theme_id,version,tokens,css,note,created_by) VALUES(?,?,?,?,?,?)', [id, version, J(tokens), css, b.note || 'Updated', user(c).id]);
  });
  logAction(c, 'DESIGN_UPDATE', 'design_theme', id, { version });
  return c.json(parse(db.get('SELECT * FROM design_themes WHERE id=?', [id])));
});

r.post('/:id/duplicate', requireAuth('editor'), (c) => {
  const db = getDb(); const d = db.get('SELECT * FROM design_themes WHERE id=?', [c.req.param('id')]); if (!d) return notFound(c, 'Design');
  const res = db.run('INSERT INTO design_themes(name,description,category,tokens,css,created_by) VALUES(?,?,?,?,?,?)', [`${d.name} (Copy)`, d.description, d.category, d.tokens, d.css, user(c).id]);
  db.run('INSERT INTO design_versions(design_theme_id,version,tokens,css,note,created_by) VALUES(?,?,?,?,?,?)', [res.lastInsertRowid, 1, d.tokens, d.css, `Duplicated from #${d.id}`, user(c).id]);
  logAction(c, 'DESIGN_DUPLICATE', 'design_theme', res.lastInsertRowid, { from: d.id });
  return c.json(parse(db.get('SELECT * FROM design_themes WHERE id=?', [res.lastInsertRowid])), 201);
});

r.post('/:id/rollback/:vid', requireAuth('editor'), (c) => {
  const db = getDb(); const id = Number(c.req.param('id'));
  const v = db.get('SELECT * FROM design_versions WHERE id=? AND design_theme_id=?', [c.req.param('vid'), id]); if (!v) return notFound(c, 'Version');
  const d = db.get('SELECT * FROM design_themes WHERE id=?', [id]);
  const nv = d.current_version + 1;
  db.run("UPDATE design_themes SET tokens=?,css=?,current_version=?,updated_at=datetime('now') WHERE id=?", [v.tokens, v.css, nv, id]);
  db.run('INSERT INTO design_versions(design_theme_id,version,tokens,css,note,created_by) VALUES(?,?,?,?,?,?)', [id, nv, v.tokens, v.css, `Rollback to v${v.version}`, user(c).id]);
  return c.json(parse(db.get('SELECT * FROM design_themes WHERE id=?', [id])));
});

r.delete('/:id', requireAuth('editor'), (c) => {
  const db = getDb(); const id = Number(c.req.param('id'));
  const d = db.get('SELECT * FROM design_themes WHERE id=?', [id]); if (!d) return notFound(c, 'Design');
  const inUse = db.get('SELECT COUNT(*) n FROM sites WHERE design_theme_id=?', [id]).n;
  assert(!inUse, `このデザインは ${inUse} サイトで使用中のため削除できません`, 409);
  db.run('DELETE FROM design_themes WHERE id=?', [id]);
  logAction(c, 'DESIGN_DELETE', 'design_theme', id);
  return c.json({ ok: true });
});

// AI: design suggestion for a site / AI design generation (saved as new theme only after confirm -> POST /)
r.post('/ai/suggest', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const themes = db.all('SELECT name, category, description FROM design_themes WHERE is_active=1');
  const out = await ai.suggestDesign({ siteTheme: b.theme || b.adTitle || '', available_themes: themes });
  return c.json({ result: out.result, model: out.model, durationMs: out.durationMs });
});
r.post('/ai/generate', requireAuth('editor'), async (c) => {
  const b = await body(c);
  const out = await ai.generateDesign({ brief: str(b.brief, { name: 'brief', required: true, max: 2000 }) });
  const tokens = out.result.tokens || {};
  return c.json({ result: { ...out.result, css: cssFromTokens(tokens) }, model: out.model, durationMs: out.durationMs });
});

export default r;
