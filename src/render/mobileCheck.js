// Deterministic Mobile Quality Check (no AI). Inspects component configs for common mobile problems.
import { P } from '../db/index.js';

const VIEWPORTS = [320, 375, 390, 414, 430];

function pxOf(v) { const m = String(v ?? '').match(/^(\d+(?:\.\d+)?)px$/); return m ? Number(m[1]) : null; }
function remToPx(v) { const m = String(v ?? '').match(/^(\d+(?:\.\d+)?)(rem|em)$/); return m ? Number(m[1]) * 16 : null; }
function fontPx(v) { return pxOf(v) ?? remToPx(v); }

export function mobileQualityCheck(db, pageId) {
  const page = db.get('SELECT * FROM site_pages WHERE id=?', [pageId]);
  const site = db.get('SELECT * FROM sites WHERE id=?', [page.site_id]);
  const settings = db.get('SELECT * FROM mobile_design_settings WHERE site_id=?', [site.id]) || {};
  const comps = db.all('SELECT * FROM site_components WHERE page_id=? ORDER BY sort_order', [pageId]).map(c => ({ ...c, props: P(c.props, {}), mobile: P(c.mobile_config, {}), desktop: P(c.desktop_config, {}) }));
  const prompt = site.mobile_prompt_id ? db.get('SELECT rules FROM mobile_design_prompts WHERE id=?', [site.mobile_prompt_id]) : null;
  const rules = { minFontPx: 16, minLineHeight: 1.5, minTapPx: 44, ...(prompt ? P(prompt.rules, {}) : {}) };

  const issues = [];
  const add = (level, check, message, componentId = null, viewport = null) => issues.push({ level, check, message, componentId, viewport });

  // Global settings
  const fs = fontPx(settings.font_size); if (fs !== null && fs < rules.minFontPx) add('WARNING', 'font_size', `モバイル基本フォント ${settings.font_size} は ${rules.minFontPx}px 未満`); 
  const lh = Number(settings.line_height); if (Number.isFinite(lh) && lh < rules.minLineHeight) add('WARNING', 'line_height', `行間 ${settings.line_height} は ${rules.minLineHeight} 未満`);
  const btn = pxOf(settings.button_size); if (btn !== null && btn < rules.minTapPx) add('ERROR', 'button_size', `ボタンサイズ ${settings.button_size} はタップ最小 ${rules.minTapPx}px 未満`);
  if (settings.cta_width && settings.cta_width !== '100%' && pxOf(settings.cta_width) && pxOf(settings.cta_width) > 320) add('ERROR', 'cta_width', `CTA幅 ${settings.cta_width} は320pxで横スクロールを発生させる可能性`, null, 320);
  if (settings.table_layout && !['scroll', 'card'].includes(settings.table_layout)) add('WARNING', 'table_layout', `比較表のモバイルレイアウトが scroll/card 以外 (${settings.table_layout})`);
  if (settings.navigation && !['hamburger', 'bottom-bar', 'none'].includes(settings.navigation)) add('WARNING', 'navigation', `ナビゲーション "${settings.navigation}" はモバイル向け設定ではありません`);

  // Components
  let adsOnPage = 0, headingH1 = 0, hasCta = false;
  for (const c of comps) {
    const m = c.mobile; const d = c.desktop;
    const hidden = m.visibility === 'hidden' || m.display === 'none';
    if (c.type === 'heading' && Number(c.props.level) === 1) headingH1++;
    if (c.type === 'cta' && !hidden) hasCta = true;
    if (c.type === 'affiliate_ad' && !hidden) adsOnPage++;
    // width in fixed px on mobile -> check against each viewport
    const w = pxOf(m.width ?? (Object.keys(m).length ? null : d.width));
    if (w !== null) for (const vp of VIEWPORTS) if (w > vp - 16) add('ERROR', 'horizontal_scroll', `${c.type}#${c.id} 幅 ${w}px が ${vp}px 幅で横スクロールを発生させます`, c.id, vp);
    if (c.type === 'image' && !hidden) {
      const mw = m.maxWidth ?? m.width;
      if (mw && mw !== '100%' && pxOf(mw) && pxOf(mw) > 320) add('ERROR', 'image_overflow', `画像#${c.id} の幅 ${mw} は320pxではみ出します`, c.id, 320);
      if (!c.props.alt) add('WARNING', 'image_alt', `画像#${c.id} に alt がありません`, c.id);
      if (c.props.lazy === false) add('WARNING', 'lazy_loading', `画像#${c.id} の Lazy Loading が無効です`, c.id);
    }
    if (['button', 'cta'].includes(c.type) && !hidden) {
      const h = pxOf(m.height ?? m.minHeight); if (h !== null && h < rules.minTapPx) add('ERROR', 'tap_target', `${c.type}#${c.id} 高さ ${h}px はタップ最小 ${rules.minTapPx}px 未満`, c.id);
      const f = fontPx(m.fontSize); if (f !== null && f < 14) add('WARNING', 'button_font', `${c.type}#${c.id} フォント ${m.fontSize} が小さすぎます`, c.id);
    }
    if (['text', 'article', 'heading'].includes(c.type) && !hidden) {
      const f = fontPx(m.fontSize); if (f !== null && f < rules.minFontPx && c.type !== 'heading') add('WARNING', 'text_font', `${c.type}#${c.id} フォント ${m.fontSize} は ${rules.minFontPx}px 未満`, c.id);
      const l = Number(m.lineHeight); if (Number.isFinite(l) && l < rules.minLineHeight) add('WARNING', 'text_line_height', `${c.type}#${c.id} 行間 ${l} は ${rules.minLineHeight} 未満`, c.id);
    }
    if (c.type === 'comparison_table' && !hidden) {
      const layout = m.layout || settings.table_layout || 'scroll';
      if (!['scroll', 'card'].includes(layout)) add('ERROR', 'comparison_table', `比較表#${c.id} のモバイルレイアウト "${layout}" は横スクロール/カード以外`, c.id);
      const cols = (c.props.columns || []).length; if (cols > 4 && layout === 'scroll') add('WARNING', 'comparison_table_cols', `比較表#${c.id} は ${cols} 列。カード表示を推奨`, c.id);
    }
    if (c.type === 'affiliate_ad' && !hidden) {
      const aw = pxOf(m.width) ?? (c.props.width ? Number(c.props.width) : null);
      if (aw && aw > 320) add('WARNING', 'ad_size', `広告#${c.id} 幅 ${aw}px は320pxで収まりません（コンテナでスケール/中央寄せ推奨。広告コードは変更不可）`, c.id, 320);
    }
    if (c.type === 'search' && !hidden) { const h = pxOf(m.inputHeight); if (h !== null && h < 44) add('WARNING', 'form_size', `検索フォーム#${c.id} 入力高さ ${h}px が小さい`, c.id); }
    const pad = pxOf(m.padding); if (pad !== null && pad > 40) add('WARNING', 'spacing', `${c.type}#${c.id} パディング ${pad}px は320pxで有効幅を圧迫します`, c.id, 320);
  }
  if (headingH1 === 0) add('WARNING', 'page_structure', 'H1見出しがありません');
  if (headingH1 > 1) add('WARNING', 'page_structure', `H1見出しが ${headingH1} 個あります`);
  if (!hasCta) add('WARNING', 'cta_presence', 'モバイルで表示されるCTAがありません');
  if (adsOnPage > 3) add('WARNING', 'ad_density', `モバイル表示の広告が ${adsOnPage} 個。多すぎる可能性`);
  if (comps.length === 0) add('ERROR', 'page_structure', 'コンポーネントがありません');
  // header/nav/footer checks derive from site settings
  const s = P(site.settings, {});
  if (s.headerFixed && s.headerHeight && pxOf(s.headerHeight) > 80) add('WARNING', 'header', `固定ヘッダー高さ ${s.headerHeight} がモバイル画面を圧迫`);
  if (s.footerLinks && s.footerLinks.length > 12) add('WARNING', 'footer', 'フッターリンクが多すぎます');

  const status = issues.some(i => i.level === 'ERROR') ? 'ERROR' : issues.some(i => i.level === 'WARNING') ? 'WARNING' : 'PASS';
  const checks = ['horizontal_scroll', 'image_overflow', 'font_size', 'line_height', 'button_size', 'cta_width', 'form_size', 'comparison_table', 'ad_size', 'spacing', 'header', 'navigation', 'footer', 'page_structure'];
  return { pageId, status, viewports: VIEWPORTS, rules, issues, summary: Object.fromEntries(checks.map(k => [k, issues.filter(i => i.check.startsWith(k)).length ? (issues.filter(i => i.check.startsWith(k)).some(i => i.level === 'ERROR') ? 'ERROR' : 'WARNING') : 'PASS'])), componentCount: comps.length };
}
