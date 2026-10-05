# TEST REPORT

- Date: 2026-10-05T08:47:41.310Z
- Base: http://localhost:3000
- AI: CONNECTED / model qwen2.5:0.5b @ http://localhost:12000/v1
- 注: サンドボックス(2 vCPU/2GB RAM)では llama3.1:8b が動作しないため、同一の Ollama OpenAI互換APIで qwen2.5:0.5b を使用。Windows 11 では .env 既定の llama3.1:8b を使用。

## E2E (tests/e2e.test.js) — 実サーバー・実DB・実Ollama

| Step | Result | Detail | ms |
|---|---|---|---|
| Application Start | **PASS** | tables=34 | 182 |
| Database | **PASS** | sqlite 34 tables | 11 |
| Authentication (login/fail/logout/me) | **PASS** | user=admin@example.com | 213 |
| Ollama Connection | **PASS** | qwen2.5:0.5b test="OK" 160ms | 174 |
| AI Generation (theme analysis) | **PASS** | site_name="XServer VPS" cats=1 kws=6 57283ms | 57307 |
| AI Generation (site structure) | **PASS** | pages=1 80156ms | 80167 |
| Site Generation (create from AI result) | **PASS** | site#1 slug=xserver-vps pages=1 cats=1 (AI structure: yes) | 25 |
| Design Management (CRUD/dup/versions/rollback/preview) | **PASS** | seeded=10 create/update/version/rollback/dup/select/delete ok | 73 |
| Mobile Prompt (CRUD/toggle/dup/versions/rollback) | **PASS** | seeded=10 all 10 names present; CRUD/toggle/versions/rollback/dup ok | 66 |
| Responsive Design (CRUD/dup/select) | **PASS** | seeded=3 desktop/tablet/mobile configs saved/edited | 66 |
| Site Builder (add/edit/delete/move components) | **PASS** | types=17 add/edit/move/delete ok | 74 |
| Drag & Drop (reorder per device) | **PASS** | desktop order reversed & restored; mobile order independent | 50 |
| Image Management (upload/list/place/lazy/delete) | **PASS** | uploaded muv031po-f57c3bd77ad8.png 2x2, placed, lazy, responsive | 72 |
| Affiliate Ad (program/link/ad register, original code immutable, placement) | **PASS** | ad#1 integrity_ok, link#1, placed as component#8, code verbatim in render | 47 |
| CTA (add/edit/delete, desktop/tablet/mobile settings) | **PASS** | cta#9 desktop 320px / tablet 70% / mobile 100% | 43 |
| Comparison Table (add/edit/delete, scroll & card mode) | **PASS** | table#11 desktop table / mobile scroll→card | 47 |
| Desktop Preview | **PASS** | 11426 bytes, responsive CSS present | 6 |
| Tablet Preview | **PASS** | 11426 bytes, responsive CSS present | 6 |
| Mobile Preview | **PASS** | 11426 bytes, responsive CSS present | 8 |
| 320px | **PASS** | preset ok, no ERROR-level issue at 320px | 15 |
| 375px | **PASS** | preset ok, no ERROR-level issue at 375px | 12 |
| 390px | **PASS** | preset ok, no ERROR-level issue at 390px | 9 |
| 414px | **PASS** | preset ok, no ERROR-level issue at 414px | 11 |
| 430px | **PASS** | preset ok, no ERROR-level issue at 430px | 11 |
| Mobile Quality Check (PASS/WARNING/ERROR detection) | **PASS** | baseline=WARNING; injected 600px/20px button → ERROR (horizontal_scroll@320, tap_target) detected | 27 |
| AI Mobile Optimization (analyze→pending→preview→approve→apply, no auto publish) | **PASS** | rec#1 changes=9 pending; apply-before-approve rejected(409); 115252ms | 115288 |
| Publish (explicit, separate from autosave) | **PASS** | /s/xserver-vps/ live, tracking script + ad code present | 13 |
| Analytics (PV/visits/device/page/session saved) | **PASS** | pv=4 visits=4 mobile=2 desktop=1 tablet=1 ctaView=1 ctaClick=1 CWV=未計測 | 63 |
| Affiliate Click (ad click beacon + link redirect) | **PASS** | clicks=2 ctr=50% redirect→original URL intact | 28 |
| Conversion (CV/CVR saved, linked to click, device) | **PASS** | cv=1 cvr=50% (rejected excluded) mobile cv=1 | 42 |
| Revenue (auto from approved CV + manual, by device/ad) | **PASS** | total=¥4500 mobile=¥3000 desktop=¥1500 | 30 |
| AI Analysis (access/click: data_used, reasoning, causes, suggestions, uncertainty) | **PASS** | analysis#3 suggestions=3 recs=3 49149ms; sensitive filter ok | 49169 |
| AI Recommendation (generate, categories) | **PASS** | generated=3 pending total=7 categories=CONVERSION,CTA,MOBILE | 105988 |
| Approval Workflow (Approve→Apply draft only / Reject / Hold) | **PASS** | rec#1 hold→approve→apply(8 changes, draft only, history#1); reject verified | 74 |
| A/B Test (create A/B, running, variant metrics, data-insufficient verdict) | **PASS** | exp#1 A pv=3 B pv=2 click=1 ctr=50% → "判断にはデータ不足（各バリアント 50 PV以上必要）" AI verdict="判断にはデータ不足" | 24269 |
| Improvement History (before→change→after + post analysis, no causal claim) | **PASS** | history#1 before/change/after saved post-analysis#6 uncertainty present | 82344 |
| Undo / Redo (server-side history, survives reload) | **PASS** | add→undo(9)→redo(10)→undo→edit clears redo; history entries=23 | 95 |
| Autosave (creates autosave version, does NOT publish) | **PASS** | autosave v4; public unchanged, draft preview updated | 48 |
| Version Control (manual save, list, publish version, public uses publish snapshot) | **PASS** | versions=6 (manual/autosave/publish/ai_apply) public updated only after Publish | 39 |
| Rollback (restore old version, undo-able, new version recorded) | **PASS** | rolled back to v1 (4 comps) then undo → 9 comps | 42 |
| SEO (title/meta/canonical/robots/sitemap/OGP/JSON-LD/headings/internal links/report) | **PASS** | tags ok, sitemap/robots/feed ok, score=72 AI titles=5 | 7814 |
| Security (XSS sanitize, SQLi, CSRF, rate limit, headers, secrets, ad code untouched) | **PASS** | XSS escaped/sanitized, SQLi safe, CSRF enforced, rate limit 429, CSP/nosniff/XFO, HttpOnly+SameSite, no secret leak, ad integrity, audit logs | 245 |
| Authorization / RBAC (viewer read-only, editor no admin ops) | **PASS** | viewer: read ok / write 403; editor: edit ok / admin ops 403; weak pw rejected | 467 |
| Account Security (no secrets in UI/API, email change, password change, policy, session rotation, rate limit) | **PASS** | no secrets in HTML/JS/API; pw change (401/400/403 guards, rotation, revoke, old pw fails); email change; rate limit 429; hash never exposed | 1087 |
| Logout (session destroyed) | **PASS** | session invalidated | 13 |

**TOTAL 45 / PASS 45 / FAILED 0**

## Unit (tests/unit.test.js)

14 tests / 14 pass / 0 fail — password hashing, sanitize, slugify, AI data filter, rate limit, JSON repair, seed(1 bootstrap admin w/ must_change_password, no demo users), builder undo/redo/versions, mobile quality check, renderPage, Ollama healthCheck, Ollama chat mock, **password policy**, **random bootstrap password generation (console-only)**

## Browser (headless Chromium)

- 24 admin routes + Builder D&D — PASS (前回同様)
- **ログイン画面: Admin1234 / admin@example / ADMIN_PASSWORD / 「初期アカウント」 いずれも HTML に不在、メール欄の prefill 無し — PASS**
- **初回ログイン → /settings へ自動遷移 + 警告トースト — PASS**
- **パスワード変更ダイアログ → 「管理者アカウント情報を更新しました。」 → サイドバー警告消去 — PASS**
- **localStorage: {aap_theme} のみ / sessionStorage: 空 / Cookie: aap_sid(HttpOnly) のみ、パスワード不在 — PASS**

## セキュリティ最終チェックリスト

| 項目 | 結果 |
|---|---|
| ログイン画面から初期アカウント情報が消えている | PASS |
| HTML/JS に初期パスワードが存在しない (grep + ブラウザ) | PASS |
| API レスポンス (/me, /account, /users, login) にパスワード/ハッシュ/秘密が無い | PASS |
| localStorage / sessionStorage にパスワードを保存していない | PASS |
| Cookie に平文パスワード無し (HttpOnly セッションIDのみ) | PASS |
| サーバーログ (pm2 out/error) にパスワード文字列が 0 件 | PASS |
| .env が git 管理外 (.gitignore: .env, .env.local, *.key, *.pem) | PASS |
| 管理者がメールアドレスを変更できる (現在PW必須/形式/重複/長さ) | PASS |
| 管理者がパスワードを変更できる (現在PW必須/確認一致/ポリシー) | PASS |
| scrypt ハッシュで保存、平文保存なし | PASS |
| 変更後に新パスワードでログイン可、旧パスワードは 401 | PASS |
| 変更後セッションID再発行 + 旧セッション失効 | PASS |
| 未ログインで /api/auth/account は 401 | PASS |
| CSRF トークン無しの変更要求は 403 | PASS |
| ログイン 10回/5分、アカウント変更 8回/10分 で 429 | PASS |
| 既存 SQLite DB への自動マイグレーション (カラム追加) 後も既存管理者でログイン可 | PASS |
| 既存機能 (サイト生成/Builder/Analytics/AI/A/B 等 43ステップ) 回帰なし | PASS |

## 今回の改修で検出・修正した点

1. 中断により src/routes/auth.js への編集が未適用だった → 全面書き直しで適用
2. パスワードポリシーの「メール文字列を含む」判定が E2E の復元パスワードに誤検知 → テスト側パスワードを変更（ポリシーは維持）
3. /me レスポンスの "must_change_password" キーがテストの秘密情報検知に誤マッチ → 検知ロジックを修正