import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateSiteContent(affiliateTitle: string, description?: string): Promise<{
  siteName: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  pages: Array<{ title: string; slug: string; content: string; pageType: string }>
  suggestions: string[]
}> {
  const prompt = `
あなたはSEOとアフィリエイトマーケティングの専門家です。
以下のアフィリエイトタイトルに基づいて、日本語のWebサイトコンテンツを生成してください。

アフィリエイトタイトル: ${affiliateTitle}
${description ? `説明: ${description}` : ''}

以下のJSON形式で回答してください：
{
  "siteName": "サイト名",
  "metaTitle": "SEO最適化されたページタイトル（60文字以内）",
  "metaDescription": "メタディスクリプション（160文字以内）",
  "metaKeywords": "キーワード1,キーワード2,キーワード3",
  "pages": [
    {
      "title": "メインページタイトル",
      "slug": "main",
      "pageType": "ARTICLE",
      "content": "記事の本文（HTML形式、500文字以上）"
    },
    {
      "title": "比較ページタイトル",
      "slug": "comparison",
      "pageType": "COMPARISON",
      "content": "比較コンテンツ"
    }
  ],
  "suggestions": ["改善提案1", "改善提案2", "改善提案3"]
}
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 3000,
  })

  const result = JSON.parse(completion.choices[0].message.content || '{}')
  return result
}

export async function generateMobileOptimization(
  siteData: Record<string, unknown>,
  mobilePrompt: string,
  currentCss?: string
): Promise<{
  recommendations: Array<{
    component: string
    issue: string
    suggestion: string
    cssChange?: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    uncertainty: string
  }>
  generalAdvice: string
  checklist: Record<string, 'PASS' | 'WARNING' | 'ERROR'>
}> {
  const prompt = `
あなたはレスポンシブWebデザインとモバイルUXの専門家です。
以下のサイト情報とモバイル最適化プロンプトを分析し、改善案を提案してください。

サイト情報:
${JSON.stringify(siteData, null, 2)}

モバイル最適化プロンプト:
${mobilePrompt}

${currentCss ? `現在のCSS（抜粋）:\n${currentCss}` : ''}

以下のJSON形式で回答してください：
{
  "recommendations": [
    {
      "component": "コンポーネント名（例: CTA, 比較表, ナビゲーション）",
      "issue": "問題の説明",
      "suggestion": "改善案",
      "cssChange": "推奨CSSの変更（オプション）",
      "priority": "HIGH|MEDIUM|LOW",
      "uncertainty": "不確実性・注意点"
    }
  ],
  "generalAdvice": "全体的なアドバイス",
  "checklist": {
    "横スクロール": "PASS|WARNING|ERROR",
    "文字サイズ": "PASS|WARNING|ERROR",
    "ボタンサイズ": "PASS|WARNING|ERROR",
    "CTAサイズ": "PASS|WARNING|ERROR",
    "画像サイズ": "PASS|WARNING|ERROR",
    "比較表": "PASS|WARNING|ERROR",
    "ナビゲーション": "PASS|WARNING|ERROR",
    "フォーム": "PASS|WARNING|ERROR",
    "余白": "PASS|WARNING|ERROR",
    "ページ構造": "PASS|WARNING|ERROR"
  }
}

重要：
- 原因を断定せず、「可能性があります」「推奨します」などの表現を使用
- データが不足する場合はその旨を明記
- AIが勝手に本番サイトを変更しないよう提案のみ行う
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 2000,
  })

  return JSON.parse(completion.choices[0].message.content || '{}')
}

export async function generateAiRecommendations(analyticsData: Record<string, unknown>, siteData: Record<string, unknown>): Promise<Array<{
  type: string
  title: string
  description: string
  reasoning: string
  dataUsed: Record<string, unknown>
  uncertainty: string
  priority: number
}>> {
  const prompt = `
あなたはデジタルマーケティングとアフィリエイト最適化の専門家です。
以下のアクセス解析データとサイト情報を分析し、改善提案を生成してください。

アクセス解析データ:
${JSON.stringify(analyticsData, null, 2)}

サイト情報:
${JSON.stringify(siteData, null, 2)}

以下のJSON形式で回答してください：
{
  "recommendations": [
    {
      "type": "SEO|CONTENT|CTA|DESIGN|MOBILE|AFFILIATE|INTERNAL_LINK|CONVERSION|REVENUE",
      "title": "改善提案タイトル",
      "description": "具体的な改善内容",
      "reasoning": "分析根拠（データを参照）",
      "dataUsed": {"使用データキー": "値"},
      "uncertainty": "不確実性・注意点",
      "priority": 1〜5の整数（1が最高優先度）
    }
  ]
}

重要：
- 原因を断定せず可能性として提案する
- 使用したデータを明記する
- 不確実性を明記する
- 最低3件、最大8件の提案を生成する
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 2500,
  })

  const result = JSON.parse(completion.choices[0].message.content || '{"recommendations":[]}')
  return result.recommendations || []
}

export async function optimizeMobilePrompt(rawPrompt: string): Promise<string> {
  const prompt = `
あなたはモバイルUXとレスポンシブWebデザインの専門家です。
以下のモバイル最適化プロンプトをより具体的かつ実用的に改善してください。

元のプロンプト:
${rawPrompt}

改善のポイント：
- 具体的なCSS値を含める（px、rem、%等）
- チェックポイントを明確にする
- モバイルファースト設計を意識する
- アクセシビリティも考慮する

改善されたプロンプトを日本語で回答してください（JSON不要、テキストのみ）。
`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
  })

  return completion.choices[0].message.content || rawPrompt
}
