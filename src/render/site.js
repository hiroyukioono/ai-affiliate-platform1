// Public site renderer: produces full HTML for a page with SEO tags, responsive CSS, tracking script.
import { P } from '../db/index.js';
import { escapeHtml as e, escapeAttr as a, sanitizeHtml, safeUrl } from '../lib/security.js';

const DEVICES = ['desktop', 'tablet', 'mobile'];

function cfgToCss(cfg) {
  // whitelist of style properties -> css
  const map = { width: 'width', maxWidth: 'max-width', height: 'height', minHeight: 'min-height', fontSize: 'font-size', lineHeight: 'line-height', margin: 'margin', padding: 'padding', textAlign: 'text-align', display: 'display', position: 'position', background: 'background', color: 'color', borderRadius: 'border-radius', gap: 'gap', top: 'top', bottom: 'bottom', zIndex: 'z-index', order: 'order', flexDirection: 'flex-direction', justifyContent: 'justify-content', alignItems: 'align-items' };
  const out = [];
  for (const [k, v] of Object.entries(cfg || {})) {
    if (!map[k] || v === undefined || v === null || v === '') continue;
    const val = String(v).replace(/[{};<>]|url\(|expression\(|javascript:/gi, '').slice(0, 120);
    out.push(`${map[k]}:${val}`);
  }
  if (cfg?.visibility === 'hidden') out.push('display:none');
  return out.join(';');
}

function applyVariantOverrides(components, overrides) {
  if (!overrides || typeof overrides !== 'object') return components;
  return components.map(c => {
    const o = overrides[c.id] || overrides[String(c.id)];
    if (!o) return c;
    return { ...c, props: { ...c.props, ...(o.props || {}) }, desktop_config: { ...c.desktop_config, ...(o.desktop_config || {}) }, tablet_config: { ...c.tablet_config, ...(o.tablet_config || {}) }, mobile_config: { ...c.mobile_config, ...(o.mobile_config || {}) } };
  });
}

export function renderComponent(c, ctx) {
  const p = c.props || {};
  const id = `c${c.id}`;
  const cls = `cmp cmp-${c.type}`;
  const wrap = (inner, extra = '') => `<div id="${id}" class="${cls}${extra}" data-cid="${c.id}" data-type="${c.type}">${inner}</div>`;
  switch (c.type) {
    case 'heading': { const lv = Math.min(6, Math.max(1, Number(p.level) || 2)); return wrap(`<h${lv}>${e(p.text || '')}</h${lv}>`); }
    case 'text': return wrap(`<div class="rich">${sanitizeHtml(p.html || e(p.text || ''))}</div>`);
    case 'image': {
      const src = safeUrl(p.src || p.url || '');
      const lazy = p.lazy === false ? '' : ' loading="lazy" decoding="async"';
      const dims = (p.width && p.height) ? ` width="${Number(p.width)}" height="${Number(p.height)}"` : '';
      const img = `<img src="${a(src)}" alt="${a(p.alt || '')}"${lazy}${dims}>`;
      return wrap(p.href ? `<a href="${a(safeUrl(p.href))}">${img}</a>` : img + (p.caption ? `<figcaption>${e(p.caption)}</figcaption>` : ''));
    }
    case 'button': return wrap(`<a class="btn-primary btn" href="${a(safeUrl(p.url))}" ${p.external ? 'target="_blank" rel="noopener nofollow"' : ''} data-track="cta_click">${e(p.text || 'Button')}</a>`);
    case 'cta': {
      const url = p.linkId ? `/go/${ctx.site.slug}/l/${Number(p.linkId)}?p=${ctx.page.id}&c=${c.id}` : safeUrl(p.url);
      return wrap(`<div class="cta-box" data-track="cta_view">${p.title ? `<h3 class="cta-title">${e(p.title)}</h3>` : ''}${p.text ? `<p class="cta-text">${e(p.text)}</p>` : ''}<a class="cta-button" href="${a(url)}" ${p.linkId ? 'rel="nofollow sponsored"' : ''} data-track="cta_click">${e(p.buttonText || '詳細を見る')}</a>${p.note ? `<small class="cta-note">${e(p.note)}</small>` : ''}</div>`);
    }
    case 'affiliate_ad': {
      const ad = p.adId ? ctx.ads.get(Number(p.adId)) : null;
      if (!ad || !ad.is_active) return wrap(`<div class="ad-placeholder">${ctx.preview ? '[広告未設定]' : ''}</div>`);
      // ORIGINAL CODE rendered verbatim inside isolated container. We never touch href/src/tracking params.
      // Click tracking is done by a capturing listener on the container (does not alter the ad markup).
      return wrap(`<div class="ad-container" data-ad-id="${ad.id}" data-track="ad_click">${p.label !== false ? `<span class="ad-label">${e(p.label || 'PR')}</span>` : ''}<div class="ad-original">${ad.original_code}</div></div>`);
    }
    case 'product': {
      const pr = p.productId ? ctx.products.get(Number(p.productId)) : p;
      if (!pr) return wrap('<div class="card product-card">[商品未設定]</div>');
      const feats = (P(pr.features, pr.features) || []); const linkId = pr.affiliate_link_id || p.linkId;
      const url = linkId ? `/go/${ctx.site.slug}/l/${Number(linkId)}?p=${ctx.page.id}&c=${c.id}` : safeUrl(p.url);
      return wrap(`<article class="card product-card">${pr.image_url ? `<img src="${a(safeUrl(pr.image_url))}" alt="${a(pr.name || '')}" loading="lazy">` : ''}<div class="product-body"><h3>${e(pr.name || '')}</h3>${pr.rating ? `<div class="rating">★ ${e(pr.rating)}</div>` : ''}${pr.price ? `<div class="price">${e(pr.price)}</div>` : ''}<p>${e(pr.description || '')}</p>${Array.isArray(feats) && feats.length ? `<ul>${feats.map(f => `<li>${e(f)}</li>`).join('')}</ul>` : ''}<a class="cta-button" href="${a(url)}" rel="nofollow sponsored" data-track="cta_click">${e(p.buttonText || '公式サイトへ')}</a></div></article>`);
    }
    case 'comparison_table': {
      const cols = Array.isArray(p.columns) ? p.columns : []; const rows = Array.isArray(p.rows) ? p.rows : [];
      const layout = (c.mobile_config?.layout) || ctx.mobileSettings?.table_layout || 'scroll';
      const table = `<div class="table-scroll"><table class="compare-table"><thead><tr><th>${e(p.firstColumn || '項目')}</th>${cols.map(h => `<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr><th>${e(r.label || '')}</th>${cols.map((_, i) => `<td>${e((r.values || [])[i] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      const cards = `<div class="compare-cards">${cols.map((h, i) => `<div class="card compare-card${p.recommended === i ? ' recommended' : ''}"><h4>${e(h)}</h4><dl>${rows.map(r => `<dt>${e(r.label || '')}</dt><dd>${e((r.values || [])[i] ?? '')}</dd>`).join('')}</dl></div>`).join('')}</div>`;
      return wrap(`${p.title ? `<h3>${e(p.title)}</h3>` : ''}${table}${layout === 'card' ? cards : ''}`, layout === 'card' ? ' table-card-mode' : '');
    }
    case 'ranking': { const items = Array.isArray(p.items) ? p.items : []; return wrap(`${p.title ? `<h3>${e(p.title)}</h3>` : ''}<ol class="ranking">${items.map((it, i) => `<li class="card rank-item"><span class="rank-no">${i + 1}</span><div><strong>${e(it.name || '')}</strong><p>${e(it.description || '')}</p>${it.url ? `<a class="btn-primary btn" href="${a(safeUrl(it.url))}" rel="nofollow sponsored" data-track="cta_click">${e(it.buttonText || '詳細')}</a>` : ''}</div></li>`).join('')}</ol>`); }
    case 'article': { const art = p.articleId ? ctx.articles.get(Number(p.articleId)) : null; return wrap(`<article class="rich article-body">${sanitizeHtml(art?.body_html || p.html || '')}</article>`); }
    case 'faq': { const items = Array.isArray(p.items) ? p.items : []; return wrap(`${p.title ? `<h3>${e(p.title)}</h3>` : ''}<div class="faq">${items.map(it => `<details class="faq-item"><summary>${e(it.q || '')}</summary><div class="faq-a">${e(it.a || '')}</div></details>`).join('')}</div>`); }
    case 'search': return wrap(`<form class="search-form" action="/s/${a(ctx.site.slug)}/search" method="get" role="search"><input type="search" name="q" placeholder="${a(p.placeholder || 'サイト内検索')}" aria-label="検索"><button type="submit" class="btn-primary">${e(p.buttonText || '検索')}</button></form>`);
    case 'banner': return wrap(`<a class="banner" href="${a(safeUrl(p.url))}" ${p.external ? 'target="_blank" rel="noopener nofollow"' : ''} data-track="cta_click" style="background:${a(String(p.background || 'var(--c-primary)').replace(/[;{}<>]/g, ''))}">${p.image ? `<img src="${a(safeUrl(p.image))}" alt="${a(p.alt || '')}" loading="lazy">` : ''}<span class="banner-text">${e(p.text || '')}</span></a>`);
    case 'spacer': return wrap('', ' spacer');
    case 'divider': return wrap('<hr>');
    case 'html': return wrap(`<div class="custom-html">${sanitizeHtml(p.html || '')}</div>`);
    case 'video': {
      const src = safeUrl(p.src || ''); const yt = String(p.youtubeId || '').replace(/[^A-Za-z0-9_-]/g, '');
      if (yt) return wrap(`<div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/${yt}" title="${a(p.title || 'video')}" loading="lazy" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`);
      return wrap(`<div class="video-wrap"><video src="${a(src)}" controls preload="metadata" ${p.poster ? `poster="${a(safeUrl(p.poster))}"` : ''}></video></div>`);
    }
    default: return wrap(`<!-- unknown component ${e(c.type)} -->`);
  }
}

export function baseCss(resp, mobile) {
  const d = resp?.desktop_config || {}, t = resp?.tablet_config || {}, m = resp?.mobile_config || {};
  const bp = resp?.breakpoints || { tablet: 1024, mobile: 767 };
  const ms = mobile || {};
  return `
*,*::before,*::after{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;line-height:1.7;font-size:${ms.font_size || '1rem'};overflow-x:hidden}
img,video,iframe{max-width:100%;height:auto}
.container{width:100%;max-width:var(--max-w,${d.containerWidth || '1100px'});margin:0 auto;padding:${d.padding || '2rem'}}
.site-header{position:${ms.position === 'sticky' ? 'sticky' : 'relative'};top:0;z-index:50;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.site-header .container{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding-top:.75rem;padding-bottom:.75rem}
.site-title{font-weight:700;font-size:clamp(1.1rem,2.5vw,1.5rem);text-decoration:none;color:inherit}
.site-nav{display:flex;gap:1.25rem;flex-wrap:wrap}.site-nav a{color:inherit;text-decoration:none;padding:.5rem 0;min-height:44px;display:inline-flex;align-items:center}
.nav-toggle{display:none;background:none;border:1px solid currentColor;border-radius:6px;padding:.5rem .75rem;color:inherit;min-width:44px;min-height:44px;font-size:1.1rem}
main.container{display:grid;grid-template-columns:${d.columns === 2 ? 'minmax(0,1fr) 300px' : 'minmax(0,1fr)'};gap:2rem}
.content{min-width:0;display:flex;flex-direction:column;gap:1.5rem}.sidebar{display:flex;flex-direction:column;gap:1rem}
.cmp{min-width:0;max-width:100%}.cmp h1{font-size:clamp(1.6rem,4vw,2.4rem);line-height:1.3;margin:0 0 .5em}.cmp h2{font-size:clamp(1.3rem,3vw,1.8rem);line-height:1.35;margin:1.2em 0 .5em;padding-bottom:.3em;border-bottom:3px solid var(--c-primary)}.cmp h3{font-size:clamp(1.1rem,2.5vw,1.35rem)}
.rich p{margin:0 0 1em}.rich ul{padding-left:1.4em}
.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:.75rem 1.5rem;text-decoration:none;font-weight:700;border-radius:var(--radius,8px)}
.cta-box{padding:1.5rem;text-align:center;width:${d.ctaWidth || '100%'};max-width:100%;margin:0 auto}.cta-title{margin:0 0 .5rem}.cta-text{margin:0 0 1rem}
.cta-button{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:.9rem 2rem;font-size:1.05rem;font-weight:700;text-decoration:none;width:100%;max-width:420px}
.cta-note{display:block;margin-top:.5rem;opacity:.7}
.ad-container{position:relative;display:flex;flex-direction:column;align-items:center;width:${d.adWidth || 'auto'};max-width:100%;margin:0 auto;padding:.5rem;background:var(--c-surface);border-radius:var(--radius)}
.ad-label{align-self:flex-start;font-size:.7rem;opacity:.6}.ad-original{max-width:100%;overflow:hidden;display:flex;justify-content:center}.ad-original img{max-width:100%;height:auto}
.ad-placeholder{border:1px dashed #ccc;padding:1rem;text-align:center;color:#999;min-height:60px}
.card{padding:1.25rem}.product-card{display:grid;grid-template-columns:200px 1fr;gap:1.25rem;align-items:start}.product-card img{width:100%;border-radius:var(--radius)}.price{font-size:1.4rem;font-weight:700;color:var(--c-primary)}.rating{color:#f59e0b}
.table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}.compare-table{border-collapse:collapse;width:100%;min-width:560px}.compare-table th,.compare-table td{border:1px solid #e5e7eb;padding:.75rem;text-align:left;vertical-align:top}.compare-table thead th{background:var(--c-primary);color:#fff}.compare-table tbody th{background:var(--c-surface);white-space:nowrap}
.compare-cards{display:none}
.ranking{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:1rem}.rank-item{display:flex;gap:1rem;align-items:flex-start}.rank-no{flex:none;width:2.5rem;height:2.5rem;border-radius:50%;background:var(--c-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700}
.faq-item{background:var(--c-surface);border-radius:var(--radius);padding:.75rem 1rem;margin-bottom:.5rem}.faq-item summary{cursor:pointer;font-weight:600;min-height:44px;display:flex;align-items:center}.faq-a{padding:.5rem 0}
.search-form{display:flex;gap:.5rem}.search-form input{flex:1;min-height:48px;padding:0 1rem;border:1px solid #d1d5db;border-radius:var(--radius);font-size:1rem}.search-form button{min-height:48px;padding:0 1.25rem;border:0;border-radius:var(--radius);font-weight:700}
.banner{display:flex;align-items:center;justify-content:center;gap:1rem;padding:1.25rem;color:#fff;text-decoration:none;border-radius:var(--radius);font-weight:700;min-height:64px}
.spacer{height:2rem}hr{border:0;border-top:1px solid #e5e7eb}
.video-wrap{position:relative;aspect-ratio:16/9;width:100%}.video-wrap iframe,.video-wrap video{position:absolute;inset:0;width:100%;height:100%;border:0}
.site-footer{margin-top:3rem;padding:2rem 0}.site-footer .container{display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between}.site-footer a{color:inherit}
@media (max-width:${bp.tablet}px){
 .container{max-width:${t.containerWidth || '90%'};padding:${t.padding || '1.5rem'}}main.container{grid-template-columns:minmax(0,1fr)}
 .cta-box{width:${t.ctaWidth || '80%'}}.ad-container{width:${t.adWidth || '100%'}}
 .product-card{grid-template-columns:160px 1fr}
}
@media (max-width:${bp.mobile}px){
 body{font-size:${ms.font_size || m.fontSize || '1rem'};line-height:${ms.line_height || '1.7'}}
 .container{max-width:100%;padding:${ms.padding || m.padding || '1rem'}}
 .site-nav{display:none;position:absolute;left:0;right:0;top:100%;flex-direction:column;gap:0;background:inherit;padding:.5rem 1rem 1rem;box-shadow:0 8px 16px rgba(0,0,0,.1)}
 .site-nav.open{display:flex}.nav-toggle{display:inline-flex;align-items:center;justify-content:center}
 .cta-box{width:${ms.cta_width || '100%'};padding:1.25rem 1rem}.cta-button{width:100%;max-width:100%;min-height:${ms.button_size || '52px'}}
 .btn{min-height:${ms.button_size || '48px'};width:100%}
 .ad-container{width:100%;padding:.25rem}
 .product-card{grid-template-columns:1fr}.product-card img{max-width:${ms.image_size || '100%'}}
 .table-card-mode .table-scroll{display:none}.table-card-mode .compare-cards{display:grid;grid-template-columns:1fr;gap:1rem}
 .compare-card.recommended{border:2px solid var(--c-accent)}.compare-card dl{display:grid;grid-template-columns:auto 1fr;gap:.25rem .75rem;margin:0}.compare-card dt{font-weight:600;opacity:.75}.compare-card dd{margin:0}
 .rank-item{flex-direction:column}
 .site-footer .container{flex-direction:column}
 ${ms.position === 'sticky-cta' ? '.cmp-cta:last-of-type{position:sticky;bottom:0;z-index:40}' : ''}
}
@media (max-width:360px){.container{padding:.75rem}.cmp h1{font-size:1.5rem}}
`;
}

function componentCss(components, bp) {
  const d = [], t = [], m = [];
  for (const c of components) {
    const sd = cfgToCss(c.desktop_config); if (sd) d.push(`#c${c.id}{${sd}}`);
    const st = cfgToCss(c.tablet_config); if (st) t.push(`#c${c.id}{${st}}`);
    const sm = cfgToCss(c.mobile_config); if (sm) m.push(`#c${c.id}{${sm}}`);
    if (c.sort_order_tablet != null) t.push(`#c${c.id}{order:${Number(c.sort_order_tablet)}}`);
    if (c.sort_order_mobile != null) m.push(`#c${c.id}{order:${Number(c.sort_order_mobile)}}`);
  }
  return `${d.join('')}@media (max-width:${bp.tablet}px){${t.join('')}}@media (max-width:${bp.mobile}px){${m.join('')}}`;
}

export function renderPage({ site, page, components, pages, design, responsive, mobileSettings, ads, products, articles, categories, baseUrl, preview = false, variant = null, trackingEnabled = true }) {
  const bp = responsive?.breakpoints || { tablet: 1024, mobile: 767 };
  const comps = applyVariantOverrides(components, variant?.overrides);
  const ctx = { site, page, ads, products, articles, mobileSettings, preview };
  const settings = P(site.settings, {}) || {};
  const title = page.seo_title || `${page.title} | ${site.name}`;
  const desc = page.meta_description || settings.description || '';
  const url = `${baseUrl}/s/${site.slug}/${page.slug === 'home' ? '' : page.slug}`;
  const canonical = page.canonical_url || url;
  const robots = preview ? 'noindex,nofollow' : (page.robots || 'index,follow');
  const ogImage = page.og_image || settings.ogImage || '';
  const ld = page.structured_data || {
    '@context': 'https://schema.org', '@type': page.page_type === 'article' ? 'Article' : 'WebPage', headline: page.title, name: page.title, description: desc, url: canonical,
    publisher: { '@type': 'Organization', name: site.name }, dateModified: page.updated_at, ...(page.page_type === 'article' ? { datePublished: page.created_at, author: { '@type': 'Organization', name: site.name } } : {})
  };
  const faq = comps.filter(c => c.type === 'faq').flatMap(c => c.props.items || []);
  const faqLd = faq.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) } : null;
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: site.name, item: `${baseUrl}/s/${site.slug}/` }, ...(page.slug !== 'home' ? [{ '@type': 'ListItem', position: 2, name: page.title, item: url }] : [])] };
  const navPages = pages.filter(p => p.status === 'published' || preview).filter(p => p.page_type !== 'article' || pages.length <= 8).slice(0, 8);
  const sidebarComps = (responsive?.desktop_config?.columns === 2) ? comps.filter(c => c.desktop_config?.region === 'sidebar') : [];
  const mainComps = comps.filter(c => !sidebarComps.includes(c));

  const tracking = trackingEnabled && !preview ? `<script>
(function(){var S=${JSON.stringify({ siteId: site.id, pageId: page.id, variantId: variant?.id || null, slug: site.slug })};
var sid=localStorage.getItem('aap_sid')||(Math.random().toString(36).slice(2)+Date.now().toString(36));localStorage.setItem('aap_sid',sid);
var w=window.innerWidth,dev=w<=${bp.mobile}?'mobile':w<=${bp.tablet}?'tablet':'desktop';
function send(t,extra){try{var b=JSON.stringify(Object.assign({siteId:S.siteId,pageId:S.pageId,variantId:S.variantId,sessionId:sid,type:t,device:dev,vw:w,path:location.pathname,ref:document.referrer},extra||{}));
if(navigator.sendBeacon){navigator.sendBeacon('/t/e',new Blob([b],{type:'application/json'}))}else{fetch('/t/e',{method:'POST',headers:{'Content-Type':'application/json'},body:b,keepalive:true})}}catch(e){}}
send('pageview');
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){var el=en.target;io.unobserve(el);send('cta_view',{componentId:+el.closest('[data-cid]').dataset.cid})}})},{threshold:.5});document.querySelectorAll('[data-track="cta_view"]').forEach(function(el){io.observe(el)})}
document.addEventListener('click',function(ev){var t=ev.target.closest('[data-track="cta_click"]');if(t){send('cta_click',{componentId:+(t.closest('[data-cid]')||{dataset:{}}).dataset.cid})}
var ad=ev.target.closest('.ad-container');if(ad&&ev.target.closest('a,img,area,button')){var cid=+(ad.closest('[data-cid]')||{dataset:{}}).dataset.cid;var b=JSON.stringify({siteId:S.siteId,pageId:S.pageId,adId:+ad.dataset.adId,componentId:cid,sessionId:sid,device:dev,variantId:S.variantId});if(navigator.sendBeacon){navigator.sendBeacon('/t/ad',new Blob([b],{type:'application/json'}))}else{fetch('/t/ad',{method:'POST',headers:{'Content-Type':'application/json'},body:b,keepalive:true})}}},true);
// Core Web Vitals (real measurements only)
try{new PerformanceObserver(function(l){var es=l.getEntries();var last=es[es.length-1];if(last)send('web_vital',{metric:'LCP',value:last.startTime})}).observe({type:'largest-contentful-paint',buffered:true});
var cls=0;new PerformanceObserver(function(l){l.getEntries().forEach(function(en){if(!en.hadRecentInput)cls+=en.value})}).observe({type:'layout-shift',buffered:true});addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&cls>0)send('web_vital',{metric:'CLS',value:cls})},{once:true});
var inp=0;new PerformanceObserver(function(l){l.getEntries().forEach(function(en){if(en.duration>inp)inp=en.duration})}).observe({type:'event',buffered:true,durationThreshold:40});addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'&&inp>0)send('web_vital',{metric:'INP',value:inp})},{once:true})}catch(e){}
var tg=document.querySelector('.nav-toggle');if(tg){tg.addEventListener('click',function(){var n=document.querySelector('.site-nav');n.classList.toggle('open');tg.setAttribute('aria-expanded',n.classList.contains('open'))})}
})();</script>` : `<script>var tg=document.querySelector('.nav-toggle');if(tg){tg.addEventListener('click',function(){var n=document.querySelector('.site-nav');n.classList.toggle('open')})}</script>`;

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(title)}</title>
<meta name="description" content="${a(desc)}">
<meta name="robots" content="${a(robots)}">
<link rel="canonical" href="${a(canonical)}">
<meta property="og:type" content="${page.page_type === 'article' ? 'article' : 'website'}">
<meta property="og:title" content="${a(title)}">
<meta property="og:description" content="${a(desc)}">
<meta property="og:url" content="${a(canonical)}">
<meta property="og:site_name" content="${a(site.name)}">
${ogImage ? `<meta property="og:image" content="${a(ogImage)}">` : ''}
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
<link rel="alternate" type="application/rss+xml" href="${a(baseUrl)}/s/${a(site.slug)}/feed.xml">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<script type="application/ld+json">${JSON.stringify(breadcrumb).replace(/</g, '\\u003c')}</script>
${faqLd ? `<script type="application/ld+json">${JSON.stringify(faqLd).replace(/</g, '\\u003c')}</script>` : ''}
<style>${design?.css || ''}</style>
<style>${baseCss(responsive, mobileSettings)}</style>
<style>${componentCss(comps, bp)}</style>
${settings.customCss ? `<style>${String(settings.customCss).replace(/<\/style/gi, '')}</style>` : ''}
</head>
<body class="page-${e(page.slug)} device-auto">
<header class="site-header"><div class="container">
<a class="site-title" href="/s/${a(site.slug)}/">${e(site.name)}</a>
<button class="nav-toggle" aria-label="メニュー" aria-expanded="false">☰</button>
<nav class="site-nav" aria-label="メインナビゲーション">${navPages.map(p => `<a href="/s/${a(site.slug)}/${p.slug === 'home' ? '' : a(p.slug)}"${p.id === page.id ? ' aria-current="page"' : ''}>${e(p.title)}</a>`).join('')}</nav>
</div></header>
<main class="container">
<div class="content">${mainComps.map(c => renderComponent(c, ctx)).join('\n')}</div>
${sidebarComps.length ? `<aside class="sidebar">${sidebarComps.map(c => renderComponent(c, ctx)).join('\n')}</aside>` : ''}
</main>
<footer class="site-footer"><div class="container">
<div>© ${new Date().getFullYear()} ${e(site.name)}${settings.footerNote ? ` — ${e(settings.footerNote)}` : ''}</div>
<nav aria-label="フッター">${(categories || []).slice(0, 8).map(cat => `<a href="/s/${a(site.slug)}/category/${a(cat.slug)}">${e(cat.name)}</a> `).join('')}<a href="/s/${a(site.slug)}/sitemap.xml">Sitemap</a></nav>
<small>※本サイトはアフィリエイト広告を利用しています</small>
</div></footer>
${tracking}
</body>
</html>`;
}

export function renderSitemap(site, pages, baseUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `<url><loc>${e(`${baseUrl}/s/${site.slug}/${p.slug === 'home' ? '' : p.slug}`)}</loc><lastmod>${e(String(p.updated_at).slice(0, 10))}</lastmod><changefreq>weekly</changefreq><priority>${p.slug === 'home' ? '1.0' : '0.7'}</priority></url>`).join('\n')}\n</urlset>`;
}
export function renderRobots(site, baseUrl) { return `User-agent: *\nAllow: /s/${site.slug}/\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${baseUrl}/s/${site.slug}/sitemap.xml\n`; }
export function renderFeed(site, pages, baseUrl) {
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${e(site.name)}</title><link>${e(baseUrl)}/s/${e(site.slug)}/</link><description>${e(P(site.settings, {})?.description || site.name)}</description>${pages.filter(p => p.page_type === 'article').map(p => `<item><title>${e(p.title)}</title><link>${e(baseUrl)}/s/${e(site.slug)}/${e(p.slug)}</link><description>${e(p.meta_description || '')}</description><pubDate>${new Date(p.created_at).toUTCString()}</pubDate></item>`).join('')}</channel></rss>`;
}
