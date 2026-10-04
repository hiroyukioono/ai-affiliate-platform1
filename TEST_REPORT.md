# TEST REPORT

- Date: 2026-10-03T12:23:18.980Z
- Base: http://localhost:3000
- AI: CONNECTED / model qwen2.5:0.5b @ http://localhost:12000/v1
- 注: サンドボックス(2 vCPU/2GB RAM)では llama3.1:8b(4.7GB) が動作しないため、同一の Ollama OpenAI互換APIで qwen2.5:0.5b を使用して実接続テストを実施。Windows 11 では .env 既定の llama3.1:8b をそのまま使用。

## E2E (tests/e2e.test.js) — 実サーバー・実DB・実Ollama

| Step | Result | Detail | ms |
|---|---|---|---|
| Application Start | **PASS** | tables=34 | 217 |
| Database | **PASS** | sqlite 34 tables | 24 |
| Authentication (login/fail/logout/me) | **PASS** | user=admin@example.com | 178 |
| Ollama Connection | **PASS** | qwen2.5:0.5b test="OK" 155ms | 173 |
| AI Generation (theme analysis) | **PASS** | site_name="XServer VPS" cats=123 kws=0 57878ms | 57905 |
| AI Generation (site structure) | **PASS** | pages=1 80526ms | 80540 |
| Site Generation (create from AI result) | **PASS** | site#1 slug=xserver-vps pages=1 cats=1 (AI structure: yes) | 19 |
| Design Management (CRUD/dup/versions/rollback/preview) | **PASS** | seeded=10 create/update/version/rollback/dup/select/delete ok | 91 |
| Mobile Prompt (CRUD/toggle/dup/versions/rollback) | **PASS** | seeded=10 all 10 names present; CRUD/toggle/versions/rollback/dup ok | 102 |
| Responsive Design (CRUD/dup/select) | **PASS** | seeded=3 desktop/tablet/mobile configs saved/edited | 92 |
| Site Builder (add/edit/delete/move components) | **PASS** | types=17 add/edit/move/delete ok | 96 |
| Drag & Drop (reorder per device) | **PASS** | desktop order reversed & restored; mobile order independent | 72 |
| Image Management (upload/list/place/lazy/delete) | **PASS** | uploaded muscwm67-90a6fc4818f0.png 2x2, placed, lazy, responsive | 95 |
| Affiliate Ad (program/link/ad register, original code immutable, placement) | **PASS** | ad#1 integrity_ok, link#1, placed as component#5, code verbatim in render | 70 |
| CTA (add/edit/delete, desktop/tablet/mobile settings) | **PASS** | cta#6 desktop 320px / tablet 70% / mobile 100% | 62 |
| Comparison Table (add/edit/delete, scroll & card mode) | **PASS** | table#8 desktop table / mobile scroll→card | 72 |
| Desktop Preview | **PASS** | 11138 bytes, responsive CSS present | 10 |
| Tablet Preview | **PASS** | 11138 bytes, responsive CSS present | 10 |
| Mobile Preview | **PASS** | 11138 bytes, responsive CSS present | 10 |
| 320px | **PASS** | preset ok, no ERROR-level issue at 320px | 23 |
| 375px | **PASS** | preset ok, no ERROR-level issue at 375px | 18 |
| 390px | **PASS** | preset ok, no ERROR-level issue at 390px | 19 |
| 414px | **PASS** | preset ok, no ERROR-level issue at 414px | 14 |
| 430px | **PASS** | preset ok, no ERROR-level issue at 430px | 17 |
| Mobile Quality Check (PASS/WARNING/ERROR detection) | **PASS** | baseline=WARNING; injected 600px/20px button → ERROR (horizontal_scroll@320, tap_target) detected | 41 |
| AI Mobile Optimization (analyze→pending→preview→approve→apply, no auto publish) | **PASS** | rec#1 changes=6 pending; apply-before-approve rejected(409); 120290ms | 120333 |
| Publish (explicit, separate from autosave) | **PASS** | /s/xserver-vps/ live, tracking script + ad code present | 15 |
| Analytics (PV/visits/device/page/session saved) | **PASS** | pv=4 visits=4 mobile=2 desktop=1 tablet=1 ctaView=1 ctaClick=1 CWV=未計測 | 62 |
| Affiliate Click (ad click beacon + link redirect) | **PASS** | clicks=2 ctr=50% redirect→original URL intact | 28 |
| Conversion (CV/CVR saved, linked to click, device) | **PASS** | cv=1 cvr=50% (rejected excluded) mobile cv=1 | 44 |
| Revenue (auto from approved CV + manual, by device/ad) | **PASS** | total=¥4500 mobile=¥3000 desktop=¥1500 | 33 |
| AI Analysis (access/click: data_used, reasoning, causes, suggestions, uncertainty) | **PASS** | analysis#3 suggestions=6 recs=6 65986ms; sensitive filter ok | 66011 |
| AI Recommendation (generate, categories) | **PASS** | generated=4 pending total=11 categories=DESIGN,CTA,CONTENT,SEO,MOBILE | 111205 |
| Approval Workflow (Approve→Apply draft only / Reject / Hold) | **PASS** | rec#1 hold→approve→apply(5 changes, draft only, history#1); reject verified | 77 |
| A/B Test (create A/B, running, variant metrics, data-insufficient verdict) | **PASS** | exp#1 A pv=3 B pv=2 click=1 ctr=50% → "判断にはデータ不足（各バリアント 50 PV以上必要）" AI verdict="判断にはデータ不足" | 30061 |
| Improvement History (before→change→after + post analysis, no causal claim) | **PASS** | history#1 before/change/after saved post-analysis#6 uncertainty present | 47650 |
| Undo / Redo (server-side history, survives reload) | **PASS** | add→undo(6)→redo(7)→undo→edit clears redo; history entries=23 | 61 |
| Autosave (creates autosave version, does NOT publish) | **PASS** | autosave v4; public unchanged, draft preview updated | 46 |
| Version Control (manual save, list, publish version, public uses publish snapshot) | **PASS** | versions=6 (manual/autosave/publish/ai_apply) public updated only after Publish | 40 |
| Rollback (restore old version, undo-able, new version recorded) | **PASS** | rolled back to v1 (1 comps) then undo → 6 comps | 43 |
| SEO (title/meta/canonical/robots/sitemap/OGP/JSON-LD/headings/internal links/report) | **PASS** | tags ok, sitemap/robots/feed ok, score=72 AI titles=5 | 12177 |
| Security (XSS sanitize, SQLi, CSRF, rate limit, headers, secrets, ad code untouched) | **PASS** | XSS escaped/sanitized, SQLi safe, CSRF enforced, rate limit 429, CSP/nosniff/XFO, HttpOnly+SameSite, no secret leak, ad integrity, audit logs | 203 |
| Authorization / RBAC (viewer read-only, editor no admin ops) | **PASS** | viewer: read ok / write 403; editor: edit ok / admin ops 403 | 183 |
| Logout (session destroyed) | **PASS** | session invalidated | 11 |

**TOTAL 44 / PASS 44 / FAILED 0**

## Unit (tests/unit.test.js)

12 tests / 12 pass / 0 fail — password hashing, sanitize, slugify, AI data filter, rate limit, JSON repair, seed(10 prompts/10 designs/3 sets), builder undo/redo/versions/nested tx, mobile quality check, renderPage SEO/escaping/ad verbatim, Ollama healthCheck error classification, Ollama chat via mock OpenAI-compatible server

## Browser UI (headless Chromium, public/admin/assets/uitest.js)

24 admin routes rendered without JS errors (/, /sites, /designs, /responsive, /mobile-prompts, /mobile, /media, /articles, /categories, /products, /affiliate-programs, /affiliate-links, /ads, /analytics, /conversions, /revenue, /seo, /ai, /recommendations, /experiments, /improvements, /calendar, /settings, /builder) — PASS

Builder interaction: palette click add → canvas +1 / Mobile tab → 390px canvas / select → properties panel / Undo → restored — PASS

## テスト中に検出・修正したバグ

1. 日本語サイト名由来の slug が URL ルーティングに失敗 → slugify を ASCII 限定 + 安定ハッシュ化
2. revenues に variant_id が無く A/B 集計で SQL エラー → カラム追加、CV→Revenue で引き継ぎ
3. Rollback のネストトランザクションで "cannot start a transaction within a transaction" → SAVEPOINT 対応
4. Hono の /s/:slug/:page? が末尾スラッシュに一致せず公開ページ 404 → 明示ルートへ分割
5. 小型モデルが page_type / seo_keywords に想定外の型を返し作成失敗・UI TypeError → AI出力の型正規化
6. max_tokens 到達で JSON が途中で切れる → 切断JSON修復 + AI_MAX_TOKENS 設定 + 不確実性へ注記
7. Experiments 一覧 API に metrics が無く UI が TypeError → 一覧も詳細形式で返却
8. ネストしたトレーリングカンマ JSON が抽出不可 → 抽出ロジック修正
9. E2E レポート JSON が process.exit 前に書かれない → await に修正