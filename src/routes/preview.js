// Admin preview (draft state) + SEO tools
import { Hono } from 'hono';
import { getDb, P, J } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { body, user, notFound, logAction } from '../lib/http.js';
import { renderPage } from '../render/site.js';
import { loadSiteContext } from './public.js';
import { getPageSnapshot, parseComponent } from '../lib/builder.js';
import { int, assert } from '../lib/security.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));

function baseUrl(c) { const u = new URL(c.req.url); return `${u.protocol}//${u.host}`; }

// GET /api/preview/pages/:pageId?device=mobile&recommendationId=12&versionId=3  -> HTML (noindex)
r.get('/pages/:pageId', (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  const page = db.get('SELECT * FROM site_pages WHERE id=?', [pageId]); if (!page) return notFound(c, 'Page');
  const site = db.get('SELECT * FROM sites WHERE id=?', [page.site_id]);
  let snap = getPageSnapshot(db, pageId);
  const versionId = c.req.query('versionId');
  if (versionId) { const v = db.get('SELECT snapshot FROM builder_versions WHERE id=? AND page_id=?', [versionId, pageId]); if (v) snap = P(v.snapshot, snap); }
  let components = snap.components;
  // Preview a pending AI recommendation's proposed changes without applying
  const recId = c.req.query('recommendationId');
  if (recId) {
    const rec = db.get('SELECT * FROM ai_recommendations WHERE id=?', [recId]);
    if (rec) {
      const changes = P(rec.proposed_changes, []);
      components = components.map(cp => {
        const mine = changes.filter(ch => Number(ch.component_id) === cp.id && ch.field);
        if (!mine.length) return cp;
        const copy = JSON.parse(JSON.stringify(cp));
        for (const ch of mine) {
          if (cp.type === 'affiliate_ad' && /props\.(code|adId)/.test(ch.field)) continue;
          const [root, ...rest] = ch.field.split('.'); if (!['props', 'desktop_config', 'tablet_config', 'mobile_config'].includes(root)) continue;
          let cur = copy[root] = copy[root] || {};
          for (let i = 0; i < rest.length - 1; i++) { cur[rest[i]] = cur[rest[i]] && typeof cur[rest[i]] === 'object' ? cur[rest[i]] : {}; cur = cur[rest[i]]; }
          if (rest.length) cur[rest[rest.length - 1]] = ch.to;
        }
        return copy;
      });
    }
  }
  const variantId = c.req.query('variantId');
  const variant = variantId ? (() => { const v = db.get('SELECT * FROM experiment_variants WHERE id=?', [variantId]); return v ? { ...v, overrides: P(v.overrides, {}) } : null; })() : null;
  const ctx = loadSiteContext(db, site, { preview: true });
  const html = renderPage({ site, page: { ...page, ...snap.page, id: page.id }, components, ...ctx, baseUrl: baseUrl(c), preview: true, variant, trackingEnabled: false });
  return c.html(html, 200, { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' });
});

// Device preview metadata (sizes for iframe)
r.get('/devices', (c) => c.json({
  presets: [
    { key: 'desktop', label: 'Desktop', width: 1280, height: 800 }, { key: 'tablet', label: 'Tablet', width: 820, height: 1180 }, { key: 'mobile', label: 'Mobile', width: 390, height: 844 },
    { key: '320', label: '320px', width: 320, height: 568 }, { key: '375', label: '375px', width: 375, height: 667 }, { key: '390', label: '390px', width: 390, height: 844 }, { key: '414', label: '414px', width: 414, height: 896 }, { key: '430', label: '430px', width: 430, height: 932 }
  ]
}));

// ---- SEO tools ----
r.get('/seo/sites/:siteId', (c) => {
  const db = getDb(); const siteId = Number(c.req.param('siteId'));
  const site = db.get('SELECT * FROM sites WHERE id=?', [siteId]); if (!site) return notFound(c, 'Site');
  const pages = db.all('SELECT * FROM site_pages WHERE site_id=? ORDER BY sort_order', [siteId]);
  const report = pages.map(p => {
    const comps = db.all('SELECT type, props FROM site_components WHERE page_id=? ORDER BY sort_order', [p.id]).map(parseComponent);
    const headings = comps.filter(x => x.type === 'heading').map(x => ({ level: Number(x.props.level) || 2, text: x.props.text || '' }));
    const h1 = headings.filter(h => h.level === 1).length;
    const internal = comps.filter(x => ['button', 'cta', 'banner'].includes(x.type)).map(x => x.props.url).filter(u => typeof u === 'string' && u.startsWith('/s/'));
    const textLen = comps.filter(x => ['text', 'article'].includes(x.type)).reduce((a, x) => a + String(x.props.html || x.props.text || '').replace(/<[^>]+>/g, '').length, 0);
    const title = p.seo_title || `${p.title} | ${site.name}`;
    const issues = [];
    if (!p.seo_title) issues.push({ level: 'WARNING', msg: 'SEOタイトル未設定 (自動生成タイトルを使用)' });
    if (title.length > 60) issues.push({ level: 'WARNING', msg: `タイトルが長すぎます (${title.length}文字)` });
    if (!p.meta_description) issues.push({ level: 'ERROR', msg: 'Meta Description未設定' });
    else if (p.meta_description.length < 50 || p.meta_description.length > 160) issues.push({ level: 'WARNING', msg: `Meta Description長 ${p.meta_description.length}文字 (推奨 80-160)` });
    if (h1 !== 1) issues.push({ level: h1 === 0 ? 'ERROR' : 'WARNING', msg: `H1が${h1}個` });
    let prev = 1; for (const h of headings) { if (h.level > prev + 1) { issues.push({ level: 'WARNING', msg: `見出しレベル飛び (H${prev}→H${h.level})` }); break; } prev = h.level; }
    if (textLen < 300) issues.push({ level: 'WARNING', msg: `本文が少ない (${textLen}文字)` });
    if (!internal.length && pages.length > 1) issues.push({ level: 'WARNING', msg: '内部リンクなし' });
    if (p.robots && /noindex/.test(p.robots)) issues.push({ level: 'INFO', msg: 'noindex設定' });
    comps.filter(x => x.type === 'image' && !x.props.alt).forEach(() => issues.push({ level: 'WARNING', msg: '画像altなし' }));
    const score = Math.max(0, 100 - issues.reduce((a, i) => a + (i.level === 'ERROR' ? 20 : i.level === 'WARNING' ? 8 : 0), 0));
    return { pageId: p.id, title: p.title, slug: p.slug, status: p.status, seo_title: p.seo_title, meta_description: p.meta_description, canonical_url: p.canonical_url, robots: p.robots, structured_data: !!p.structured_data, headings, h1Count: h1, internalLinks: internal.length, textLength: textLen, issues, score };
  });
  const avg = report.length ? Math.round(report.reduce((a, r) => a + r.score, 0) / report.length) : 0;
  return c.json({ site: { id: site.id, name: site.name, slug: site.slug, seo_keywords: P(site.seo_keywords, []) }, averageScore: avg, pages: report, sitemapUrl: `/s/${site.slug}/sitemap.xml`, robotsUrl: `/s/${site.slug}/robots.txt` });
});

export default r;
