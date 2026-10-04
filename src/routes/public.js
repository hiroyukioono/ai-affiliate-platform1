// Public site routes: /s/:slug/..., tracking /t/*, redirect /go/*
import { Hono } from 'hono';
import { getDb, P } from '../db/index.js';
import { renderPage, renderSitemap, renderRobots, renderFeed } from '../render/site.js';
import { escapeHtml as e } from '../lib/security.js';
import { randomToken, rateLimit } from '../lib/security.js';
import { getCookie, setCookie } from 'hono/cookie';

const r = new Hono();

function baseUrl(c) { const u = new URL(c.req.url); return `${c.req.header('x-forwarded-proto') || u.protocol.replace(':', '')}://${c.req.header('x-forwarded-host') || u.host}`; }

export function loadSiteContext(db, site, { preview = false } = {}) {
  const pages = db.all('SELECT * FROM site_pages WHERE site_id=? ORDER BY sort_order, id', [site.id]);
  const design = site.design_theme_id ? db.get('SELECT * FROM design_themes WHERE id=?', [site.design_theme_id]) : null;
  const respRow = site.responsive_set_id ? db.get('SELECT * FROM responsive_design_sets WHERE id=?', [site.responsive_set_id]) : null;
  const responsive = respRow ? { desktop_config: P(respRow.desktop_config, {}), tablet_config: P(respRow.tablet_config, {}), mobile_config: P(respRow.mobile_config, {}), breakpoints: P(respRow.breakpoints, { tablet: 1024, mobile: 767 }) } : null;
  const mobileSettings = db.get('SELECT * FROM mobile_design_settings WHERE site_id=?', [site.id]) || null;
  const ads = new Map(db.all('SELECT * FROM affiliate_ads WHERE site_id=? OR site_id IS NULL', [site.id]).map(x => [x.id, x]));
  const products = new Map(db.all('SELECT * FROM products WHERE site_id=?', [site.id]).map(x => [x.id, { ...x, features: P(x.features, []) }]));
  const articles = new Map(db.all('SELECT id, body_html FROM articles WHERE site_id=?', [site.id]).map(x => [x.id, x]));
  const categories = db.all('SELECT * FROM categories WHERE site_id=? ORDER BY sort_order', [site.id]);
  return { pages, design, responsive, mobileSettings, ads, products, articles, categories };
}

// Published components come from the latest publish version snapshot (draft edits are not public until Publish)
function publishedComponents(db, pageId) {
  const v = db.get("SELECT snapshot FROM builder_versions WHERE page_id=? AND kind='publish' ORDER BY id DESC LIMIT 1", [pageId]);
  if (!v) return null;
  const snap = P(v.snapshot, null);
  return snap ? { components: snap.components || [], page: snap.page } : null;
}

function pickVariant(c, db, site, pageId) {
  const exp = db.get("SELECT * FROM experiments WHERE site_id=? AND status='running' AND (page_id IS NULL OR page_id=?) ORDER BY id DESC LIMIT 1", [site.id, pageId]);
  if (!exp) return null;
  const variants = db.all('SELECT * FROM experiment_variants WHERE experiment_id=? ORDER BY id', [exp.id]);
  if (!variants.length) return null;
  const cookieName = `aap_exp_${exp.id}`;
  const existing = Number(getCookie(c, cookieName));
  let v = variants.find(x => x.id === existing);
  if (!v) {
    const total = variants.reduce((a, x) => a + x.weight, 0) || 1; let roll = Math.random() * total;
    v = variants.find(x => (roll -= x.weight) <= 0) || variants[0];
    setCookie(c, cookieName, String(v.id), { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'Lax', httpOnly: false });
  }
  return { ...v, overrides: P(v.overrides, {}), experimentId: exp.id };
}

r.get('/s/:slug/sitemap.xml', (c) => {
  const db = getDb(); const site = db.get("SELECT * FROM sites WHERE slug=? AND status='published'", [c.req.param('slug')]); if (!site) return c.text('Not found', 404);
  const pages = db.all("SELECT * FROM site_pages WHERE site_id=? AND status='published' ORDER BY sort_order", [site.id]);
  return c.body(renderSitemap(site, pages, baseUrl(c)), 200, { 'Content-Type': 'application/xml; charset=utf-8' });
});
r.get('/s/:slug/robots.txt', (c) => { const site = getDb().get('SELECT * FROM sites WHERE slug=?', [c.req.param('slug')]); if (!site) return c.text('Not found', 404); return c.text(renderRobots(site, baseUrl(c))); });
r.get('/s/:slug/feed.xml', (c) => {
  const db = getDb(); const site = db.get("SELECT * FROM sites WHERE slug=? AND status='published'", [c.req.param('slug')]); if (!site) return c.text('Not found', 404);
  return c.body(renderFeed(site, db.all("SELECT * FROM site_pages WHERE site_id=? AND status='published'", [site.id]), baseUrl(c)), 200, { 'Content-Type': 'application/rss+xml; charset=utf-8' });
});
r.get('/s/:slug/search', (c) => {
  const db = getDb(); const site = db.get("SELECT * FROM sites WHERE slug=? AND status='published'", [c.req.param('slug')]); if (!site) return c.text('Not found', 404);
  const q = String(c.req.query('q') || '').slice(0, 100);
  const rows = q ? db.all("SELECT title, slug, meta_description FROM site_pages WHERE site_id=? AND status='published' AND (title LIKE ? OR meta_description LIKE ?) LIMIT 30", [site.id, `%${q}%`, `%${q}%`]) : [];
  return c.html(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>検索: ${e(q)} | ${e(site.name)}</title><style>body{font-family:system-ui;max-width:800px;margin:0 auto;padding:1rem;line-height:1.7}a{color:#2563eb}</style></head><body><h1>「${e(q)}」の検索結果 (${rows.length})</h1><ul>${rows.map(p => `<li><a href="/s/${e(site.slug)}/${p.slug === 'home' ? '' : e(p.slug)}">${e(p.title)}</a><br><small>${e(p.meta_description || '')}</small></li>`).join('')}</ul><p><a href="/s/${e(site.slug)}/">← ${e(site.name)} トップへ</a></p></body></html>`);
});
r.get('/s/:slug/category/:cat', (c) => {
  const db = getDb(); const site = db.get("SELECT * FROM sites WHERE slug=? AND status='published'", [c.req.param('slug')]); if (!site) return c.text('Not found', 404);
  const cat = db.get('SELECT * FROM categories WHERE site_id=? AND slug=?', [site.id, c.req.param('cat')]); if (!cat) return c.text('Not found', 404);
  const pages = db.all("SELECT * FROM site_pages WHERE site_id=? AND status='published' AND category_id=?", [site.id, cat.id]);
  return c.html(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(cat.name)} | ${e(site.name)}</title><meta name="description" content="${e(cat.description || '')}"><link rel="canonical" href="${e(baseUrl(c))}/s/${e(site.slug)}/category/${e(cat.slug)}"><style>body{font-family:system-ui;max-width:800px;margin:0 auto;padding:1rem;line-height:1.7}a{color:#2563eb}</style></head><body><h1>${e(cat.name)}</h1><p>${e(cat.description || '')}</p><ul>${pages.map(p => `<li><a href="/s/${e(site.slug)}/${e(p.slug)}">${e(p.title)}</a></li>`).join('') || '<li>記事はまだありません</li>'}</ul><p><a href="/s/${e(site.slug)}/">← トップへ</a></p></body></html>`);
});

// Published page (explicit routes: Hono does not match a trailing slash with an optional param)
r.get('/s/:slug', (c) => c.redirect(`/s/${c.req.param('slug')}/`, 301));
r.get('/s/:slug/', (c) => renderPublic(c, c.req.param('slug'), 'home'));
r.get('/s/:slug/:page', (c) => renderPublic(c, c.req.param('slug'), c.req.param('page')));
function renderPublic(c, slug, pslug) {
  const db = getDb();
  const site = db.get("SELECT * FROM sites WHERE slug=? AND status='published'", [slug]); if (!site) return c.html('<!DOCTYPE html><meta charset="UTF-8"><h1>404 - サイトが見つからないか未公開です</h1>', 404);
  const page = db.get("SELECT * FROM site_pages WHERE site_id=? AND slug=? AND status='published'", [site.id, pslug]); if (!page) return c.html('<!DOCTYPE html><meta charset="UTF-8"><h1>404 - ページが見つかりません</h1>', 404);
  const pub = publishedComponents(db, page.id); if (!pub) return c.html('<!DOCTYPE html><meta charset="UTF-8"><h1>404 - 公開バージョンがありません</h1>', 404);
  const ctx = loadSiteContext(db, site);
  const variant = pickVariant(c, db, site, page.id);
  const html = renderPage({ site, page: { ...page, ...pub.page, id: page.id, slug: page.slug }, components: pub.components, ...ctx, baseUrl: baseUrl(c), variant });
  return c.html(html, 200, { 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
}

// ---- Tracking ----
const DEV = ['desktop', 'tablet', 'mobile'];
r.post('/t/e', async (c) => {
  const db = getDb();
  const ip = c.req.header('x-forwarded-for') || 'local';
  if (!rateLimit(db, `track:${ip}`, 600, 60).allowed) return c.body(null, 429);
  let b; try { b = await c.req.json(); } catch { return c.body(null, 400); }
  const siteId = Number(b.siteId); const type = String(b.type || '');
  if (!siteId || !['pageview', 'cta_view', 'cta_click', 'scroll', 'web_vital'].includes(type)) return c.body(null, 400);
  if (!db.get('SELECT id FROM sites WHERE id=?', [siteId])) return c.body(null, 404);
  const meta = type === 'web_vital' ? { metric: String(b.metric || '').slice(0, 10) } : {};
  db.run('INSERT INTO analytics_events(site_id,page_id,session_id,event_type,device,viewport_width,variant_id,component_id,value,meta,referrer,path) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
    [siteId, Number(b.pageId) || null, String(b.sessionId || randomToken(8)).slice(0, 64), type, DEV.includes(b.device) ? b.device : 'desktop', Number(b.vw) || null, Number(b.variantId) || null, Number(b.componentId) || null, b.value != null ? Number(b.value) : null, JSON.stringify(meta), String(b.ref || '').slice(0, 300), String(b.path || '').slice(0, 300)]);
  return c.body(null, 204);
});
r.post('/t/ad', async (c) => {
  const db = getDb();
  const ip = c.req.header('x-forwarded-for') || 'local';
  if (!rateLimit(db, `trackad:${ip}`, 200, 60).allowed) return c.body(null, 429);
  let b; try { b = await c.req.json(); } catch { return c.body(null, 400); }
  const siteId = Number(b.siteId); if (!siteId || !db.get('SELECT id FROM sites WHERE id=?', [siteId])) return c.body(null, 400);
  const token = randomToken(12);
  db.run('INSERT INTO affiliate_clicks(site_id,page_id,ad_id,component_id,session_id,device,variant_id,click_token) VALUES(?,?,?,?,?,?,?,?)',
    [siteId, Number(b.pageId) || null, Number(b.adId) || null, Number(b.componentId) || null, String(b.sessionId || '').slice(0, 64), DEV.includes(b.device) ? b.device : 'desktop', Number(b.variantId) || null, token]);
  return c.json({ ok: true, token });
});
// Affiliate link redirect (for CTA / product using affiliate_links). Original URL is never modified.
r.get('/go/:slug/l/:linkId', (c) => {
  const db = getDb(); const site = db.get('SELECT * FROM sites WHERE slug=?', [c.req.param('slug')]); if (!site) return c.text('Not found', 404);
  const link = db.get('SELECT * FROM affiliate_links WHERE id=?', [c.req.param('linkId')]); if (!link) return c.text('Not found', 404);
  const ua = c.req.header('user-agent') || ''; const device = /iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop';
  const token = randomToken(12);
  const variantId = Number(c.req.query('v')) || null;
  db.run('INSERT INTO affiliate_clicks(site_id,page_id,link_id,component_id,session_id,device,variant_id,click_token) VALUES(?,?,?,?,?,?,?,?)',
    [site.id, Number(c.req.query('p')) || null, link.id, Number(c.req.query('c')) || null, String(c.req.query('s') || '').slice(0, 64), device, variantId, token]);
  return c.redirect(link.url, 302);
});

export default r;
