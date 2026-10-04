// 25 AI functions built on the provider abstraction. All inputs pass through filterForAI().
// Every analysis returns a structured object: { data_used, reasoning, possible_causes, suggestions, uncertainty, ... }
// The AI is instructed to NEVER assert causation definitively.
import { getProvider } from './provider.js';
import { filterForAI } from '../lib/security.js';

const SYSTEM_BASE = `You are an expert assistant for an affiliate website platform (Japanese market). Always answer in Japanese.
Return ONLY valid JSON (no markdown, no code fences). Be concrete and practical.
Never claim definitive causation; use language like "可能性があります" / "推測されます". Include an "uncertainty" field describing data limitations.
Never modify or propose modifying affiliate ad code (href/src/tracking parameters).`;

export function extractJson(text) {
  if (!text) return null;
  let s = String(text).trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  try { return JSON.parse(s); } catch {}
  const first = s.search(/[{[]/);
  if (first === -1) return null;
  // find matching bracket
  const open = s[first]; const close = open === '{' ? '}' : ']';
  let depth = 0, inStr = false, esc = false;
  for (let i = first; i < s.length; i++) {
    const ch = s[i];
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) { depth--; if (depth === 0) { const block = s.slice(first, i + 1); try { return JSON.parse(block); } catch {} try { return JSON.parse(block.replace(/,\s*([}\]])/g, '$1')); } catch { break; } } }
  }
  // last resort: fix trailing commas
  try { return JSON.parse(s.slice(first).replace(/,\s*([}\]])/g, '$1')); } catch {}
  // Repair truncated JSON (output cut off by max_tokens): close open strings/brackets.
  return repairTruncated(s.slice(first));
}

export function repairTruncated(s) {
  const stack = []; let inStr = false, esc = false, out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]; out += ch;
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === '"') inStr = false; continue; }
    if (ch === '"') inStr = true; else if (ch === '{' || ch === '[') stack.push(ch); else if (ch === '}' || ch === ']') stack.pop();
  }
  if (inStr) out += '"';
  // drop a dangling key or trailing comma/colon
  out = out.replace(/,\s*$/, '').replace(/:\s*$/, ':null').replace(/"[^"]*"\s*$/, (m, off) => /[\[,{]\s*$/.test(out.slice(0, off)) && stack[stack.length - 1] === '{' ? '' : m).replace(/,\s*$/, '');
  while (stack.length) out += stack.pop() === '{' ? '}' : ']';
  for (const cand of [out, out.replace(/,\s*([}\]])/g, '$1')]) { try { const v = JSON.parse(cand); if (v && typeof v === 'object') { v.__truncated = true; return v; } } catch {} }
  return null;
}

async function ask(task, schemaHint, payload, { temperature = 0.4, maxTokens = 2048, retries = 1 } = {}) {
  const provider = getProvider();
  const safe = filterForAI(payload);
  const user = `TASK: ${task}\n\nOUTPUT JSON SCHEMA (keys and types; fill all):\n${schemaHint}\n\nINPUT DATA:\n${JSON.stringify(safe, null, 1).slice(0, 12000)}`;
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    const r = await provider.chat([{ role: 'system', content: SYSTEM_BASE }, { role: 'user', content: user }], { temperature, maxTokens, json: true });
    const parsed = extractJson(r.content);
    if (parsed && typeof parsed === 'object') {
      return { result: normalize(parsed), raw: r.content, model: r.model, provider: provider.name, durationMs: r.durationMs, inputSummary: safe };
    }
    lastErr = new Error('AI returned non-JSON output: ' + r.content.slice(0, 200));
  }
  throw lastErr;
}

// Guarantee the analysis contract keys exist even when a small model omits them.
function normalize(obj) {
  if (Array.isArray(obj)) return { items: obj, uncertainty: 'モデル出力が配列形式のため、一部キーを補完しました' };
  const o = { ...obj };
  if ('possible_causes' in o || 'data_used' in o || 'suggestions' in o || 'reasoning' in o) {
    o.data_used = Array.isArray(o.data_used) ? o.data_used : (o.data_used ? [String(o.data_used)] : []);
    o.possible_causes = Array.isArray(o.possible_causes) ? o.possible_causes : (o.possible_causes ? [String(o.possible_causes)] : []);
    o.suggestions = Array.isArray(o.suggestions) ? o.suggestions.filter(s => s && typeof s === 'object').map(s => ({ ...s, title: s.title || s.description || '改善案' })) : [];
    o.reasoning = o.reasoning ? String(o.reasoning) : '';
  }
  if (o.__truncated) { delete o.__truncated; o.uncertainty = (o.uncertainty ? o.uncertainty + ' / ' : '') + '注意: AI出力がトークン上限で途中で切れたため、一部を自動修復しました（内容が不完全な可能性）。AI_MAX_TOKENSを増やすか再実行してください。'; }
  if (!o.uncertainty) o.uncertainty = 'AIの出力に不確実性の記載がありません。データ量・期間・外部要因により結果は変動する可能性があります。';
  return o;
}

const ANALYSIS_SCHEMA = `{"data_used": string[], "reasoning": string, "possible_causes": string[], "suggestions": [{"title": string, "category": "SEO|CONTENT|CTA|DESIGN|MOBILE|AFFILIATE|INTERNAL_LINK|CONVERSION|REVENUE", "description": string, "rationale": string, "priority": "high|medium|low"}], "uncertainty": string, "summary": string}`;

export const ai = {
  // 1. 広告タイトル分析
  analyzeAdTitle: (adTitle) => ask('広告タイトルを分析し、商品カテゴリ・ターゲット・訴求ポイント・競合・検索意図を抽出',
    `{"product_category": string, "target_audience": string[], "selling_points": string[], "competitors": string[], "search_intent": string, "keywords": string[], "uncertainty": string}`, { adTitle }),
  // 2. サイトテーマ分析
  analyzeSiteTheme: (adTitle, extra = {}) => ask('この広告のためのアフィリエイトサイトのテーマ・ターゲット・カテゴリ・SEOキーワード・CTA候補・比較表候補を提案',
    `{"site_name": string, "theme": string, "target_audience": string, "categories": [{"name": string, "slug": string, "description": string}], "seo_keywords": string[], "cta_candidates": string[], "comparison_candidates": [{"name": string, "features": string[]}], "article_ideas": [{"title": string, "intent": string}], "uncertainty": string}`,
    { adTitle, ...extra }, { maxTokens: 3000 }),
  // 3. サイト構造生成
  generateSiteStructure: (theme) => ask('サイトのページ構造(ホーム/カテゴリ/記事/比較/FAQ)を生成。各ページにslug, title, seo_title, meta_description, componentsの配列',
    `{"pages": [{"title": string, "slug": string, "page_type": "home|page|article|category", "seo_title": string, "meta_description": string, "components": [{"type": "heading|text|image|button|cta|affiliate_ad|comparison_table|ranking|faq|banner|spacer|divider", "props": object}]}]}`,
    theme, { maxTokens: 4000 }),
  // 4. カテゴリ生成
  generateCategories: (theme) => ask('サイトのカテゴリを5-8個生成', `{"categories": [{"name": string, "slug": string, "description": string}]}`, theme),
  // 5. 記事構成生成
  generateArticlePlan: (theme, count = 6) => ask(`記事案を${count}件生成。各記事にタイトル・検索意図・ターゲットキーワード・見出し案`,
    `{"articles": [{"title": string, "slug": string, "intent": string, "keywords": string[], "outline": string[]}]}`, theme, { maxTokens: 3000 }),
  // 6. SEOタイトル生成
  generateSeoTitle: (input) => ask('SEOタイトル候補を5件生成(32文字以内、キーワード前方)', `{"titles": string[], "recommended": string, "reasoning": string}`, input),
  // 7. Meta Description生成
  generateMetaDescription: (input) => ask('Meta Description候補を3件生成(80-120文字)', `{"descriptions": string[], "recommended": string}`, input),
  // 8. 見出し構成生成
  generateHeadings: (input) => ask('記事のH2/H3見出し構成を生成', `{"headings": [{"level": 2|3, "text": string}]}`, input),
  // 9. コンテンツ生成
  generateContent: (input) => ask('見出し構成に基づき記事本文をHTML(h2,h3,p,ul,li,strong のみ)で生成。1200文字以上。断定的な効果保証は避ける',
    `{"title": string, "html": string, "summary": string}`, input, { maxTokens: 4000, temperature: 0.6 }),
  // 10. デザイン提案
  suggestDesign: (input) => ask('サイトテーマに合うデザイン方向性(配色・フォント・雰囲気)を提案し、候補テーマ名リストから最適なものを選択',
    `{"recommended_theme": string, "reasoning": string, "palette": {"primary": string, "secondary": string, "accent": string, "bg": string, "text": string}, "font_style": string, "mood": string}`, input),
  // 11. デザイン生成
  generateDesign: (input) => ask('新しいデザインテーマのトークンを生成(hex色、フォント、角丸)。name, description含む',
    `{"name": string, "description": string, "category": string, "tokens": {"primary": string, "secondary": string, "accent": string, "bg": string, "surface": string, "text": string, "muted": string, "headerBg": string, "headerText": string, "footerBg": string, "footerText": string, "radius": string, "font": string, "fontHead": string}}`, input),
  // 12. レスポンシブデザイン分析
  analyzeResponsive: (input) => ask('Desktop/Tablet/Mobile設定とコンポーネント構成を分析し、レスポンシブ上の問題と改善案を提示', ANALYSIS_SCHEMA, input, { maxTokens: 2500 }),
  // 13. スマートフォン最適化
  optimizeMobile: (input) => ask('Mobile Promptのルールに従い、各コンポーネントのmobile_configの具体的な変更案を生成。変更はcomponent_id単位で from/to を明記。広告コードは変更しない',
    `{"summary": string, "reasoning": string, "changes": [{"component_id": number, "field": string, "from": any, "to": any, "reason": string}], "css_suggestions": string[], "uncertainty": string}`, input, { maxTokens: 3000 }),
  // 14. モバイル問題分析
  analyzeMobileIssues: (input) => ask('Mobile Quality Checkの結果とモバイル指標を分析し、問題の重要度と対処案を提示', ANALYSIS_SCHEMA, input, { maxTokens: 2500 }),
  // 15. アクセス分析
  analyzeAccess: (input) => ask('アクセスデータ(PV/Visits/デバイス別/ページ別)を分析', ANALYSIS_SCHEMA, input, { maxTokens: 2500 }),
  // 16. クリック分析
  analyzeClicks: (input) => ask('広告クリックデータ(CTR、広告別、ページ別、デバイス別)を分析', ANALYSIS_SCHEMA, input, { maxTokens: 2500 }),
  // 17. 成果分析
  analyzeConversions: (input) => ask('コンバージョンデータ(CV数、CVR、広告別、デバイス別)を分析', ANALYSIS_SCHEMA, input, { maxTokens: 2500 }),
  // 18. 収益分析
  analyzeRevenue: (input) => ask('収益データ(広告別、デバイス別、期間別)を分析', ANALYSIS_SCHEMA, input, { maxTokens: 2500 }),
  // 19. SEO分析
  analyzeSeo: (input) => ask('ページのSEO要素(title, meta, 見出し構造, 内部リンク, 構造化データ, canonical, robots)を分析', ANALYSIS_SCHEMA, input, { maxTokens: 2500 }),
  // 20. CTA分析
  analyzeCta: (input) => ask('CTAの配置・文言・サイズ・デバイス別のview/click指標を分析', ANALYSIS_SCHEMA, input, { maxTokens: 2500 }),
  // 21. 広告配置分析
  analyzeAdPlacement: (input) => ask('広告配置(位置、順番、デバイス別クリック)を分析。広告コード自体は変更しない前提でコンテナ配置の改善案を提示', ANALYSIS_SCHEMA, input, { maxTokens: 2500 }),
  // 22. A/Bテスト分析
  analyzeAbTest: (input) => ask('A/Bテスト結果を分析。サンプル数が不足している場合は "判断にはデータ不足" と明記し勝者を決めない',
    `{"data_used": string[], "reasoning": string, "sufficient_data": boolean, "leaning": "A|B|none", "possible_causes": string[], "suggestions": [{"title": string, "category": string, "description": string, "rationale": string, "priority": string}], "uncertainty": string, "summary": string}`, input, { maxTokens: 2500 }),
  // 23. 改善案生成
  generateRecommendations: (input) => ask('分析結果と現状データから具体的な改善案を生成。各改善案はcategory(SEO|CONTENT|CTA|DESIGN|MOBILE|AFFILIATE|INTERNAL_LINK|CONVERSION|REVENUE)と、可能なら proposed_changes(component_id, field, from, to)を含む',
    `{"recommendations": [{"title": string, "category": string, "description": string, "rationale": string, "uncertainty": string, "priority": "high|medium|low", "proposed_changes": [{"component_id": number, "field": string, "from": any, "to": any}]}]}`, input, { maxTokens: 3000 }),
  // 24. 改善後分析
  analyzePostChange: (input) => ask('改善前後の指標を比較分析。因果関係を断定せず、外部要因の可能性も示す', ANALYSIS_SCHEMA, input, { maxTokens: 2500 }),
  // 25. サイト改善提案
  suggestSiteImprovements: (input) => ask('サイト全体(構造、コンテンツ、デザイン、モバイル、広告、SEO、収益)の総合改善提案', ANALYSIS_SCHEMA, input, { maxTokens: 3000 })
};

export const AI_FUNCTION_LIST = [
  ['analyzeAdTitle', '広告タイトル分析'], ['analyzeSiteTheme', 'サイトテーマ分析'], ['generateSiteStructure', 'サイト構造生成'], ['generateCategories', 'カテゴリ生成'],
  ['generateArticlePlan', '記事構成生成'], ['generateSeoTitle', 'SEOタイトル生成'], ['generateMetaDescription', 'Meta Description生成'], ['generateHeadings', '見出し構成生成'],
  ['generateContent', 'コンテンツ生成'], ['suggestDesign', 'デザイン提案'], ['generateDesign', 'デザイン生成'], ['analyzeResponsive', 'レスポンシブデザイン分析'],
  ['optimizeMobile', 'スマートフォン最適化'], ['analyzeMobileIssues', 'モバイル問題分析'], ['analyzeAccess', 'アクセス分析'], ['analyzeClicks', 'クリック分析'],
  ['analyzeConversions', '成果分析'], ['analyzeRevenue', '収益分析'], ['analyzeSeo', 'SEO分析'], ['analyzeCta', 'CTA分析'], ['analyzeAdPlacement', '広告配置分析'],
  ['analyzeAbTest', 'A/Bテスト分析'], ['generateRecommendations', '改善案生成'], ['analyzePostChange', '改善後分析'], ['suggestSiteImprovements', 'サイト改善提案']
];
