import { Hono } from 'hono';
import { getDb, J, P } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { body, user, logAction, notFound } from '../lib/http.js';
import { str, int, oneOf, assert, slugify, sanitizeHtml } from '../lib/security.js';
import { ai } from '../ai/service.js';
import { saveVersion } from '../lib/builder.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));
const parse = (a) => a && ({ ...a, outline: P(a.outline, []) });

r.get('/', (c) => {
  const siteId = c.req.query('siteId'); const db = getDb();
  const sql = 'SELECT a.*, c.name category_name FROM articles a LEFT JOIN categories c ON c.id=a.category_id';
  return c.json((siteId ? db.all(sql + ' WHERE a.site_id=? ORDER BY a.id DESC', [siteId]) : db.all(sql + ' ORDER BY a.id DESC')).map(parse));
});
r.get('/calendar', (c) => {
  const db = getDb();
  return c.json(db.all("SELECT a.id, a.site_id, a.title, a.status, a.scheduled_at, a.published_at, s.name site_name FROM articles a JOIN sites s ON s.id=a.site_id WHERE a.scheduled_at IS NOT NULL OR a.published_at IS NOT NULL ORDER BY COALESCE(a.scheduled_at, a.published_at)"));
});
r.get('/:id', (c) => { const a = getDb().get('SELECT * FROM articles WHERE id=?', [c.req.param('id')]); return a ? c.json(parse(a)) : notFound(c, 'Article'); });

r.post('/', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const siteId = int(b.site_id, { name: 'site_id', required: true });
  const title = str(b.title, { name: 'title', required: true, max: 200 });
  let slug = slugify(b.slug || title);
  if (db.get('SELECT id FROM articles WHERE site_id=? AND slug=?', [siteId, slug])) slug += '-' + Date.now().toString(36);
  const res = db.run('INSERT INTO articles(site_id,category_id,title,slug,outline,body_html,seo_title,meta_description,status,scheduled_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
    [siteId, int(b.category_id, { name: 'category_id' }) ?? null, title, slug, J(b.outline || []), b.body_html ? sanitizeHtml(b.body_html) : null, b.seo_title || null, b.meta_description || null, oneOf(b.status || 'draft', ['draft', 'scheduled', 'published'], 'status'), b.scheduled_at || null]);
  logAction(c, 'ARTICLE_CREATE', 'article', res.lastInsertRowid);
  return c.json(parse(db.get('SELECT * FROM articles WHERE id=?', [res.lastInsertRowid])), 201);
});

r.put('/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const a = db.get('SELECT * FROM articles WHERE id=?', [c.req.param('id')]); if (!a) return notFound(c, 'Article');
  const status = b.status ? oneOf(b.status, ['draft', 'scheduled', 'published'], 'status') : a.status;
  db.run("UPDATE articles SET title=?,category_id=?,outline=?,body_html=?,seo_title=?,meta_description=?,status=?,scheduled_at=?,published_at=?,updated_at=datetime('now') WHERE id=?",
    [b.title ? str(b.title, { max: 200 }) : a.title, b.category_id !== undefined ? (b.category_id || null) : a.category_id, b.outline ? J(b.outline) : a.outline, b.body_html !== undefined ? sanitizeHtml(b.body_html) : a.body_html,
      b.seo_title ?? a.seo_title, b.meta_description ?? a.meta_description, status, b.scheduled_at !== undefined ? b.scheduled_at : a.scheduled_at,
      status === 'published' && !a.published_at ? new Date().toISOString() : a.published_at, a.id]);
  logAction(c, 'ARTICLE_UPDATE', 'article', a.id);
  return c.json(parse(db.get('SELECT * FROM articles WHERE id=?', [a.id])));
});
r.delete('/:id', requireAuth('editor'), (c) => { getDb().run('DELETE FROM articles WHERE id=?', [c.req.param('id')]); logAction(c, 'ARTICLE_DELETE', 'article', Number(c.req.param('id'))); return c.json({ ok: true }); });

// Convert an article into a site page (creates page with article component)
r.post('/:id/to-page', requireAuth('editor'), async (c) => {
  const db = getDb(); const a = db.get('SELECT * FROM articles WHERE id=?', [c.req.param('id')]); if (!a) return notFound(c, 'Article');
  let slug = a.slug; if (db.get('SELECT id FROM site_pages WHERE site_id=? AND slug=?', [a.site_id, slug])) slug += '-' + Date.now().toString(36);
  const pageId = db.transaction(() => {
    const pr = db.run('INSERT INTO site_pages(site_id,title,slug,page_type,category_id,seo_title,meta_description,sort_order) VALUES(?,?,?,?,?,?,?,?)', [a.site_id, a.title, slug, 'article', a.category_id, a.seo_title, a.meta_description, 50]);
    db.run('INSERT INTO site_components(page_id,type,props,sort_order) VALUES(?,?,?,?)', [pr.lastInsertRowid, 'heading', J({ text: a.title, level: 1 }), 0]);
    db.run('INSERT INTO site_components(page_id,type,props,sort_order) VALUES(?,?,?,?)', [pr.lastInsertRowid, 'article', J({ articleId: a.id, html: a.body_html || '' }), 1]);
    db.run('UPDATE articles SET page_id=? WHERE id=?', [pr.lastInsertRowid, a.id]);
    saveVersion(db, a.site_id, pr.lastInsertRowid, 'manual', 'From article', user(c).id);
    return pr.lastInsertRowid;
  });
  return c.json({ ok: true, pageId });
});

// AI helpers
r.post('/ai/plan', requireAuth('editor'), async (c) => { const b = await body(c); const out = await ai.generateArticlePlan({ theme: b.theme, siteName: b.siteName, keywords: b.keywords }, int(b.count, { name: 'count', min: 1, max: 12 }) || 6); return c.json({ result: out.result, model: out.model, durationMs: out.durationMs }); });
r.post('/ai/headings', requireAuth('editor'), async (c) => { const b = await body(c); const out = await ai.generateHeadings({ title: str(b.title, { required: true, max: 200 }), keywords: b.keywords, intent: b.intent }); return c.json({ result: out.result, model: out.model, durationMs: out.durationMs }); });
r.post('/ai/content', requireAuth('editor'), async (c) => {
  const b = await body(c);
  const out = await ai.generateContent({ title: str(b.title, { required: true, max: 200 }), headings: b.headings || [], keywords: b.keywords || [], adTitle: b.adTitle, tone: b.tone || '丁寧でわかりやすい' });
  const html = sanitizeHtml(out.result.html || '');
  return c.json({ result: { ...out.result, html }, model: out.model, durationMs: out.durationMs });
});
r.post('/ai/seo-title', requireAuth('editor'), async (c) => { const b = await body(c); const out = await ai.generateSeoTitle({ title: b.title, keywords: b.keywords, intent: b.intent }); return c.json({ result: out.result, model: out.model, durationMs: out.durationMs }); });
r.post('/ai/meta-description', requireAuth('editor'), async (c) => { const b = await body(c); const out = await ai.generateMetaDescription({ title: b.title, keywords: b.keywords, summary: b.summary }); return c.json({ result: out.result, model: out.model, durationMs: out.durationMs }); });
r.post('/ai/categories', requireAuth('editor'), async (c) => { const b = await body(c); const out = await ai.generateCategories({ theme: b.theme, adTitle: b.adTitle }); return c.json({ result: out.result, model: out.model, durationMs: out.durationMs }); });

export default r;
