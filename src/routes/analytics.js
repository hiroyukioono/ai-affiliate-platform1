import { Hono } from 'hono';
import { getDb, J, P } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { body, user, logAction, notFound } from '../lib/http.js';
import { str, int, oneOf, assert } from '../lib/security.js';
import { siteMetrics } from '../lib/metrics.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));

r.get('/overview', (c) => {
  const db = getDb();
  const sites = db.all('SELECT id, name, slug, status FROM sites ORDER BY id');
  const out = sites.map(s => ({ ...s, metrics: siteMetrics(db, s.id, { from: c.req.query('from'), to: c.req.query('to') }) }));
  const totals = out.reduce((a, s) => ({ pv: a.pv + s.metrics.pv, clicks: a.clicks + s.metrics.affiliateClicks, cv: a.cv + s.metrics.cv, revenue: a.revenue + s.metrics.revenue }), { pv: 0, clicks: 0, cv: 0, revenue: 0 });
  return c.json({ sites: out, totals });
});

r.get('/sites/:siteId', (c) => {
  const db = getDb(); const siteId = Number(c.req.param('siteId'));
  if (!db.get('SELECT id FROM sites WHERE id=?', [siteId])) return notFound(c, 'Site');
  return c.json(siteMetrics(db, siteId, { from: c.req.query('from'), to: c.req.query('to') }));
});

r.get('/sites/:siteId/events', (c) => {
  const db = getDb(); const siteId = Number(c.req.param('siteId'));
  const limit = Math.min(Number(c.req.query('limit') || 100), 1000);
  const type = c.req.query('type');
  const rows = type ? db.all('SELECT * FROM analytics_events WHERE site_id=? AND event_type=? ORDER BY id DESC LIMIT ?', [siteId, type, limit]) : db.all('SELECT * FROM analytics_events WHERE site_id=? ORDER BY id DESC LIMIT ?', [siteId, limit]);
  return c.json(rows.map(e => ({ ...e, meta: P(e.meta, {}) })));
});

r.get('/sites/:siteId/clicks', (c) => {
  const db = getDb();
  return c.json(db.all('SELECT k.*, a.name ad_name, p.title page_title FROM affiliate_clicks k LEFT JOIN affiliate_ads a ON a.id=k.ad_id LEFT JOIN site_pages p ON p.id=k.page_id WHERE k.site_id=? ORDER BY k.id DESC LIMIT 500', [c.req.param('siteId')]));
});

// Conversions
r.get('/conversions', (c) => {
  const db = getDb(); const siteId = c.req.query('siteId');
  const sql = 'SELECT v.*, a.name ad_name, s.name site_name, p.title page_title FROM conversions v LEFT JOIN affiliate_ads a ON a.id=v.ad_id LEFT JOIN sites s ON s.id=v.site_id LEFT JOIN site_pages p ON p.id=v.page_id';
  return c.json(siteId ? db.all(sql + ' WHERE v.site_id=? ORDER BY v.id DESC LIMIT 500', [siteId]) : db.all(sql + ' ORDER BY v.id DESC LIMIT 500'));
});
r.post('/conversions', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const siteId = int(b.site_id, { name: 'site_id', required: true });
  assert(db.get('SELECT id FROM sites WHERE id=?', [siteId]), 'site not found', 404);
  const device = oneOf(b.device || 'desktop', ['desktop', 'tablet', 'mobile'], 'device');
  const status = oneOf(b.status || 'approved', ['pending', 'approved', 'rejected'], 'status');
  const amount = Number(b.amount || 0); assert(Number.isFinite(amount) && amount >= 0, 'amount must be >= 0');
  let clickId = int(b.click_id, { name: 'click_id' }) ?? null; let pageId = int(b.page_id, { name: 'page_id' }) ?? null; let adId = int(b.ad_id, { name: 'ad_id' }) ?? null; let variantId = null;
  if (b.click_token) { const k = db.get('SELECT * FROM affiliate_clicks WHERE click_token=?', [String(b.click_token)]); if (k) { clickId = k.id; pageId = pageId ?? k.page_id; adId = adId ?? k.ad_id; variantId = k.variant_id; } }
  const id = db.transaction(() => {
    const res = db.run('INSERT INTO conversions(site_id,page_id,ad_id,click_id,device,variant_id,status,amount,note,occurred_at) VALUES(?,?,?,?,?,?,?,?,?,?)',
      [siteId, pageId, adId, clickId, device, variantId, status, amount, b.note || null, b.occurred_at || new Date().toISOString().replace('T', ' ').slice(0, 19)]);
    if (status === 'approved' && amount > 0 && b.create_revenue !== false) {
      db.run('INSERT INTO revenues(site_id,ad_id,conversion_id,device,variant_id,amount,currency,occurred_at,note) VALUES(?,?,?,?,?,?,?,?,?)', [siteId, adId, res.lastInsertRowid, device, variantId, amount, b.currency || 'JPY', b.occurred_at || new Date().toISOString().replace('T', ' ').slice(0, 19), 'auto from conversion']);
    }
    return res.lastInsertRowid;
  });
  logAction(c, 'CONVERSION_CREATE', 'conversion', id, { amount, status });
  return c.json(db.get('SELECT * FROM conversions WHERE id=?', [id]), 201);
});
r.put('/conversions/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const v = db.get('SELECT * FROM conversions WHERE id=?', [c.req.param('id')]); if (!v) return notFound(c, 'Conversion');
  const status = b.status ? oneOf(b.status, ['pending', 'approved', 'rejected'], 'status') : v.status;
  db.run('UPDATE conversions SET status=?, amount=?, note=? WHERE id=?', [status, b.amount !== undefined ? Number(b.amount) : v.amount, b.note ?? v.note, v.id]);
  logAction(c, 'CONVERSION_UPDATE', 'conversion', v.id, { status });
  return c.json(db.get('SELECT * FROM conversions WHERE id=?', [v.id]));
});
r.delete('/conversions/:id', requireAuth('admin'), (c) => { getDb().run('DELETE FROM conversions WHERE id=?', [c.req.param('id')]); return c.json({ ok: true }); });

// Revenue
r.get('/revenues', (c) => {
  const db = getDb(); const siteId = c.req.query('siteId');
  const sql = 'SELECT r.*, a.name ad_name, s.name site_name FROM revenues r LEFT JOIN affiliate_ads a ON a.id=r.ad_id LEFT JOIN sites s ON s.id=r.site_id';
  const rows = siteId ? db.all(sql + ' WHERE r.site_id=? ORDER BY r.id DESC LIMIT 500', [siteId]) : db.all(sql + ' ORDER BY r.id DESC LIMIT 500');
  const monthly = db.all("SELECT substr(occurred_at,1,7) month, device, SUM(amount) total FROM revenues " + (siteId ? 'WHERE site_id=? ' : '') + "GROUP BY month, device ORDER BY month", siteId ? [siteId] : []);
  return c.json({ rows, monthly });
});
r.post('/revenues', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const siteId = int(b.site_id, { name: 'site_id', required: true }); assert(db.get('SELECT id FROM sites WHERE id=?', [siteId]), 'site not found', 404);
  const amount = Number(b.amount); assert(Number.isFinite(amount), 'amount required');
  const res = db.run('INSERT INTO revenues(site_id,ad_id,conversion_id,device,amount,currency,occurred_at,note) VALUES(?,?,?,?,?,?,?,?)',
    [siteId, int(b.ad_id, { name: 'ad_id' }) ?? null, int(b.conversion_id, { name: 'conversion_id' }) ?? null, oneOf(b.device || 'desktop', ['desktop', 'tablet', 'mobile'], 'device'), amount, str(b.currency || 'JPY', { max: 5 }), b.occurred_at || new Date().toISOString().replace('T', ' ').slice(0, 19), b.note || null]);
  logAction(c, 'REVENUE_CREATE', 'revenue', res.lastInsertRowid, { amount });
  return c.json(db.get('SELECT * FROM revenues WHERE id=?', [res.lastInsertRowid]), 201);
});
r.delete('/revenues/:id', requireAuth('admin'), (c) => { getDb().run('DELETE FROM revenues WHERE id=?', [c.req.param('id')]); return c.json({ ok: true }); });

// Mobile dashboard
r.get('/mobile', (c) => {
  const db = getDb(); const siteId = c.req.query('siteId');
  const sites = siteId ? db.all('SELECT id,name FROM sites WHERE id=?', [siteId]) : db.all('SELECT id,name FROM sites');
  const per = sites.map(s => { const m = siteMetrics(db, s.id); return { site: s, mobile: m.byDevice.mobile, desktop: m.byDevice.desktop, tablet: m.byDevice.tablet, vitals: m.vitals }; });
  const tot = per.reduce((a, x) => ({ pv: a.pv + x.mobile.pv, clicks: a.clicks + x.mobile.affiliateClicks, cv: a.cv + x.mobile.cv, revenue: a.revenue + x.mobile.revenue }), { pv: 0, clicks: 0, cv: 0, revenue: 0 });
  const insights = db.all("SELECT id, site_id, analysis_type, result, created_at FROM ai_analysis WHERE analysis_type IN ('mobile','mobile_issues','responsive') ORDER BY id DESC LIMIT 5").map(x => ({ ...x, result: P(x.result, {}) }));
  const suggestions = db.all("SELECT id, site_id, title, description, priority, status, created_at FROM ai_recommendations WHERE category='MOBILE' ORDER BY id DESC LIMIT 10");
  return c.json({ totals: { ...tot, ctr: tot.pv ? Math.round(tot.clicks / tot.pv * 10000) / 100 : 0 }, sites: per, insights, suggestions });
});

export default r;
