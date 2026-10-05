# AI Affiliate Platform

AI搭載アフィリエイトWebサイト **生成・運用・分析・改善** プラットフォーム
（Windows 11 ローカル動作 / ローカルAI: **Ollama + llama3.1:8b** / クラウドAI API料金ゼロ）

## 概要

| 項目 | 内容 |
|---|---|
| 目的 | 広告タイトル（例: `XServer VPS`）からAIでサイトを生成し、デザイン/Mobile Prompt/Responsive設定を選び、Site Builderで編集し、公開し、PV/クリック/CV/収益を計測し、AIが改善案を作り、人間が承認し、A/Bテストと改善前後比較を行う統合プラットフォーム |
| バックエンド | Node.js 22+ / Hono (`@hono/node-server`) / SQLite (`node:sqlite` 組込み) |
| フロントエンド | 管理画面SPA（Vanilla JS + Tailwind CDN + Chart.js）。Site Builder は 左: Components / 中央: Canvas / 右: Properties の3ペイン |
| AI | `AIProvider` 抽象化 → `OllamaProvider`（OpenAI互換 `/v1/chat/completions`）。`OLLAMA_BASE_URL=http://localhost:12000/v1`, `OLLAMA_MODEL=llama3.1:8b` |
| 依存 | `hono`, `@hono/node-server` のみ（ネイティブモジュール不要、`npm install` が即終了） |

---

## 起動手順（Windows 11）

### 1. 前提
- **Node.js 22.13 以上**（`node:sqlite` 組込みのため。`node -v` で確認）
- **Ollama**（https://ollama.com/download）

### 2. Ollama を 12000 番ポートで起動 & モデル取得
```powershell
# PowerShell
$env:OLLAMA_HOST = "0.0.0.0:12000"
ollama serve
```
別ターミナルで:
```powershell
$env:OLLAMA_HOST = "127.0.0.1:12000"
ollama pull llama3.1:8b
```
（既定の 11434 で動かす場合は `.env` の `OLLAMA_BASE_URL` を `http://localhost:11434/v1` に変更）

### 3. アプリ起動
```powershell
cd ai-affiliate-platform
copy .env.example .env     # 必要に応じて編集
npm install
npm run db:seed            # DB作成 + 初期データ投入（初回。サーバー起動時にも自動実行される）
npm run dev                # http://localhost:3000/admin/
```
または `start-windows.bat` をダブルクリック。

### 4. ログイン
- URL: http://localhost:3000/admin/
- 初期管理者は **`.env` の `ADMIN_EMAIL` / `ADMIN_PASSWORD`** で、**ユーザーテーブルが空のときに一度だけ** 作成されます（ブラウザには一切表示されません）。
- `ADMIN_PASSWORD` を空にして起動すると、強力なランダムパスワードが生成され **サーバーコンソールに一度だけ** 表示されます。
- 初回ログイン後は自動的に **Settings > 管理者アカウント** へ誘導され、パスワード変更を推奨します（変更するまでサイドバーに警告表示）。
- editor / viewer のデモアカウントは既定で作成されません。必要なら `SEED_DEMO_USERS=true`（ランダムパスワードをコンソールに一度だけ表示）。

### 管理者アカウントの変更（Settings > 管理者アカウント）
- **メールアドレス変更**: 新しいメールアドレス + 現在のパスワード → 形式/重複/長さチェック → 更新。全セッション無効化 + 現在セッション再発行。
- **パスワード変更**: 現在のパスワード + 新パスワード + 確認 → ポリシー（12文字以上・英大小/数字/記号・メール文字列不可・推測語不可）→ scryptハッシュで保存。全セッション無効化 + 再発行。
- いずれも CSRF トークン必須、8回/10分 のレート制限、監査ログ（値は記録しない）。パスワードや .env の内容は画面・API・ログに出ません。
- 変更後は `.env` の `ADMIN_PASSWORD` に依存しません（シードはユーザーが存在する限り再実行されないため）。

### Render 等の本番環境
`.env` はコミットせず、Render の **Environment Variables** に `SESSION_SECRET` / `ADMIN_EMAIL` / `ADMIN_PASSWORD`（初回のみ必要）/ `OLLAMA_BASE_URL` / `OLLAMA_MODEL` / `NODE_ENV=production` を設定してください。初回ログイン後にパスワードを変更すれば `ADMIN_PASSWORD` は削除して構いません。

### 5. Ollama接続テスト
管理画面 **AI** メニュー →「接続テスト再実行」。`CONNECTED` / `ERROR` と、エラー時は原因（未起動・モデル無し・URL誤り・タイムアウト・接続拒否）と `ollama pull llama3.1:8b` の案内を表示。サーバー起動ログにも表示されます。

---

## 主なURI

| 種別 | パス | 説明 |
|---|---|---|
| 管理画面 | `/admin/#/` | Dashboard / Sites / Site Builder / Designs / Responsive Designs / Mobile Prompts / Mobile Dashboard / Media / Articles / Categories / Products / Affiliate Programs / Affiliate Links / Affiliate Ads / Analytics / Conversions / Revenue / SEO / AI / AI Recommendations / Experiments / Improvement History / Content Calendar / Settings |
| 公開サイト | `/s/:slug/`, `/s/:slug/:page` | 公開バージョン（Publishスナップショット）のみ配信 |
| SEO | `/s/:slug/sitemap.xml`, `robots.txt`, `feed.xml`, `/s/:slug/category/:cat`, `/s/:slug/search?q=` | |
| 計測 | `POST /t/e`（pageview/cta_view/cta_click/web_vital）, `POST /t/ad`（広告クリック）, `GET /go/:slug/l/:linkId`（リンク計測→元URLへ302） | |
| API | `/api/auth/*`, `/api/sites/*`, `/api/builder/*`, `/api/designs/*`, `/api/mobile-prompts/*`, `/api/responsive/*`, `/api/media/*`, `/api/affiliate/*`, `/api/articles/*`, `/api/analytics/*`, `/api/ai/*`, `/api/preview/*` | すべてセッション + CSRF（`X-CSRF-Token`）必須 |
| ヘルス | `/api/health` | |

### 主要APIフロー
```
POST /api/sites/analyze-theme {adTitle}          → AIテーマ分析（保存せず提示）
POST /api/sites/generate-structure {theme}       → AIページ構造（保存せず提示）
POST /api/sites {name, theme, pages, design_theme_id, mobile_prompt_id, responsive_set_id}  → 管理者確認後に作成（下書き）
GET  /api/builder/pages/:id                      → コンポーネント + Undo/Redo状態
POST /api/builder/pages/:id/components | reorder | undo | redo | autosave | save | publish
GET  /api/builder/pages/:id/versions, POST .../versions/:vid/rollback
GET  /api/preview/pages/:id?recommendationId=&variantId=&versionId=  → 下書き/改善案/バリアント/旧版プレビュー（noindex）
GET  /api/ai/mobile/quality-check/:pageId        → 320/375/390/414/430px チェック (PASS/WARNING/ERROR)
POST /api/ai/mobile/optimize {pageId, promptId}  → AI改善案（pending）
POST /api/ai/analyze {siteId, type}              → access|click|conversion|revenue|seo|cta|ad_placement|mobile_issues|site
POST /api/ai/recommendations/generate, POST .../:id/review {decision: approve|reject|hold}, POST .../:id/apply（approved のみ、下書きへ適用、公開しない）
POST /api/ai/experiments, PUT .../:id {status: running}, POST .../:id/analyze（データ不足なら「判断にはデータ不足」）
GET  /api/ai/improvements, POST .../:id/analyze  → 改善前後比較（因果を断定しない）
```

---

## AI機能（25）— すべて Ollama 経由
広告タイトル分析 / サイトテーマ分析 / サイト構造生成 / カテゴリ生成 / 記事構成生成 / SEOタイトル生成 / Meta Description生成 / 見出し構成生成 / コンテンツ生成 / デザイン提案 / デザイン生成 / レスポンシブデザイン分析 / スマートフォン最適化 / モバイル問題分析 / アクセス分析 / クリック分析 / 成果分析 / 収益分析 / SEO分析 / CTA分析 / 広告配置分析 / A/Bテスト分析 / 改善案生成 / 改善後分析 / サイト改善提案

- 分析結果は **使用データ / 分析理由 / 原因候補 / 改善案 / 不確実性** の形式。原因を断定しない指示をシステムプロンプトに含む。
- AIへ送るデータは `filterForAI()` で パスワード / APIキー / Secret / Cookie / 認証情報 / メール / IP 等を除外。広告の Original Code も送信しない。
- **自動公開なし**: AI分析 → AI改善案(pending) → Preview → 管理者確認 → Approve → Apply(下書き) → Save → Publish。
- 改善案の `proposed_changes` が広告コード（`props.code`/`props.adId`）を対象にしても適用時にスキップ。

## データモデル（SQLite / PostgreSQL移行可能な構造）
`users, sessions, sites, site_pages, site_sections, site_components, categories, articles, products, design_themes, design_versions, mobile_design_prompts, mobile_prompt_versions, mobile_design_settings, responsive_design_sets, media_assets, affiliate_programs, affiliate_links, affiliate_ads, analytics_events, affiliate_clicks, conversions, revenues, ai_analysis, ai_recommendations, experiments, experiment_variants, improvement_history, builder_versions, builder_history, audit_logs, rate_limits, settings`
（スキーマ: `src/db/schema.sql`、初期データ: `src/db/seedData.js` — Mobile Prompt 10件 / デザインテーマ 10件 / Responsive Set 3件 / ASP 3件 をDBへ実登録）

- 各コンポーネントは `desktop_config / tablet_config / mobile_config`（width, maxWidth, fontSize, lineHeight, margin, padding, visibility など）と `sort_order / sort_order_tablet / sort_order_mobile`（デバイス別順序）を持つ。
- 広告は `original_code` + `original_code_hash`(SHA-256) で保存。表示時は原文をそのまま出力し、位置/余白/幅はコンテナ側のみ調整。
- 公開サイトは `builder_versions(kind='publish')` のスナップショットから描画。Autosave/手動Saveでは公開内容は変わらない。
- Core Web Vitals (LCP/CLS/INP) は公開サイトのブラウザ実測（PerformanceObserver）のみ集計。実測が無い場合は「未計測」と表示し推測値は出さない。

## セキュリティ
scrypt パスワードハッシュ / パスワードポリシー(12+, 英大小数字記号) / 初回ログイン時パスワード変更推奨(must_change_password) / 認証情報変更時のセッション再発行+他セッション失効 / HttpOnly+SameSite=Lax セッションCookie（本番は Secure） / セッション紐付けCSRFトークン / 全SQLプリペアド / 出力エスケープ + HTMLサニタイズ（script/iframe/on*/javascript: 除去）+ CSP / ログイン 10回/5分・API 600/分 のレート制限 / RBAC(admin/editor/viewer) / 監査ログ / 入力値検証 / AI APIキー不要（`.env` の `OLLAMA_API_KEY=ollama` はプレースホルダ） / AI設定・秘密情報をDB・フロント・公開サイトへ保存しない

## テスト
```powershell
npm test                                   # ユニットテスト 14件（node --test）
ADMIN_PASSWORD=... npm run test:e2e        # 実サーバーに対する E2E 45ステップ（Ollama接続・AI生成・アカウント変更含む）→ TEST_REPORT.json
# E2E は認証情報をコードに埋め込まず、環境変数 ADMIN_EMAIL / ADMIN_PASSWORD から読みます
```
E2E は `--skip-ai` でAI依存ステップを明示的にFAILED/SKIP扱いにできます（PASSと偽りません）。

### テスト結果（サンドボックス実測・最終）
`TEST_REPORT.md` を参照。**ユニット 14/14 PASS、E2E 45/45 PASS、管理画面24ルート+Builder操作+アカウント変更フロー ブラウザ実機 PASS。**
> サンドボックス（2 vCPU / 2GB RAM）では `llama3.1:8b`（4.7GB）が動作しないため、同一の Ollama OpenAI互換API経由で `qwen2.5:0.5b` を使って実接続テストを実施しました。Windows 11 では `.env` 既定の `llama3.1:8b` をそのまま使用してください。

## 本番移行
- `DB_DRIVER=postgres` + `DATABASE_URL` を設定し `src/db/postgres.js` に `SqliteAdapter` と同じインターフェース（`all/get/run/exec/transaction`）を実装（`pg` 使用）。現状は明示エラーで案内。
- `NODE_ENV=production`, `SESSION_SECRET` を十分長いランダム文字列に変更、HTTPS終端のリバースプロキシ配下で `Secure` Cookie が有効化。
- AIは初期状態 `AI_MODE=LOCAL_ONLY`。別プロバイダーは `src/ai/provider.js` の `createProvider()` にクラス追加。

## 未実装 / 今後の推奨
- PostgreSQL アダプターの実装（インターフェースは定義済み）
- Content Calendar の自動公開ジョブ（現在は予定日時の登録・一覧のみ、公開は手動）
- Site Builder の複数ユーザー同時編集（現在は最後の保存が優先）
- A/Bテストの統計的有意性検定（現在はサンプル数閾値 + AI定性分析）

## ディレクトリ
```
src/server.js            起動 / src/app.js ルーティング / src/config.js .env
src/db/{schema.sql,index.js,seed.js,seedData.js,init.js,reset.js}
src/ai/{provider.js,service.js}      AI抽象化 / 25機能 / JSON修復
src/lib/{auth.js,security.js,builder.js,metrics.js,http.js}
src/render/{site.js,mobileCheck.js}  公開サイトHTML・SEO・計測 / Mobile Quality Check
src/routes/*.js          auth, sites, builder, designs, mobilePrompts, responsive, media, affiliate, articles, analytics, ai, preview, public
public/admin/            管理SPA (index.html, assets/{core,app,pages,pages2,builder,uitest}.js, admin.css)
tests/{unit.test.js,e2e.test.js}
start-windows.bat / ecosystem.config.cjs(PM2)
```

Last updated: 2026-10-05
