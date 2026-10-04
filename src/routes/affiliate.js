import { Hono } from 'hono';
import { getDb, J, P } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { body, user, logAction, notFound } from '../lib/http.js';
import { str, int, oneOf, assert, sha256 } from '../lib/security.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));

// ---- Programs ----
r.get('/programs', (c) => c.json(getDb().all('SELECT p.*, (SELECT COUNT(*) FROM affiliate_ads a WHERE a.program_id=p.id) ad_count, (SELECT COUNT(*) FROM affiliate_links l WHERE l.program_id=p.id) link_count FROM affiliate_programs p ORDER BY p.id')));
r.post('/programs', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const res = db.run('INSERT INTO affiliate_programs(name,provider,website,notes) VALUES(?,?,?,?)', [str(b.name, { name: 'name', required: true, max: 100 }), b.provider || null, b.website || null, b.notes || null]);
  logAction(c, 'PROGRAM_CREATE', 'affiliate_program', res.lastInsertRowid);
  return c.json(db.get('SELECT * FROM affiliate_programs WHERE id=?', [res.lastInsertRowid]), 201);
});
r.put('/programs/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const p = db.get('SELECT * FROM affiliate_programs WHERE id=?', [c.req.param('id')]); if (!p) return notFound(c, 'Program');
  db.run('UPDATE affiliate_programs SET name=?,provider=?,website=?,notes=? WHERE id=?', [b.name ? str(b.name, { max: 100 }) : p.name, b.provider ?? p.provider, b.website ?? p.website, b.notes ?? p.notes, p.id]);
  return c.json(db.get('SELECT * FROM affiliate_programs WHERE id=?', [p.id]));
});
r.delete('/programs/:id', requireAuth('editor'), (c) => { getDb().run('DELETE FROM affiliate_programs WHERE id=?', [c.req.param('id')]); return c.json({ ok: true }); });

// ---- Links ----
r.get('/links', (c) => {
  const siteId = c.req.query('siteId'); const db = getDb();
  const sql = 'SELECT l.*, p.name program_name, (SELECT COUNT(*) FROM affiliate_clicks k WHERE k.link_id=l.id) clicks FROM affiliate_links l LEFT JOIN affiliate_programs p ON p.id=l.program_id';
  return c.json(siteId ? db.all(sql + ' WHERE l.site_id=? ORDER BY l.id DESC', [siteId]) : db.all(sql + ' ORDER BY l.id DESC'));
});
r.post('/links', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const url = str(b.url, { name: 'url', required: true, max: 2000 }); assert(/^https?:\/\//i.test(url), 'url must start with http(s)://');
  const res = db.run('INSERT INTO affiliate_links(program_id,site_id,name,url,label) VALUES(?,?,?,?,?)', [int(b.program_id, { name: 'program_id' }) ?? null, int(b.site_id, { name: 'site_id' }) ?? null, str(b.name, { name: 'name', required: true, max: 100 }), url, b.label || null]);
  logAction(c, 'LINK_CREATE', 'affiliate_link', res.lastInsertRowid);
  return c.json(db.get('SELECT * FROM affiliate_links WHERE id=?', [res.lastInsertRowid]), 201);
});
r.put('/links/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const l = db.get('SELECT * FROM affiliate_links WHERE id=?', [c.req.param('id')]); if (!l) return notFound(c, 'Link');
  if (b.url) assert(/^https?:\/\//i.test(b.url), 'url must start with http(s)://');
  db.run('UPDATE affiliate_links SET name=?,url=?,label=?,program_id=? WHERE id=?', [b.name ? str(b.name, { max: 100 }) : l.name, b.url ?? l.url, b.label ?? l.label, b.program_id !== undefined ? (b.program_id || null) : l.program_id, l.id]);
  return c.json(db.get('SELECT * FROM affiliate_links WHERE id=?', [l.id]));
});
r.delete('/links/:id', requireAuth('editor'), (c) => { getDb().run('DELETE FROM affiliate_links WHERE id=?', [c.req.param('id')]); return c.json({ ok: true }); });

// ---- Ads (original code is immutable; integrity hash stored) ----
r.get('/ads', (c) => {
  const siteId = c.req.query('siteId'); const db = getDb();
  const sql = 'SELECT a.*, p.name program_name, (SELECT COUNT(*) FROM affiliate_clicks k WHERE k.ad_id=a.id) clicks, (SELECT COUNT(*) FROM conversions v WHERE v.ad_id=a.id) conversions FROM affiliate_ads a LEFT JOIN affiliate_programs p ON p.id=a.program_id';
  const rows = siteId ? db.all(sql + ' WHERE a.site_id=? OR a.site_id IS NULL ORDER BY a.id DESC', [siteId]) : db.all(sql + ' ORDER BY a.id DESC');
  return c.json(rows.map(a => ({ ...a, integrity_ok: sha256(a.original_code) === a.original_code_hash })));
});
r.get('/ads/:id', (c) => { const a = getDb().get('SELECT * FROM affiliate_ads WHERE id=?', [c.req.param('id')]); return a ? c.json({ ...a, integrity_ok: sha256(a.original_code) === a.original_code_hash }) : notFound(c, 'Ad'); });
r.post('/ads', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const code = str(b.original_code, { name: 'original_code', required: true, max: 20000 });
  const res = db.run('INSERT INTO affiliate_ads(program_id,site_id,name,ad_type,original_code,original_code_hash,width,height) VALUES(?,?,?,?,?,?,?,?)',
    [int(b.program_id, { name: 'program_id' }) ?? null, int(b.site_id, { name: 'site_id' }) ?? null, str(b.name, { name: 'name', required: true, max: 100 }), oneOf(b.ad_type || 'html', ['html', 'banner', 'text'], 'ad_type'), code, sha256(code), int(b.width, { name: 'width' }) ?? null, int(b.height, { name: 'height' }) ?? null]);
  logAction(c, 'AD_CREATE', 'affiliate_ad', res.lastInsertRowid, { name: b.name });
  return c.json(db.get('SELECT * FROM affiliate_ads WHERE id=?', [res.lastInsertRowid]), 201);
});
// Editing metadata only. Replacing original_code is allowed ONLY by explicit replace_code flag (admin re-paste), and re-hashes.
r.put('/ads/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const a = db.get('SELECT * FROM affiliate_ads WHERE id=?', [c.req.param('id')]); if (!a) return notFound(c, 'Ad');
  let code = a.original_code, hash = a.original_code_hash;
  if (b.replace_code === true && typeof b.original_code === 'string') { code = str(b.original_code, { max: 20000, required: true }); hash = sha256(code); }
  db.run("UPDATE affiliate_ads SET name=?,ad_type=?,width=?,height=?,is_active=?,program_id=?,original_code=?,original_code_hash=?,updated_at=datetime('now') WHERE id=?",
    [b.name ? str(b.name, { max: 100 }) : a.name, b.ad_type ? oneOf(b.ad_type, ['html', 'banner', 'text'], 'ad_type') : a.ad_type, b.width !== undefined ? int(b.width, { name: 'width' }) ?? null : a.width, b.height !== undefined ? int(b.height, { name: 'height' }) ?? null : a.height,
      b.is_active === undefined ? a.is_active : (b.is_active ? 1 : 0), b.program_id !== undefined ? (b.program_id || null) : a.program_id, code, hash, a.id]);
  logAction(c, 'AD_UPDATE', 'affiliate_ad', a.id, { codeReplaced: b.replace_code === true });
  return c.json(db.get('SELECT * FROM affiliate_ads WHERE id=?', [a.id]));
});
r.delete('/ads/:id', requireAuth('editor'), (c) => {
  const res = getDb().run('DELETE FROM affiliate_ads WHERE id=?', [c.req.param('id')]); if (!res.changes) return notFound(c, 'Ad');
  logAction(c, 'AD_DELETE', 'affiliate_ad', Number(c.req.param('id')));
  return c.json({ ok: true });
});

// ---- Products ----
r.get('/products', (c) => { const siteId = c.req.query('siteId'); const db = getDb(); const rows = siteId ? db.all('SELECT * FROM products WHERE site_id=? ORDER BY sort_order,id', [siteId]) : db.all('SELECT * FROM products ORDER BY id DESC'); return c.json(rows.map(p => ({ ...p, features: P(p.features, []) }))); });
r.post('/products', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const res = db.run('INSERT INTO products(site_id,name,description,price,features,image_url,affiliate_link_id,rating,sort_order) VALUES(?,?,?,?,?,?,?,?,?)',
    [int(b.site_id, { name: 'site_id', required: true }), str(b.name, { name: 'name', required: true, max: 150 }), b.description || null, b.price || null, J(b.features || []), b.image_url || null, int(b.affiliate_link_id, { name: 'affiliate_link_id' }) ?? null, b.rating != null ? Number(b.rating) : null, int(b.sort_order, { name: 'sort_order' }) ?? 0]);
  return c.json({ ...db.get('SELECT * FROM products WHERE id=?', [res.lastInsertRowid]), features: b.features || [] }, 201);
});
r.put('/products/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const p = db.get('SELECT * FROM products WHERE id=?', [c.req.param('id')]); if (!p) return notFound(c, 'Product');
  db.run('UPDATE products SET name=?,description=?,price=?,features=?,image_url=?,affiliate_link_id=?,rating=?,sort_order=? WHERE id=?',
    [b.name ? str(b.name, { max: 150 }) : p.name, b.description ?? p.description, b.price ?? p.price, b.features ? J(b.features) : p.features, b.image_url ?? p.image_url, b.affiliate_link_id !== undefined ? (b.affiliate_link_id || null) : p.affiliate_link_id, b.rating !== undefined ? b.rating : p.rating, b.sort_order ?? p.sort_order, p.id]);
  const n = db.get('SELECT * FROM products WHERE id=?', [p.id]); return c.json({ ...n, features: P(n.features, []) });
});
r.delete('/products/:id', requireAuth('editor'), (c) => { getDb().run('DELETE FROM products WHERE id=?', [c.req.param('id')]); return c.json({ ok: true }); });

export default r;
