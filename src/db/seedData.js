// Seed data: 10 mobile prompts, 10 design themes, 3 responsive design sets, affiliate program.
export const MOBILE_PROMPTS = [
  { name: 'Mobile Standard', description: '標準的なモバイル最適化。可読性とタップ領域を重視。',
    prompt: 'Optimize this page for standard smartphones (320-430px). Ensure 16px+ base font, 1.6+ line height, 44px+ tap targets, no horizontal scroll, images max-width 100%, CTA full width.',
    rules: { minFontPx: 16, minLineHeight: 1.6, minTapPx: 44, ctaWidth: '100%', tableLayout: 'scroll', imageMaxWidth: '100%' } },
  { name: 'Mobile Premium', description: '高級感のある余白と大きめタイポグラフィ。',
    prompt: 'Optimize for a premium feel on mobile: generous spacing (24px+), large headings (clamp 1.5rem-2rem), subtle dividers, 48px tap targets, sticky bottom CTA.',
    rules: { minFontPx: 17, minLineHeight: 1.7, minTapPx: 48, ctaWidth: '100%', stickyCta: true, spacing: '24px', tableLayout: 'card' } },
  { name: 'Mobile Media', description: 'メディア/ニュース系。見出しと記事リストの密度を最適化。',
    prompt: 'Optimize for media/news sites on mobile: compact article cards, clear headline hierarchy, lazy-loaded images, fast first paint, ads between articles not above the fold.',
    rules: { minFontPx: 16, minLineHeight: 1.6, minTapPx: 44, cardLayout: 'list', adPosition: 'between', lazyImages: true } },
  { name: 'Mobile Affiliate', description: 'アフィリエイト向け。CTAと広告の視認性を最大化。',
    prompt: 'Optimize for affiliate conversions on mobile: CTA within first viewport, comparison table as cards, affiliate ad containers full width but never modify ad code, repeated CTA after each section.',
    rules: { minFontPx: 16, minLineHeight: 1.6, minTapPx: 48, ctaWidth: '100%', tableLayout: 'card', ctaRepeat: true, adContainerWidth: '100%' } },
  { name: 'Mobile Minimal', description: 'ミニマル。要素を減らし読みやすさ最優先。',
    prompt: 'Optimize for minimal mobile layout: hide secondary banners and sidebars, single column, max 1 ad per screen, large whitespace, text-first.',
    rules: { minFontPx: 17, minLineHeight: 1.8, minTapPx: 44, hideSecondary: true, maxAdsPerScreen: 1, columns: 1 } },
  { name: 'Mobile Magazine', description: 'マガジン風。ビジュアル重視のカードレイアウト。',
    prompt: 'Optimize for magazine layout on mobile: hero image with overlay title, 2-column image cards on 390px+, 1-column on 320px, pull quotes, bold typography.',
    rules: { minFontPx: 16, minLineHeight: 1.6, minTapPx: 44, cardLayout: 'grid', heroOverlay: true, gridMinWidth: 390 } },
  { name: 'Mobile Comparison', description: '比較サイト向け。比較表をモバイルカードへ変換。',
    prompt: 'Optimize comparison content for mobile: convert tables to swipeable cards, highlight the recommended item, sticky compare bar, price prominent.',
    rules: { minFontPx: 16, minLineHeight: 1.6, minTapPx: 48, tableLayout: 'card', stickyCompare: true, highlightRecommended: true } },
  { name: 'Mobile Product', description: '商品ページ向け。画像ギャラリーと購入ボタン最適化。',
    prompt: 'Optimize product pages for mobile: square image gallery, price and CTA above the fold, collapsible spec accordion, sticky buy button.',
    rules: { minFontPx: 16, minLineHeight: 1.6, minTapPx: 48, stickyCta: true, accordionSpecs: true, imageRatio: '1:1' } },
  { name: 'Mobile Business', description: 'ビジネス/B2B向け。信頼感と問い合わせ導線。',
    prompt: 'Optimize for B2B/business sites on mobile: clean sans-serif, trust badges near CTA, short forms (max 4 fields), click-to-call button, FAQ accordion.',
    rules: { minFontPx: 16, minLineHeight: 1.7, minTapPx: 48, maxFormFields: 4, clickToCall: true, faqAccordion: true } },
  { name: 'Mobile Conversion', description: 'CVR最大化。摩擦を減らすレイアウト。',
    prompt: 'Optimize for maximum conversion rate on mobile: single primary CTA color, remove distractions, social proof above CTA, urgency copy, 56px CTA height, thumb-zone placement.',
    rules: { minFontPx: 16, minLineHeight: 1.6, minTapPx: 56, ctaWidth: '100%', stickyCta: true, singlePrimaryColor: true, socialProof: true } }
];

function themeCss(t) {
  return `:root{--c-primary:${t.primary};--c-secondary:${t.secondary};--c-accent:${t.accent};--c-bg:${t.bg};--c-surface:${t.surface};--c-text:${t.text};--c-muted:${t.muted};--radius:${t.radius};--font-base:${t.font};--font-head:${t.fontHead};--max-w:${t.maxWidth}}
body{font-family:var(--font-base);background:var(--c-bg);color:var(--c-text)}
h1,h2,h3{font-family:var(--font-head)}
.site-header{background:${t.headerBg};color:${t.headerText}}
.btn-primary,.cta-button{background:var(--c-primary);color:#fff;border-radius:var(--radius)}
.cta-box{background:var(--c-surface);border:2px solid var(--c-accent);border-radius:var(--radius)}
.card{background:var(--c-surface);border-radius:var(--radius);box-shadow:${t.shadow}}
.site-footer{background:${t.footerBg};color:${t.footerText}}`;
}

const base = { radius: '8px', font: "system-ui,-apple-system,'Segoe UI',Roboto,'Hiragino Sans','Noto Sans JP',sans-serif", fontHead: 'inherit', maxWidth: '1100px', shadow: '0 2px 8px rgba(0,0,0,.06)' };
const T = (o) => ({ ...base, ...o });

export const DESIGN_THEMES = [
  { name: 'Clean Blue', category: 'business', description: '信頼感のあるブルー基調のクリーンデザイン',
    tokens: T({ primary: '#2563eb', secondary: '#1e40af', accent: '#3b82f6', bg: '#f8fafc', surface: '#ffffff', text: '#0f172a', muted: '#64748b', headerBg: '#ffffff', headerText: '#0f172a', footerBg: '#0f172a', footerText: '#e2e8f0' }) },
  { name: 'Warm Affiliate', category: 'affiliate', description: 'オレンジCTAでコンバージョン重視',
    tokens: T({ primary: '#ea580c', secondary: '#9a3412', accent: '#f97316', bg: '#fffbeb', surface: '#ffffff', text: '#1c1917', muted: '#78716c', headerBg: '#1c1917', headerText: '#ffffff', footerBg: '#1c1917', footerText: '#d6d3d1', radius: '12px' }) },
  { name: 'Dark Tech', category: 'tech', description: 'ダークモード基調のテック系デザイン',
    tokens: T({ primary: '#22d3ee', secondary: '#0e7490', accent: '#a78bfa', bg: '#0b1020', surface: '#151b2e', text: '#e5e7eb', muted: '#9ca3af', headerBg: '#0b1020', headerText: '#e5e7eb', footerBg: '#05070f', footerText: '#9ca3af', shadow: '0 2px 12px rgba(0,0,0,.5)' }) },
  { name: 'Green Natural', category: 'lifestyle', description: '自然・健康系に合うグリーン',
    tokens: T({ primary: '#16a34a', secondary: '#166534', accent: '#84cc16', bg: '#f7fdf7', surface: '#ffffff', text: '#14532d', muted: '#4d7c0f', headerBg: '#16a34a', headerText: '#ffffff', footerBg: '#14532d', footerText: '#dcfce7', radius: '16px' }) },
  { name: 'Magazine Red', category: 'media', description: 'マガジン風の赤アクセント',
    tokens: T({ primary: '#dc2626', secondary: '#7f1d1d', accent: '#f59e0b', bg: '#ffffff', surface: '#fafafa', text: '#111827', muted: '#6b7280', headerBg: '#ffffff', headerText: '#dc2626', footerBg: '#111827', footerText: '#f3f4f6', radius: '2px', fontHead: "Georgia,'Noto Serif JP',serif" }) },
  { name: 'Minimal Mono', category: 'minimal', description: 'モノトーンのミニマルデザイン',
    tokens: T({ primary: '#111111', secondary: '#333333', accent: '#777777', bg: '#ffffff', surface: '#f5f5f5', text: '#111111', muted: '#777777', headerBg: '#ffffff', headerText: '#111111', footerBg: '#f5f5f5', footerText: '#333333', radius: '0px', shadow: 'none' }) },
  { name: 'Purple Premium', category: 'premium', description: '高級感のあるパープル',
    tokens: T({ primary: '#7c3aed', secondary: '#4c1d95', accent: '#c084fc', bg: '#faf5ff', surface: '#ffffff', text: '#1e1b4b', muted: '#6d28d9', headerBg: '#4c1d95', headerText: '#ffffff', footerBg: '#1e1b4b', footerText: '#ede9fe', radius: '14px' }) },
  { name: 'Comparison Table', category: 'comparison', description: '比較サイト向け、表の視認性重視',
    tokens: T({ primary: '#0891b2', secondary: '#155e75', accent: '#fbbf24', bg: '#f0f9ff', surface: '#ffffff', text: '#0c4a6e', muted: '#64748b', headerBg: '#0891b2', headerText: '#ffffff', footerBg: '#155e75', footerText: '#e0f2fe', radius: '6px' }) },
  { name: 'Product Showcase', category: 'product', description: '商品紹介向け、画像が映える',
    tokens: T({ primary: '#db2777', secondary: '#9d174d', accent: '#fb7185', bg: '#fff1f2', surface: '#ffffff', text: '#1f2937', muted: '#9f1239', headerBg: '#ffffff', headerText: '#db2777', footerBg: '#9d174d', footerText: '#ffe4e6', radius: '20px' }) },
  { name: 'Corporate Navy', category: 'business', description: 'コーポレート向けネイビー',
    tokens: T({ primary: '#1e3a8a', secondary: '#172554', accent: '#eab308', bg: '#f1f5f9', surface: '#ffffff', text: '#0f172a', muted: '#475569', headerBg: '#1e3a8a', headerText: '#ffffff', footerBg: '#172554', footerText: '#cbd5e1', radius: '4px' }) }
].map(t => ({ ...t, css: themeCss(t.tokens) }));

export const RESPONSIVE_SETS = [
  { name: 'Standard Responsive', description: 'Desktop 1100px / Tablet 90% / Mobile 100%',
    desktop_config: { containerWidth: '1100px', columns: 2, sidebar: 'right', fontSize: '1rem', padding: '2rem', adWidth: '300px', ctaWidth: '320px', tableLayout: 'table' },
    tablet_config: { containerWidth: '90%', columns: 1, sidebar: 'bottom', fontSize: '1rem', padding: '1.5rem', adWidth: '80%', ctaWidth: '80%', tableLayout: 'scroll' },
    mobile_config: { containerWidth: '100%', columns: 1, sidebar: 'none', fontSize: '1rem', padding: '1rem', adWidth: '100%', ctaWidth: '100%', tableLayout: 'card', navigation: 'hamburger' },
    breakpoints: { tablet: 1024, mobile: 767 } },
  { name: 'Wide Content', description: '広いコンテンツ幅、サイドバー無し',
    desktop_config: { containerWidth: '1280px', columns: 1, sidebar: 'none', fontSize: '1.0625rem', padding: '2rem', adWidth: '728px', ctaWidth: '400px', tableLayout: 'table' },
    tablet_config: { containerWidth: '95%', columns: 1, sidebar: 'none', fontSize: '1rem', padding: '1.25rem', adWidth: '100%', ctaWidth: '90%', tableLayout: 'scroll' },
    mobile_config: { containerWidth: '100%', columns: 1, sidebar: 'none', fontSize: '1rem', padding: '0.875rem', adWidth: '100%', ctaWidth: '100%', tableLayout: 'card', navigation: 'hamburger' },
    breakpoints: { tablet: 1100, mobile: 767 } },
  { name: 'Compact Mobile First', description: 'モバイルファーストのコンパクト設定',
    desktop_config: { containerWidth: '960px', columns: 1, sidebar: 'none', fontSize: '1rem', padding: '1.5rem', adWidth: '300px', ctaWidth: '300px', tableLayout: 'table' },
    tablet_config: { containerWidth: '100%', columns: 1, sidebar: 'none', fontSize: '1rem', padding: '1rem', adWidth: '100%', ctaWidth: '100%', tableLayout: 'card' },
    mobile_config: { containerWidth: '100%', columns: 1, sidebar: 'none', fontSize: '1.0625rem', padding: '0.75rem', adWidth: '100%', ctaWidth: '100%', tableLayout: 'card', navigation: 'bottom-bar' },
    breakpoints: { tablet: 900, mobile: 600 } }
];

export const AFFILIATE_PROGRAMS = [
  { name: 'A8.net', provider: 'A8', website: 'https://www.a8.net/', notes: '国内最大級ASP' },
  { name: 'もしもアフィリエイト', provider: 'moshimo', website: 'https://af.moshimo.com/', notes: '' },
  { name: 'バリューコマース', provider: 'valuecommerce', website: 'https://www.valuecommerce.ne.jp/', notes: '' }
];
