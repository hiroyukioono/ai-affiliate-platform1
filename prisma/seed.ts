import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'ADMIN',
    },
  })
  console.log('Admin user created:', admin.email)

  // Design Themes
  const themes = [
    {
      name: 'Modern Media',
      description: 'クリーンでモダンなメディアサイト向けデザイン',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      fontFamily: "'Noto Sans JP', sans-serif",
      cssVariables: JSON.stringify({
        '--radius': '0.5rem',
        '--shadow': '0 4px 6px -1px rgba(0,0,0,0.1)',
        '--header-height': '64px',
      }),
      layoutConfig: JSON.stringify({
        maxWidth: '1200px',
        sidebar: true,
        sidebarWidth: '300px',
        headerFixed: true,
      }),
      isDefault: true,
    },
    {
      name: 'Premium Review',
      description: '高品質なレビューサイト向けプレミアムデザイン',
      primaryColor: '#8B5CF6',
      secondaryColor: '#6D28D9',
      fontFamily: "'Noto Serif JP', serif",
      cssVariables: JSON.stringify({
        '--radius': '0.75rem',
        '--shadow': '0 10px 25px -5px rgba(0,0,0,0.15)',
        '--header-height': '72px',
      }),
      layoutConfig: JSON.stringify({
        maxWidth: '1100px',
        sidebar: true,
        sidebarWidth: '280px',
        headerFixed: true,
      }),
      isDefault: false,
    },
    {
      name: 'Technology Media',
      description: 'テクノロジー・IT系メディア向けデザイン',
      primaryColor: '#10B981',
      secondaryColor: '#047857',
      fontFamily: "'IBM Plex Sans JP', sans-serif",
      cssVariables: JSON.stringify({
        '--radius': '0.25rem',
        '--shadow': '0 2px 8px rgba(0,0,0,0.12)',
        '--header-height': '60px',
      }),
      layoutConfig: JSON.stringify({
        maxWidth: '1280px',
        sidebar: false,
        headerFixed: true,
      }),
      isDefault: false,
    },
    {
      name: 'Lifestyle Blog',
      description: 'ライフスタイル・ファッション系ブログ向けデザイン',
      primaryColor: '#EC4899',
      secondaryColor: '#BE185D',
      fontFamily: "'Noto Sans JP', sans-serif",
      cssVariables: JSON.stringify({
        '--radius': '1rem',
        '--shadow': '0 8px 20px rgba(0,0,0,0.1)',
        '--header-height': '68px',
      }),
      layoutConfig: JSON.stringify({
        maxWidth: '1100px',
        sidebar: true,
        sidebarWidth: '320px',
        headerFixed: false,
      }),
      isDefault: false,
    },
    {
      name: 'Business Pro',
      description: 'ビジネス・金融・保険系メディア向けデザイン',
      primaryColor: '#1E3A5F',
      secondaryColor: '#2E5090',
      fontFamily: "'Noto Sans JP', sans-serif",
      cssVariables: JSON.stringify({
        '--radius': '0.375rem',
        '--shadow': '0 4px 12px rgba(0,0,0,0.08)',
        '--header-height': '70px',
      }),
      layoutConfig: JSON.stringify({
        maxWidth: '1200px',
        sidebar: true,
        sidebarWidth: '290px',
        headerFixed: true,
      }),
      isDefault: false,
    },
  ]

  for (const theme of themes) {
    await prisma.designTheme.upsert({
      where: { name: theme.name } as any,
      update: theme,
      create: theme,
    })
  }
  console.log('Design themes created')

  // Mobile Prompts
  const mobilePrompts = [
    {
      name: 'Mobile Standard',
      description: '日本向けWebメディア向け標準モバイル最適化',
      targetDevice: 'MOBILE',
      priority: 1,
      prompt: `日本向けWebメディア向けの標準的なスマートフォン最適化を行います。

【レイアウト】
- スマートフォンでは1カラムレイアウトを使用
- コンテンツは縦方向に積み重ねる
- 最大幅は100vwを超えない

【文字・フォント】
- 本文フォントサイズ: 16px以上
- 行間: 1.7以上
- 見出しは適切な階層で表示

【CTA・ボタン】
- CTAボタンは横幅の80%以上
- タップ領域は最低44px × 44px
- 上下余白は16px以上

【画像】
- max-width: 100%
- height: auto
- Lazy Loading対応

【比較表】
- 横スクロール可能に設定
- overflow-x: auto
- white-space: nowrap（テーブル内）

【広告】
- コンテンツの邪魔にならない位置に配置
- 記事下または記事間に配置

【ナビゲーション】
- ハンバーガーメニューを使用
- 重要ページへのリンクを明確に

【余白】
- padding: 16px
- margin-bottom: 24px（セクション間）`,
    },
    {
      name: 'Mobile Premium',
      description: '高級感のあるスマートフォンUI',
      targetDevice: 'MOBILE',
      priority: 2,
      prompt: `高級感と洗練されたUXを実現するプレミアムモバイル最適化を行います。

【レイアウト】
- 余白を広めに取る（padding: 20px以上）
- コンテンツ間のmarginを広く設定
- カードUIを積極的に活用

【フォント・可読性】
- 本文フォントサイズ: 17px以上
- 行間: 1.8以上
- カラーコントラスト比4.5:1以上

【CTA】
- 大きく視認しやすい
- グラデーションや影を活用
- アニメーションで注目を集める

【カード・コンポーネント】
- 角丸を大きめに（border-radius: 12px以上）
- 影を活用（box-shadow使用）
- カード間余白を広く

【画像】
- 高解像度対応
- WebP形式を優先
- アスペクト比を維持

【広告】
- 広告感を抑制
- コンテンツに自然に溶け込む配置
- ユーザー体験を最優先

【ナビゲーション】
- スムーズなアニメーション
- 洗練されたハンバーガーメニュー`,
    },
    {
      name: 'Mobile Media',
      description: 'ニュース・メディア向けモバイル最適化',
      targetDevice: 'MOBILE',
      priority: 3,
      prompt: `ニュース・メディアサイト向けのモバイル最適化を行います。

【記事表示】
- タイトルは読みやすいサイズ（22px以上）
- リード文を明確に表示
- 本文は16px、行間1.8

【カテゴリーナビゲーション】
- 水平スクロール可能なカテゴリーバー
- アクティブカテゴリーを明確に表示

【記事一覧】
- カード形式で表示
- サムネイル画像は16:9比率
- 公開日時を表示

【関連記事】
- カード形式で横並びスクロール
- または縦方向に3件表示

【広告】
- 記事本文途中に自然な形で配置
- 記事下に配置
- ファーストビューには配置しない

【画像】
- ヒーロー画像は画面幅100%
- 本文内画像はmax-width: 100%
- キャプションを表示

【パフォーマンス】
- Lazy Loading必須
- 画像はWebP優先
- Critical CSSを分離`,
    },
    {
      name: 'Mobile Affiliate',
      description: 'アフィリエイトメディア向けモバイル最適化',
      targetDevice: 'MOBILE',
      priority: 4,
      prompt: `アフィリエイトメディア向けのモバイル最適化を行います。

【コンテンツと広告の分離】
- 広告とコンテンツを明確に区別
- ステルスマーケティングに見えない配置
- 「広告」「PR」ラベルを明示

【CTA最適化】
- CTAは横幅90%以上
- 目立つ色を使用（主要色）
- アクションを明確な文言で表示
- 複数CTAは適切な間隔で配置

【比較表】
- スマートフォン用に最適化
- 横スクロールまたはカード形式
- 重要項目（価格・特徴）を先頭に

【商品・サービス紹介】
- カード形式で見やすく
- 星評価を表示
- 価格を目立たせる

【ユーザー体験優先】
- 過剰な広告を配置しない
- ポップアップは最小限
- 離脱を防ぐ自然な導線

【フォーム】
- 入力欄を大きく（44px以上）
- ラベルを明確に
- エラー表示を分かりやすく`,
    },
    {
      name: 'Mobile Minimal',
      description: 'シンプル・ミニマルなモバイルUI',
      targetDevice: 'MOBILE',
      priority: 5,
      prompt: `ミニマルでクリーンなモバイルUI最適化を行います。

【デザイン原則】
- 余分な要素を排除
- 必要最低限の要素のみ表示
- ホワイトスペースを活用

【レイアウト】
- 1カラム
- 最大幅: 600px（中央寄せ）
- padding: 20px

【カラー】
- モノトーン基調
- アクセントカラーは1色
- テキストは高コントラスト

【フォント】
- シンプルなサンセリフ体
- 本文: 16px
- 行間: 1.75

【CTA】
- シンプルなボタンデザイン
- 過剰な装飾なし
- 横幅: 100%

【ナビゲーション】
- シンプルなハンバーガー
- 最重要リンクのみ表示

【広告】
- コンテンツ下部に配置
- 記事途中には配置しない`,
    },
    {
      name: 'Mobile Magazine',
      description: 'マガジン・雑誌系のリッチなモバイルUI',
      targetDevice: 'MOBILE',
      priority: 6,
      prompt: `マガジン・雑誌風のリッチなモバイルUI最適化を行います。

【ビジュアル重視】
- 大きなヒーロー画像
- フォントはエレガントに
- グリッドレイアウトを活用

【記事一覧】
- 大きなサムネイル画像
- タイトルはオーバーレイ表示
- カテゴリーラベルを表示

【特集コンテンツ】
- スワイプ可能なカルーセル
- 横スクロールのカード列

【フォント】
- 見出し: セリフ体推奨
- 本文: 読みやすいサンセリフ体
- 本文サイズ: 16px以上

【カラー】
- ブランドカラーを統一
- 写真を引き立てる背景

【CTA】
- 雑誌らしい洗練されたデザイン
- テキストリンク形式も活用

【広告】
- コンテンツに馴染む形で配置
- 広告感を抑制`,
    },
    {
      name: 'Mobile Comparison',
      description: '比較サイト向けモバイル最適化',
      targetDevice: 'MOBILE',
      priority: 7,
      prompt: `比較サイト向けのモバイル最適化を行います。

【比較表】
- 横スクロール可能なデザイン
- 左端に項目名を固定（sticky）
- 最初の比較列も固定推奨
- スクロールヒントを表示

【代替表示】
- カード形式への切り替えオプション
- 重要3項目のみ表示モード
- 詳細展開ボタン

【ランキング表示】
- 順位を大きく表示
- 1位を目立たせる
- 総合スコアを表示

【フィルター・絞り込み】
- タップしやすいフィルターUI
- 選択中の条件を明示

【CTA】
- 各商品のCTAを明確に
- 「詳細を見る」「公式サイトへ」
- 横幅100%のボタン

【価格表示】
- 大きく見やすい価格表示
- 税込・税別を明示
- 特価・割引を目立たせる`,
    },
    {
      name: 'Mobile Product',
      description: '商品紹介ページ向けモバイル最適化',
      targetDevice: 'MOBILE',
      priority: 8,
      prompt: `商品紹介ページ向けのモバイル最適化を行います。

【商品画像】
- スワイプ可能なギャラリー
- 拡大表示対応
- 横幅100%表示

【商品情報】
- 商品名を大きく表示
- 価格を目立たせる
- 評価・レビュー数を表示

【CTA（購入ボタン）】
- 画面固定の購入CTA
- 横幅100%
- 高さ56px以上
- 目立つカラー

【商品説明】
- 折りたたみ表示（続きを読む）
- 箇条書きで特徴を表示
- スペック表はスクロール対応

【レビュー】
- 星評価を大きく表示
- ユーザーレビューをカード形式

【関連商品】
- 横スクロールのカルーセル

【在庫・購入情報】
- 在庫状況を明示
- 送料・配送日を表示`,
    },
    {
      name: 'Mobile Business',
      description: 'ビジネス・サービス系向けモバイル最適化',
      targetDevice: 'MOBILE',
      priority: 9,
      prompt: `ビジネス・サービス系Webサイト向けのモバイル最適化を行います。

【信頼性・権威性】
- ロゴを適切なサイズで表示
- 実績・数値を大きく表示
- お客様の声をカード形式で

【サービス説明】
- アイコン付きの特徴一覧
- ステップ形式のフロー説明
- 比較表（横スクロール対応）

【CTA】
- 「無料相談」「お問い合わせ」等
- 固定フッターCTA
- 電話番号タップで発信

【フォーム】
- シンプルな入力フォーム
- 入力欄を大きく（44px以上）
- 必須・任意を明示
- エラー表示を分かりやすく

【信頼性向上】
- プライバシーマーク表示
- SSL証明書表示
- 運営会社情報を明示

【ナビゲーション】
- サービスメニューを明確に
- お問い合わせへのアクセスを容易に`,
    },
    {
      name: 'Mobile Conversion',
      description: 'コンバージョン最大化向けモバイル最適化',
      targetDevice: 'MOBILE',
      priority: 10,
      prompt: `コンバージョン率を最大化するためのモバイル最適化を行います。

【ファーストビュー最適化】
- キャッチコピーを大きく表示
- 主要CTAをファーストビューに配置
- 信頼性の証拠（実績・評価）を表示

【CTA戦略】
- ページ内複数箇所にCTAを配置
- スクロールに合わせた固定CTA
- CTAボタン: 横幅90%以上、高さ56px以上
- 緊急性・希少性の訴求

【信頼性構築】
- レビュー・評価を目立たせる
- メディア掲載・受賞歴を表示
- ユーザー数・利用実績を表示

【コンテンツ構造】
- AIDA（注意→興味→欲求→行動）を意識
- 問題提起→解決策→CTA の流れ

【離脱防止】
- 離脱時のポップアップ（最小限）
- スティッキーCTA

【フォーム最適化】
- 入力項目を最小限に
- ステップ形式で入力負荷を分散
- リアルタイムバリデーション

【パフォーマンス】
- LCP: 2.5秒以内を目標
- CLS: 0.1以下を目標`,
    },
  ]

  for (const mp of mobilePrompts) {
    const existing = await prisma.mobileDesignPrompt.findFirst({ where: { name: mp.name } })
    if (!existing) {
      await prisma.mobileDesignPrompt.create({ data: mp })
    }
  }
  console.log('Mobile prompts created')

  // Sample affiliate program
  const program = await prisma.affiliateProgram.upsert({
    where: { id: 'sample-program-1' },
    update: {},
    create: {
      id: 'sample-program-1',
      name: 'A8.net サンプルプログラム',
      network: 'A8.net',
      commission: 5.0,
      cookieDays: 30,
      status: 'ACTIVE',
    },
  })

  // Sample site
  const theme = await prisma.designTheme.findFirst({ where: { isDefault: true } })
  const mobilePrompt = await prisma.mobileDesignPrompt.findFirst({ where: { name: 'Mobile Standard' } })

  const site = await prisma.site.upsert({
    where: { slug: 'sample-affiliate-site' },
    update: {},
    create: {
      userId: admin.id,
      name: 'サンプルアフィリエイトサイト',
      slug: 'sample-affiliate-site',
      description: 'AIが生成したサンプルのアフィリエイトサイトです',
      affiliateTitle: 'おすすめクレジットカード比較2024',
      affiliateUrl: 'https://example.com/affiliate',
      status: 'PUBLISHED',
      themeId: theme?.id,
      mobilePromptId: mobilePrompt?.id,
      metaTitle: 'おすすめクレジットカード比較2024 | 専門家が厳選',
      metaDescription: '2024年最新のクレジットカード比較。専門家が厳選したおすすめカードを紹介。',
      publishedAt: new Date(),
    },
  })

  // Sample page
  await prisma.page.upsert({
    where: { id: 'sample-page-1' },
    update: {},
    create: {
      id: 'sample-page-1',
      siteId: site.id,
      title: 'おすすめクレジットカード比較2024',
      slug: 'credit-card-comparison',
      pageType: 'ARTICLE',
      status: 'PUBLISHED',
      content: JSON.stringify([
        {
          id: 'hero-1',
          type: 'hero',
          content: { title: 'おすすめクレジットカード比較2024', subtitle: '専門家が厳選した最高のクレジットカード' },
          desktopConfig: { display: 'block' },
          tabletConfig: { display: 'block' },
          mobileConfig: { display: 'block', fontSize: '1.5rem' },
        },
        {
          id: 'text-1',
          type: 'text',
          content: { body: 'クレジットカードを選ぶ際には、年会費、ポイント還元率、特典などを比較することが重要です。本記事では、2024年現在おすすめのクレジットカードを厳選してご紹介します。' },
          desktopConfig: { display: 'block' },
          tabletConfig: { display: 'block' },
          mobileConfig: { display: 'block', fontSize: '16px', lineHeight: '1.8' },
        },
        {
          id: 'cta-1',
          type: 'cta',
          content: { text: '詳細を確認する', url: '#', color: '#3B82F6' },
          desktopConfig: { width: '300px' },
          tabletConfig: { width: '80%' },
          mobileConfig: { width: '100%' },
        },
        {
          id: 'comparison-1',
          type: 'comparison',
          content: {
            title: 'クレジットカード比較表',
            headers: ['カード名', '年会費', 'ポイント還元率', '特典'],
            rows: [
              ['カードA', '無料', '1.0%', 'ショッピング保険'],
              ['カードB', '11,000円', '1.5%', '空港ラウンジ・旅行保険'],
              ['カードC', '3,300円', '1.2%', '映画・グルメ優待'],
            ],
          },
          desktopConfig: { display: 'block' },
          tabletConfig: { display: 'block' },
          mobileConfig: { display: 'block', tableStyle: 'scroll' },
        },
      ]),
    },
  })

  // Sample affiliate link
  await prisma.affiliateLink.upsert({
    where: { id: 'sample-link-1' },
    update: {},
    create: {
      id: 'sample-link-1',
      siteId: site.id,
      programId: program.id,
      name: 'クレジットカードA 申し込みリンク',
      originalUrl: 'https://example.com/card-a',
      trackingUrl: 'https://example.com/track/card-a',
      clicks: 245,
      conversions: 12,
      revenue: 48000,
      status: 'ACTIVE',
    },
  })

  // Sample analytics
  const today = new Date()
  const devices = ['DESKTOP', 'MOBILE', 'TABLET']
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    for (const device of devices) {
      const pvMult = device === 'MOBILE' ? 1.8 : device === 'DESKTOP' ? 1.2 : 0.5
      const ctrBase = device === 'MOBILE' ? 0.8 : device === 'DESKTOP' ? 2.4 : 1.5
      const pvBase = Math.floor(Math.random() * 200 + 100)
      await prisma.analytics.create({
        data: {
          siteId: site.id,
          date,
          device,
          pageViews: Math.floor(pvBase * pvMult),
          visits: Math.floor(pvBase * pvMult * 0.7),
          clicks: Math.floor(pvBase * pvMult * (ctrBase / 100)),
          conversions: Math.floor(pvBase * pvMult * 0.005),
          revenue: Math.floor(pvBase * pvMult * 0.005 * 4000),
          bounceRate: 40 + Math.random() * 20,
          avgDuration: 120 + Math.random() * 180,
        },
      })
    }
  }
  console.log('Sample analytics created')

  // Sample AI recommendations
  const recommendations = [
    {
      siteId: site.id,
      type: 'MOBILE',
      title: 'スマートフォンのCTAボタンサイズ改善',
      description: 'スマートフォンでCTAボタンの幅が128pxと小さく、タップしにくい可能性があります。',
      reasoning: 'モバイルデバイスでのCTR（0.8%）がデスクトップ（2.4%）と比較して低い状態です。CTAのタップしやすさが影響している可能性があります。',
      dataUsed: JSON.stringify({ mobileCtaWidth: '128px', viewport: '390px', mobileCtr: '0.8%', desktopCtr: '2.4%' }),
      uncertainty: '実際のユーザー操作データが不足しています。CTRが低い原因は複数考えられます。',
      status: 'PENDING',
      priority: 1,
    },
    {
      siteId: site.id,
      type: 'MOBILE',
      title: '比較表のモバイル表示最適化',
      description: '比較表の横幅がスマートフォン画面を超えています。横スクロールまたはカード形式への変換を推奨します。',
      reasoning: 'スマートフォン（390px）で比較表（600px超）を表示すると横スクロールが発生し、UXが低下します。',
      dataUsed: JSON.stringify({ tableWidth: '600px+', mobileViewport: '390px' }),
      uncertainty: '比較表の視認性がCTRに直接影響するかは確認が必要です。',
      status: 'PENDING',
      priority: 2,
    },
    {
      siteId: site.id,
      type: 'SEO',
      title: 'メタディスクリプションの最適化',
      description: 'メタディスクリプションに主要キーワードを含め、クリック率を向上させることを推奨します。',
      reasoning: '現在のメタディスクリプションはキーワードの含有率が低い可能性があります。',
      dataUsed: JSON.stringify({ currentDescription: '2024年最新のクレジットカード比較。' }),
      uncertainty: 'メタディスクリプションの変更がCTRに与える影響はGSCデータで確認が必要です。',
      status: 'PENDING',
      priority: 3,
    },
  ]

  for (const rec of recommendations) {
    await prisma.aiRecommendation.create({ data: rec })
  }
  console.log('AI recommendations created')

  console.log('\n✅ Seed completed successfully!')
  console.log('Admin login: admin@example.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
