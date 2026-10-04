// Aggregation helpers for analytics (shared by admin API and AI inputs)
export function siteMetrics(db, siteId, { from, to, variantId } = {}) {
  const where = ['site_id=?']; const params = [siteId];
  if (from) { where.push('created_at>=?'); params.push(from); }
  if (to) { where.push('created_at<=?'); params.push(to); }
  if (variantId) { where.push('variant_id=?'); params.push(variantId); }
  const w = where.join(' AND ');

  const q1 = (sql, p = params) => db.get(sql, p) || {};
  const pv = q1(`SELECT COUNT(*) n FROM analytics_events WHERE ${w} AND event_type='pageview'`).n || 0;
  const visits = q1(`SELECT COUNT(DISTINCT session_id) n FROM analytics_events WHERE ${w} AND event_type='pageview'`).n || 0;
  const ctaView = q1(`SELECT COUNT(*) n FROM analytics_events WHERE ${w} AND event_type='cta_view'`).n || 0;
  const ctaClick = q1(`SELECT COUNT(*) n FROM analytics_events WHERE ${w} AND event_type='cta_click'`).n || 0;
  const clicks = q1(`SELECT COUNT(*) n FROM affiliate_clicks WHERE ${w}`).n || 0;
  const cv = q1(`SELECT COUNT(*) n FROM conversions WHERE ${w.replace(/created_at/g, 'occurred_at')} AND status!='rejected'`).n || 0;
  const revenue = q1(`SELECT COALESCE(SUM(amount),0) n FROM revenues WHERE ${w.replace(/created_at/g, 'occurred_at')}`).n || 0;

  const byDevice = {};
  for (const d of ['desktop', 'tablet', 'mobile']) {
    const p2 = [...params, d];
    const dpv = q1(`SELECT COUNT(*) n FROM analytics_events WHERE ${w} AND event_type='pageview' AND device=?`, p2).n || 0;
    const dclk = q1(`SELECT COUNT(*) n FROM affiliate_clicks WHERE ${w} AND device=?`, p2).n || 0;
    const dcv = q1(`SELECT COUNT(*) n FROM conversions WHERE ${w.replace(/created_at/g, 'occurred_at')} AND status!='rejected' AND device=?`, p2).n || 0;
    const drev = q1(`SELECT COALESCE(SUM(amount),0) n FROM revenues WHERE ${w.replace(/created_at/g, 'occurred_at')} AND device=?`, p2).n || 0;
    const dctaV = q1(`SELECT COUNT(*) n FROM analytics_events WHERE ${w} AND event_type='cta_view' AND device=?`, p2).n || 0;
    const dctaC = q1(`SELECT COUNT(*) n FROM analytics_events WHERE ${w} AND event_type='cta_click' AND device=?`, p2).n || 0;
    byDevice[d] = { pv: dpv, affiliateClicks: dclk, ctr: rate(dclk, dpv), cv: dcv, cvr: rate(dcv, dclk), revenue: drev, ctaViews: dctaV, ctaClicks: dctaC, ctaCtr: rate(dctaC, dctaV) };
  }

  const byPage = db.all(`SELECT e.page_id, p.title, p.slug, COUNT(*) pv,
      (SELECT COUNT(*) FROM affiliate_clicks k WHERE k.page_id=e.page_id) clicks,
      (SELECT COUNT(*) FROM conversions v WHERE v.page_id=e.page_id AND v.status!='rejected') cv
    FROM analytics_events e LEFT JOIN site_pages p ON p.id=e.page_id WHERE ${w.replace(/(created_at|site_id|variant_id)/g, 'e.$1')} AND e.event_type='pageview' GROUP BY e.page_id ORDER BY pv DESC LIMIT 20`, params)
    .map(x => ({ ...x, ctr: rate(x.clicks, x.pv), cvr: rate(x.cv, x.clicks) }));

  const byAd = db.all(`SELECT k.ad_id, a.name, COUNT(*) clicks,
      (SELECT COUNT(*) FROM conversions v WHERE v.ad_id=k.ad_id AND v.status!='rejected') cv,
      (SELECT COALESCE(SUM(amount),0) FROM revenues r WHERE r.ad_id=k.ad_id) revenue
    FROM affiliate_clicks k LEFT JOIN affiliate_ads a ON a.id=k.ad_id WHERE ${w.replace(/(created_at|site_id|variant_id)/g, 'k.$1')} GROUP BY k.ad_id ORDER BY clicks DESC LIMIT 20`, params)
    .map(x => ({ ...x, cvr: rate(x.cv, x.clicks) }));

  const daily = db.all(`SELECT substr(created_at,1,10) day, COUNT(*) pv FROM analytics_events WHERE ${w} AND event_type='pageview' GROUP BY day ORDER BY day DESC LIMIT 30`, params).reverse();
  const dailyClicks = db.all(`SELECT substr(created_at,1,10) day, COUNT(*) clicks FROM affiliate_clicks WHERE ${w} GROUP BY day ORDER BY day DESC LIMIT 30`, params).reverse();

  // Core Web Vitals: only real measurements collected from browsers. Otherwise "未計測".
  const vitals = {};
  for (const m of ['LCP', 'CLS', 'INP']) {
    const row = q1(`SELECT COUNT(*) n, AVG(value) avg FROM analytics_events WHERE ${w} AND event_type='web_vital' AND json_extract(meta,'$.metric')=?`, [...params, m]);
    vitals[m] = row.n ? { samples: row.n, avg: Math.round(row.avg * 1000) / 1000, status: 'measured' } : { samples: 0, avg: null, status: '未計測' };
  }

  return { pv, visits, ctaViews: ctaView, ctaClicks: ctaClick, ctaCtr: rate(ctaClick, ctaView), affiliateClicks: clicks, ctr: rate(clicks, pv), cv, cvr: rate(cv, clicks), revenue, byDevice, byPage, byAd, daily, dailyClicks, vitals };
}

export function rate(a, b) { return b ? Math.round((a / b) * 10000) / 100 : 0; }

export function pageSummaryForAI(db, pageId) {
  const page = db.get('SELECT id,title,slug,seo_title,meta_description,canonical_url,robots,structured_data FROM site_pages WHERE id=?', [pageId]);
  if (!page) return null;
  const comps = db.all('SELECT id,type,props,desktop_config,tablet_config,mobile_config,sort_order,sort_order_mobile FROM site_components WHERE page_id=? ORDER BY sort_order', [pageId])
    .map(x => {
      const props = JSON.parse(x.props || '{}');
      // never send raw ad code to AI
      if (x.type === 'affiliate_ad') delete props.code;
      return { id: x.id, type: x.type, props, desktop: JSON.parse(x.desktop_config || '{}'), tablet: JSON.parse(x.tablet_config || '{}'), mobile: JSON.parse(x.mobile_config || '{}'), order: x.sort_order, mobileOrder: x.sort_order_mobile };
    });
  return { page, components: comps };
}
