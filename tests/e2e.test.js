// End-to-end test against a running server (default http://localhost:3000).
// Usage: node tests/e2e.test.js [--base http://localhost:3000] [--skip-ai]
// Produces TEST REPORT with PASS/FAILED per step. Never fakes PASS.
const BASE = (process.argv.includes('--base') ? process.argv[process.argv.indexOf('--base') + 1] : null) || process.env.BASE_URL || 'http://localhost:3000';
const SKIP_AI = process.argv.includes('--skip-ai');
const results = [];
let cookie = '', csrf = '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; if (!ADMIN_PASSWORD) { console.error('Set ADMIN_PASSWORD env (and ADMIN_EMAIL) to run E2E'); process.exit(2); }

async function req(method, path, body, { raw = false, headers = {}, noCsrf = false, cookieOverride } = {}) {
  const h = { ...headers };
  if (cookieOverride !== undefined ? cookieOverride : cookie) h.Cookie = cookieOverride !== undefined ? cookieOverride : cookie;
  if (csrf && !noCsrf) h['X-CSRF-Token'] = csrf;
  if (body !== undefined && !(body instanceof FormData)) { h['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
  const res = await fetch(BASE + path, { method, headers: h, body, redirect: 'manual' });
  const sc = res.headers.get('set-cookie'); if (sc && sc.includes('aap_sid=') && !sc.includes('aap_sid=;')) cookie = sc.split(';')[0];
  const text = await res.text();
  let data = text; try { data = JSON.parse(text); } catch {}
  return { status: res.status, data, text, headers: res.headers };
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }
async function step(name, fn) {
  const t = Date.now();
  try { const info = await fn(); results.push({ name, ok: true, ms: Date.now() - t, info }); console.log(`  PASS  ${name}${info ? '  — ' + info : ''} (${Date.now() - t}ms)`); }
  catch (e) { results.push({ name, ok: false, ms: Date.now() - t, error: e.message }); console.log(`  FAILED ${name}: ${e.message}`); }
}
const ctx = {};

console.log(`\n=== E2E TEST against ${BASE} ${SKIP_AI ? '(AI steps skipped)' : ''} ===\n`);

// STEP 1 Application start
await step('Application Start', async () => { const r = await req('GET', '/api/health'); assert(r.status === 200 && r.data.ok, 'health failed'); const a = await req('GET', '/admin/'); assert(a.status === 200 && a.text.includes('<div id="app"'), 'admin page not served'); return `tables=${r.data.db.tables}`; });
// STEP 2 Database (through API: seed data exists)
await step('Database', async () => { const r = await req('GET', '/api/health'); assert(r.data.db.tables >= 27, 'expected >=27 tables, got ' + r.data.db.tables); return `${r.data.db.driver} ${r.data.db.tables} tables`; });
// STEP 3 Auth
await step('Authentication (login/fail/logout/me)', async () => {
  const bad = await req('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: 'nope' }, { noCsrf: true }); assert(bad.status === 401, 'wrong password should 401, got ' + bad.status);
  const noauth = await req('GET', '/api/sites', undefined, { cookieOverride: '' }); assert(noauth.status === 401, 'unauthenticated should 401');
  const r = await req('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, { noCsrf: true }); assert(r.status === 200 && r.data.csrf, 'login failed: ' + r.text); csrf = r.data.csrf; assert(!('password_hash' in r.data.user) && !('password' in r.data.user), 'login response must not contain password data');
  const me = await req('GET', '/api/auth/me'); assert(me.data.authenticated && me.data.user.role === 'admin', 'me failed');
  const nocsrf = await req('POST', '/api/sites', { name: 'x' }, { noCsrf: true }); assert(nocsrf.status === 403, 'missing CSRF should 403');
  return `user=${me.data.user.email}`;
});
// STEP 5 Ollama connection
let aiOk = false;
await step('Ollama Connection', async () => { const r = await req('GET', '/api/ai/status'); assert(r.status === 200, 'status endpoint failed'); ctx.ai = r.data; aiOk = r.data.status === 'CONNECTED'; assert(aiOk, `status=${r.data.status}: ${(r.data.errors || []).join(' | ')} hint=${r.data.hint}`); return `${r.data.model} test="${r.data.checks.testResponse}" ${r.data.checks.durationMs}ms`; });
const AI = !SKIP_AI && aiOk;
if (!AI) console.log('  (AI-dependent steps will be marked FAILED/SKIPPED because Ollama is not CONNECTED)');

// STEP 7 Site generation (AI theme + structure + create)
await step('AI Generation (theme analysis)', async () => { assert(AI, 'Ollama not connected'); const r = await req('POST', '/api/sites/analyze-theme', { adTitle: 'XServer VPS' }); assert(r.status === 200 && r.data.theme, 'analyze-theme failed: ' + r.text.slice(0, 300)); ctx.theme = r.data.theme; return `site_name="${ctx.theme.site_name}" cats=${(ctx.theme.categories || []).length} kws=${(ctx.theme.seo_keywords || []).length} ${r.data.durationMs}ms`; });
await step('AI Generation (site structure)', async () => { assert(AI, 'Ollama not connected'); const r = await req('POST', '/api/sites/generate-structure', { adTitle: 'XServer VPS', theme: ctx.theme }); assert(r.status === 200 && Array.isArray(r.data.pages), 'generate-structure failed: ' + r.text.slice(0, 300)); ctx.pages = r.data.pages; return `pages=${r.data.pages.length} ${r.data.durationMs}ms`; });
await step('Site Generation (create from AI result)', async () => {
  const theme = ctx.theme || { site_name: 'XServer VPS 比較ガイド', theme: 'VPS比較', target_audience: '開発者', categories: [{ name: '料金比較', slug: 'price' }, { name: '使い方', slug: 'howto' }], seo_keywords: ['VPS', 'XServer'] };
  const r = await req('POST', '/api/sites', { name: theme.site_name || 'XServer VPS Guide', ad_title: 'XServer VPS', theme, pages: ctx.pages || null });
  assert(r.status === 201 && r.data.id, 'site create failed: ' + r.text); ctx.site = r.data;
  const d = await req('GET', `/api/sites/${ctx.site.id}`); assert(d.data.pages.length >= 1 && d.data.categories.length >= 1, 'site should have pages & categories'); ctx.pageId = d.data.pages.find(p => p.slug === 'home')?.id || d.data.pages[0].id; ctx.siteDetail = d.data;
  return `site#${ctx.site.id} slug=${ctx.site.slug} pages=${d.data.pages.length} cats=${d.data.categories.length} (AI structure: ${ctx.pages ? 'yes' : 'fallback'})`;
});
// Design management
await step('Design Management (CRUD/dup/versions/rollback/preview)', async () => {
  const list = await req('GET', '/api/designs'); assert(list.data.length >= 10, 'expected 10 seeded designs');
  const c = await req('POST', '/api/designs', { name: 'E2E Theme', tokens: { primary: '#ff0000', bg: '#ffffff', text: '#000000' }, regenerateCss: true }); assert(c.status === 201, 'create failed ' + c.text); const id = c.data.id; assert(c.data.css.includes('--c-primary:#ff0000'), 'css not generated from tokens');
  const u = await req('PUT', `/api/designs/${id}`, { tokens: { primary: '#00ff00' }, regenerateCss: true }); assert(u.data.current_version === 2 && u.data.css.includes('#00ff00'), 'update/version failed');
  const vs = await req('GET', `/api/designs/${id}/versions`); assert(vs.data.length === 2, 'expected 2 versions');
  const rb = await req('POST', `/api/designs/${id}/rollback/${vs.data[1].id}`); assert(rb.data.css.includes('#ff0000') && rb.data.current_version === 3, 'rollback failed');
  const dup = await req('POST', `/api/designs/${id}/duplicate`); assert(dup.status === 201 && dup.data.name.includes('Copy'), 'duplicate failed');
  const sel = await req('PUT', `/api/sites/${ctx.site.id}`, { design_theme_id: id }); assert(sel.data.design_theme_id === id, 'select design for site failed');
  const inUse = await req('DELETE', `/api/designs/${id}`); assert(inUse.status === 409, 'in-use design should not delete');
  await req('PUT', `/api/sites/${ctx.site.id}`, { design_theme_id: list.data[1].id });
  const d1 = await req('DELETE', `/api/designs/${id}`); const d2 = await req('DELETE', `/api/designs/${dup.data.id}`); assert(d1.status === 200 && d2.status === 200, 'delete failed');
  ctx.designId = list.data[1].id; return `seeded=${list.data.length} create/update/version/rollback/dup/select/delete ok`;
});
await step('Mobile Prompt (CRUD/toggle/dup/versions/rollback)', async () => {
  const list = await req('GET', '/api/mobile-prompts'); assert(list.data.length >= 10, 'expected 10 seeded prompts'); const names = list.data.map(p => p.name); for (const n of ['Mobile Standard', 'Mobile Premium', 'Mobile Media', 'Mobile Affiliate', 'Mobile Minimal', 'Mobile Magazine', 'Mobile Comparison', 'Mobile Product', 'Mobile Business', 'Mobile Conversion']) assert(names.includes(n), 'missing seeded prompt ' + n);
  const c = await req('POST', '/api/mobile-prompts', { name: 'E2E Prompt', prompt: 'Test prompt v1', rules: { minFontPx: 16 } }); assert(c.status === 201, 'create failed'); const id = c.data.id;
  const u = await req('PUT', `/api/mobile-prompts/${id}`, { prompt: 'Test prompt v2' }); assert(u.data.current_version === 2, 'version bump failed');
  const t = await req('POST', `/api/mobile-prompts/${id}/toggle`); assert(t.data.status === 'INACTIVE', 'toggle failed'); await req('POST', `/api/mobile-prompts/${id}/toggle`);
  const vs = await req('GET', `/api/mobile-prompts/${id}/versions`); assert(vs.data.length === 2, 'expected 2 versions');
  const rb = await req('POST', `/api/mobile-prompts/${id}/rollback/${vs.data[1].id}`); assert(rb.data.prompt === 'Test prompt v1' && rb.data.current_version === 3, 'rollback failed');
  const dup = await req('POST', `/api/mobile-prompts/${id}/duplicate`); assert(dup.status === 201 && dup.data.status === 'INACTIVE', 'dup failed');
  const affiliate = list.data.find(p => p.name === 'Mobile Affiliate'); await req('PUT', `/api/sites/${ctx.site.id}`, { mobile_prompt_id: affiliate.id }); ctx.mobilePromptId = affiliate.id;
  assert((await req('DELETE', `/api/mobile-prompts/${id}`)).status === 200 && (await req('DELETE', `/api/mobile-prompts/${dup.data.id}`)).status === 200, 'delete failed');
  return `seeded=${list.data.length} all 10 names present; CRUD/toggle/versions/rollback/dup ok`;
});
await step('Responsive Design (CRUD/dup/select)', async () => {
  const list = await req('GET', '/api/responsive'); assert(list.data.length >= 3, 'expected 3 seeded sets');
  const c = await req('POST', '/api/responsive', { name: 'E2E Set', desktop_config: { containerWidth: '1200px', ctaWidth: '300px' }, tablet_config: { containerWidth: '90%', ctaWidth: '80%' }, mobile_config: { containerWidth: '100%', ctaWidth: '100%' }, breakpoints: { tablet: 1000, mobile: 700 } }); assert(c.status === 201 && c.data.breakpoints.mobile === 700, 'create failed ' + c.text);
  const bad = await req('POST', '/api/responsive', { name: 'bad', breakpoints: { tablet: 500, mobile: 700 } }); assert(bad.status === 400, 'invalid breakpoints should 400');
  const u = await req('PUT', `/api/responsive/${c.data.id}`, { mobile_config: { containerWidth: '100%', padding: '0.5rem' } }); assert(u.data.mobile_config.padding === '0.5rem', 'update failed');
  const dup = await req('POST', `/api/responsive/${c.data.id}/duplicate`); assert(dup.status === 201, 'dup failed');
  await req('PUT', `/api/sites/${ctx.site.id}`, { responsive_set_id: c.data.id }); assert((await req('DELETE', `/api/responsive/${c.data.id}`)).status === 409, 'in-use should 409');
  await req('PUT', `/api/sites/${ctx.site.id}`, { responsive_set_id: list.data[0].id }); assert((await req('DELETE', `/api/responsive/${c.data.id}`)).status === 200, 'delete failed'); await req('DELETE', `/api/responsive/${dup.data.id}`);
  return `seeded=${list.data.length} desktop/tablet/mobile configs saved/edited`;
});
await step('Site Builder (add/edit/delete/move components)', async () => {
  const pg = await req('GET', `/api/builder/pages/${ctx.pageId}`); assert(pg.status === 200 && pg.data.componentTypes.length === 17, 'builder page load failed'); const before = pg.data.components.length;
  const h = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'heading', props: { text: 'E2E Heading', level: 2 } }); assert(h.status === 201, 'add heading failed ' + h.text); ctx.headingId = h.data.component.id;
  const e = await req('PUT', `/api/builder/pages/${ctx.pageId}/components/${ctx.headingId}`, { props: { text: 'E2E Heading Edited', level: 2 }, mobile_config: { fontSize: '1.25rem' } }); assert(e.data.component.props.text === 'E2E Heading Edited' && e.data.component.mobile_config.fontSize === '1.25rem', 'edit failed');
  const t = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'text', props: { html: '<p>E2E text</p><script>alert(1)</script>' } }); ctx.textId = t.data.component.id;
  const mv = await req('POST', `/api/builder/pages/${ctx.pageId}/components/${ctx.textId}/move`, { position: 0 }); assert(mv.data.ok, 'move failed');
  const pg2 = await req('GET', `/api/builder/pages/${ctx.pageId}`); assert(pg2.data.components[0].id === ctx.textId, 'moved component should be first');
  const bad = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'evil' }); assert(bad.status === 400, 'invalid type should 400');
  const del = await req('DELETE', `/api/builder/pages/${ctx.pageId}/components/${ctx.textId}`); assert(del.data.ok, 'delete failed');
  const pg3 = await req('GET', `/api/builder/pages/${ctx.pageId}`); assert(pg3.data.components.length === before + 1, 'component count mismatch');
  return `types=17 add/edit/move/delete ok`;
});
await step('Drag & Drop (reorder per device)', async () => {
  const pg = await req('GET', `/api/builder/pages/${ctx.pageId}`); const ids = pg.data.components.map(c => c.id); assert(ids.length >= 2, 'need 2+ components');
  const rev = [...ids].reverse(); const r = await req('POST', `/api/builder/pages/${ctx.pageId}/reorder`, { order: rev, device: 'desktop' }); assert(r.data.ok, 'reorder failed');
  const pg2 = await req('GET', `/api/builder/pages/${ctx.pageId}`); assert(JSON.stringify(pg2.data.components.map(c => c.id)) === JSON.stringify(rev), 'desktop order not applied');
  const m = await req('POST', `/api/builder/pages/${ctx.pageId}/reorder`, { order: ids, device: 'mobile' }); assert(m.data.ok, 'mobile reorder failed');
  const pg3 = await req('GET', `/api/builder/pages/${ctx.pageId}`); const mobileOrder = [...pg3.data.components].sort((a, b) => a.sort_order_mobile - b.sort_order_mobile).map(c => c.id); assert(JSON.stringify(mobileOrder) === JSON.stringify(ids), 'mobile order not applied independently');
  const bad = await req('POST', `/api/builder/pages/${ctx.pageId}/reorder`, { order: [999999] }); assert(bad.status === 400, 'unknown ids should 400');
  await req('POST', `/api/builder/pages/${ctx.pageId}/reorder`, { order: ids, device: 'desktop' });
  return `desktop order reversed & restored; mobile order independent`;
});
await step('Image Management (upload/list/place/lazy/delete)', async () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAD0lEQVR42mNk+M9Qz8AAAAQNAQDVuP1vAAAAAElFTkSuQmCC', 'base64');
  const fd = new FormData(); fd.append('file', new Blob([png], { type: 'image/png' }), 'e2e.png'); fd.append('siteId', String(ctx.site.id)); fd.append('alt', 'E2E image');
  const up = await req('POST', '/api/media/upload', fd); assert(up.status === 201 && up.data.url && up.data.width === 2, 'upload failed: ' + up.text); ctx.media = up.data;
  const file = await fetch(BASE + up.data.url); assert(file.status === 200 && file.headers.get('content-type')?.includes('image/png'), 'uploaded file not served');
  const badFd = new FormData(); badFd.append('file', new Blob([Buffer.from('hello')], { type: 'text/plain' }), 'x.txt'); const bad = await req('POST', '/api/media/upload', badFd); assert(bad.status === 400, 'non-image should be rejected');
  const img = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'image', props: { src: up.data.url, alt: 'E2E image', lazy: true }, mobile_config: { maxWidth: '100%' } }); assert(img.status === 201, 'place image failed'); ctx.imageId = img.data.component.id;
  const mv = await req('POST', `/api/builder/pages/${ctx.pageId}/components/${ctx.imageId}/move`, { position: 1 }); assert(mv.data.ok, 'image move failed');
  const prev = await req('GET', `/api/preview/pages/${ctx.pageId}?device=mobile`); assert(prev.text.includes(`src="${up.data.url}"`) && prev.text.includes('loading="lazy"') && prev.text.includes('img,video,iframe{max-width:100%'), 'preview should render lazy responsive image');
  const list = await req('GET', `/api/media?siteId=${ctx.site.id}`); assert(list.data.some(m => m.id === up.data.id), 'media list missing');
  return `uploaded ${up.data.filename} ${up.data.width}x${up.data.height}, placed, lazy, responsive`;
});
await step('Affiliate Ad (program/link/ad register, original code immutable, placement)', async () => {
  const progs = await req('GET', '/api/affiliate/programs'); assert(progs.data.length >= 3, 'seeded programs missing'); const a8 = progs.data.find(p => p.name === 'A8.net');
  const code = '<a href="https://px.a8.net/svt/ejp?a8mat=TEST123+ABC&tracking=xyz" rel="nofollow"><img border="0" width="300" height="250" alt="" src="https://www23.a8.net/svt/bgt?aid=TEST&wid=001&eno=01&mid=s00000000000001&mc=1"></a><img border="0" width="1" height="1" src="https://www15.a8.net/0.gif?a8mat=TEST123+ABC" alt="">';
  const ad = await req('POST', '/api/affiliate/ads', { site_id: ctx.site.id, program_id: a8.id, name: 'E2E A8 Banner 300x250', ad_type: 'banner', original_code: code, width: 300, height: 250 }); assert(ad.status === 201 && ad.data.original_code === code, 'ad create failed ' + ad.text); ctx.adId = ad.data.id;
  const upd = await req('PUT', `/api/affiliate/ads/${ctx.adId}`, { name: 'E2E A8 Banner (renamed)', original_code: '<b>hacked</b>' }); assert(upd.data.original_code === code && upd.data.name.includes('renamed'), 'metadata edit must NOT change original code');
  const g = await req('GET', `/api/affiliate/ads/${ctx.adId}`); assert(g.data.integrity_ok === true, 'integrity hash mismatch');
  const link = await req('POST', '/api/affiliate/links', { site_id: ctx.site.id, program_id: a8.id, name: 'XServer VPS 公式', url: 'https://example.com/aff?id=123&track=abc' }); assert(link.status === 201, 'link create failed'); ctx.linkId = link.data.id;
  const comp = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'affiliate_ad', props: { adId: ctx.adId, label: 'PR' }, desktop_config: { width: '300px' }, tablet_config: { width: '80%' }, mobile_config: { width: '100%' } }); assert(comp.status === 201, 'ad placement failed'); ctx.adCompId = comp.data.component.id;
  const prev = await req('GET', `/api/preview/pages/${ctx.pageId}`); assert(prev.text.includes('a8mat=TEST123+ABC&tracking=xyz'), 'preview must render original ad code verbatim (href/tracking intact)'); assert(prev.text.includes(`data-ad-id="${ctx.adId}"`), 'ad container missing');
  return `ad#${ctx.adId} integrity_ok, link#${ctx.linkId}, placed as component#${ctx.adCompId}, code verbatim in render`;
});
await step('CTA (add/edit/delete, desktop/tablet/mobile settings)', async () => {
  const c = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'cta', props: { title: 'E2E CTA', text: 'desc', buttonText: '公式サイトへ', linkId: ctx.linkId }, desktop_config: { width: '320px' }, tablet_config: { width: '80%' }, mobile_config: { width: '100%', minHeight: '52px' } }); assert(c.status === 201, 'cta add failed'); ctx.ctaId = c.data.component.id;
  const e = await req('PUT', `/api/builder/pages/${ctx.pageId}/components/${ctx.ctaId}`, { props: { ...c.data.component.props, buttonText: '今すぐ申し込む' }, tablet_config: { width: '70%' } }); assert(e.data.component.props.buttonText === '今すぐ申し込む' && e.data.component.tablet_config.width === '70%' && e.data.component.desktop_config.width === '320px' && e.data.component.mobile_config.width === '100%', 'per-device config not preserved');
  const prev = await req('GET', `/api/preview/pages/${ctx.pageId}`); assert(prev.text.includes(`/go/${ctx.site.slug}/l/${ctx.linkId}`) && prev.text.includes('今すぐ申し込む') && prev.text.includes(`#c${ctx.ctaId}{width:320px}`) && prev.text.includes(`#c${ctx.ctaId}{width:70%}`) && prev.text.includes(`#c${ctx.ctaId}{width:100%;min-height:52px}`), 'cta render / per-device css missing');
  const tmp = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'cta', props: { title: 'tmp' } }); assert((await req('DELETE', `/api/builder/pages/${ctx.pageId}/components/${tmp.data.component.id}`)).data.ok, 'cta delete failed');
  return `cta#${ctx.ctaId} desktop 320px / tablet 70% / mobile 100%`;
});
await step('Comparison Table (add/edit/delete, scroll & card mode)', async () => {
  const c = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'comparison_table', props: { title: 'VPS比較', columns: ['XServer VPS', 'ConoHa', 'さくら'], rows: [{ label: '料金', values: ['¥830', '¥900', '¥880'] }, { label: 'メモリ', values: ['2GB', '2GB', '1GB'] }], recommended: 0 }, mobile_config: { layout: 'scroll' } }); assert(c.status === 201, 'add failed'); ctx.tableId = c.data.component.id;
  let prev = await req('GET', `/api/preview/pages/${ctx.pageId}`); assert(prev.text.includes('class="table-scroll"') && prev.text.includes('XServer VPS') && !prev.text.includes('cmp-comparison_table table-card-mode'), 'scroll mode render failed');
  const e = await req('PUT', `/api/builder/pages/${ctx.pageId}/components/${ctx.tableId}`, { mobile_config: { layout: 'card' } }); assert(e.data.component.mobile_config.layout === 'card', 'edit failed');
  prev = await req('GET', `/api/preview/pages/${ctx.pageId}`); assert(prev.text.includes('cmp-comparison_table table-card-mode') && prev.text.includes('class="compare-cards"') && prev.text.includes('compare-card recommended'), 'card mode render failed');
  const tmp = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'comparison_table', props: {} }); assert((await req('DELETE', `/api/builder/pages/${ctx.pageId}/components/${tmp.data.component.id}`)).data.ok, 'delete failed');
  return `table#${ctx.tableId} desktop table / mobile scroll→card`;
});
// Previews
for (const [label, key] of [['Desktop Preview', 'desktop'], ['Tablet Preview', 'tablet'], ['Mobile Preview', 'mobile']]) {
  await step(label, async () => { const r = await req('GET', `/api/preview/pages/${ctx.pageId}?device=${key}`); assert(r.status === 200 && r.text.includes('<!DOCTYPE html>') && r.text.includes('viewport') && r.text.includes('noindex'), 'preview failed'); assert(r.text.includes('@media (max-width:1024px)') && r.text.includes('@media (max-width:767px)'), 'responsive breakpoints missing'); assert(r.headers.get('x-robots-tag') === 'noindex', 'preview must be noindex'); return `${r.text.length} bytes, responsive CSS present`; });
}
const devs = await req('GET', '/api/preview/devices');
for (const w of [320, 375, 390, 414, 430]) {
  await step(`${w}px`, async () => { assert(devs.data.presets.some(p => p.width === w), `preset ${w} missing`); const r = await req('GET', `/api/preview/pages/${ctx.pageId}?device=${w}`); assert(r.status === 200, 'preview failed'); const html = r.text; assert(html.includes('max-width:100%') && html.includes('overflow-x:hidden') && html.includes('width=device-width'), 'mobile-safe CSS missing'); assert(/\.cta-button\{[^}]*width:100%/.test(html) || html.includes('.cta-button{width:100%'), 'cta full width on mobile missing'); const qc = await req('GET', `/api/ai/mobile/quality-check/${ctx.pageId}`); const errs = qc.data.issues.filter(i => i.level === 'ERROR' && (i.viewport === w || !i.viewport)); assert(errs.length === 0, `quality errors at ${w}px: ${errs.map(e => e.message).join('; ')}`); return `preset ok, no ERROR-level issue at ${w}px`; });
}
await step('Mobile Quality Check (PASS/WARNING/ERROR detection)', async () => {
  const ok = await req('GET', `/api/ai/mobile/quality-check/${ctx.pageId}`); assert(['PASS', 'WARNING', 'ERROR'].includes(ok.data.status) && ok.data.viewports.length === 5, 'qc failed'); assert(Object.keys(ok.data.summary).length >= 14, 'expected 14 check categories'); const base = ok.data.status;
  const bad = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'button', props: { text: 'tiny' }, mobile_config: { width: '600px', height: '20px' } });
  const qc2 = await req('GET', `/api/ai/mobile/quality-check/${ctx.pageId}`); assert(qc2.data.status === 'ERROR' && qc2.data.issues.some(i => i.check === 'horizontal_scroll' && i.viewport === 320) && qc2.data.issues.some(i => i.check === 'tap_target'), 'should detect horizontal scroll + tap target errors');
  await req('DELETE', `/api/builder/pages/${ctx.pageId}/components/${bad.data.component.id}`);
  return `baseline=${base}; injected 600px/20px button → ERROR (horizontal_scroll@320, tap_target) detected`;
});
await step('AI Mobile Optimization (analyze→pending→preview→approve→apply, no auto publish)', async () => {
  assert(AI, 'Ollama not connected');
  const r = await req('POST', '/api/ai/mobile/optimize', { pageId: ctx.pageId, promptId: ctx.mobilePromptId }); assert(r.status === 200 && r.data.recommendationId && r.data.status === 'pending', 'optimize failed: ' + r.text.slice(0, 300)); ctx.mobileRecId = r.data.recommendationId;
  const rec = await req('GET', `/api/ai/recommendations?siteId=${ctx.site.id}&category=MOBILE`); assert(rec.data.some(x => x.id === ctx.mobileRecId && x.status === 'pending'), 'recommendation not pending');
  const pv = await req('GET', `/api/preview/pages/${ctx.pageId}?recommendationId=${ctx.mobileRecId}`); assert(pv.status === 200, 'preview with recommendation failed');
  const applyEarly = await req('POST', `/api/ai/recommendations/${ctx.mobileRecId}/apply`); assert(applyEarly.status === 409, 'apply before approve must be rejected');
  const site = await req('GET', `/api/sites/${ctx.site.id}`); assert(site.data.status === 'draft', 'site must remain draft (no auto publish)');
  return `rec#${ctx.mobileRecId} changes=${r.data.changes.length} pending; apply-before-approve rejected(409); ${r.data.durationMs}ms`;
});
// Publish site before tracking (tracking needs published page)
await step('Publish (explicit, separate from autosave)', async () => { const r = await req('POST', `/api/sites/${ctx.site.id}/publish`); assert(r.status === 200 && r.data.status === 'published', 'publish failed'); const pub = await fetch(`${BASE}/s/${ctx.site.slug}/`); const html = await pub.text(); assert(pub.status === 200 && html.includes('/t/e') && html.includes('a8mat=TEST123'), 'public page not rendering published version'); ctx.publicHtml = html; return `/s/${ctx.site.slug}/ live, tracking script + ad code present`; });
await step('Analytics (PV/visits/device/page/session saved)', async () => {
  for (const [dev, vw] of [['desktop', 1440], ['mobile', 390], ['mobile', 375], ['tablet', 820]]) { const r = await fetch(`${BASE}/t/e`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId: ctx.site.id, pageId: ctx.pageId, sessionId: 'e2e-' + dev + vw, type: 'pageview', device: dev, vw, path: '/' }) }); assert(r.status === 204, 'track failed'); }
  await fetch(`${BASE}/t/e`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId: ctx.site.id, pageId: ctx.pageId, sessionId: 'e2e-mobile390', type: 'cta_view', device: 'mobile', componentId: ctx.ctaId }) });
  await fetch(`${BASE}/t/e`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId: ctx.site.id, pageId: ctx.pageId, sessionId: 'e2e-mobile390', type: 'cta_click', device: 'mobile', componentId: ctx.ctaId }) });
  const bad = await fetch(`${BASE}/t/e`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId: ctx.site.id, type: 'evil' }) }); assert(bad.status === 400, 'invalid event type should 400');
  const m = await req('GET', `/api/analytics/sites/${ctx.site.id}`); assert(m.data.pv >= 4 && m.data.visits >= 4 && m.data.byDevice.mobile.pv >= 2 && m.data.byDevice.desktop.pv >= 1 && m.data.byDevice.tablet.pv >= 1 && m.data.ctaViews >= 1 && m.data.ctaClicks >= 1, 'metrics mismatch: ' + JSON.stringify({ pv: m.data.pv, visits: m.data.visits }));
  assert(m.data.byPage.some(p => p.page_id === ctx.pageId), 'page breakdown missing'); assert(m.data.vitals.LCP.status === '未計測', 'CWV must show 未計測 when no real data');
  const ev = await req('GET', `/api/analytics/sites/${ctx.site.id}/events?limit=10`); assert(ev.data.length >= 5 && ev.data[0].session_id, 'events not stored');
  return `pv=${m.data.pv} visits=${m.data.visits} mobile=${m.data.byDevice.mobile.pv} desktop=${m.data.byDevice.desktop.pv} tablet=${m.data.byDevice.tablet.pv} ctaView=${m.data.ctaViews} ctaClick=${m.data.ctaClicks} CWV=未計測`;
});
await step('Affiliate Click (ad click beacon + link redirect)', async () => {
  const r = await fetch(`${BASE}/t/ad`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId: ctx.site.id, pageId: ctx.pageId, adId: ctx.adId, componentId: ctx.adCompId, sessionId: 'e2e-mobile390', device: 'mobile' }) }); const j = await r.json(); assert(r.status === 200 && j.token, 'ad click failed'); ctx.clickToken = j.token;
  const go = await fetch(`${BASE}/go/${ctx.site.slug}/l/${ctx.linkId}?p=${ctx.pageId}&c=${ctx.ctaId}`, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile' } }); assert(go.status === 302 && go.headers.get('location') === 'https://example.com/aff?id=123&track=abc', 'redirect must go to ORIGINAL url unchanged');
  const clicks = await req('GET', `/api/analytics/sites/${ctx.site.id}/clicks`); assert(clicks.data.length >= 2 && clicks.data.some(c => c.ad_id === ctx.adId && c.device === 'mobile') && clicks.data.some(c => c.link_id === ctx.linkId && c.device === 'mobile'), 'clicks not stored with ad/site/page/device');
  const m = await req('GET', `/api/analytics/sites/${ctx.site.id}`); assert(m.data.affiliateClicks >= 2 && m.data.ctr > 0, 'ctr not computed');
  return `clicks=${m.data.affiliateClicks} ctr=${m.data.ctr}% redirect→original URL intact`;
});
await step('Conversion (CV/CVR saved, linked to click, device)', async () => {
  const r = await req('POST', '/api/analytics/conversions', { site_id: ctx.site.id, click_token: ctx.clickToken, device: 'mobile', status: 'approved', amount: 3000, note: 'E2E CV' }); assert(r.status === 201 && r.data.click_id && r.data.ad_id === ctx.adId, 'cv create failed ' + r.text); ctx.cvId = r.data.id;
  const p = await req('POST', '/api/analytics/conversions', { site_id: ctx.site.id, device: 'desktop', status: 'pending', amount: 1000 }); assert(p.status === 201, 'pending cv failed');
  const u = await req('PUT', `/api/analytics/conversions/${p.data.id}`, { status: 'rejected' }); assert(u.data.status === 'rejected', 'cv update failed');
  const m = await req('GET', `/api/analytics/sites/${ctx.site.id}`); assert(m.data.cv === 1 && m.data.byDevice.mobile.cv === 1 && m.data.cvr > 0, 'cv/cvr mismatch ' + JSON.stringify({ cv: m.data.cv, cvr: m.data.cvr }));
  const list = await req('GET', `/api/analytics/conversions?siteId=${ctx.site.id}`); assert(list.data.length === 2, 'cv list');
  return `cv=${m.data.cv} cvr=${m.data.cvr}% (rejected excluded) mobile cv=${m.data.byDevice.mobile.cv}`;
});
await step('Revenue (auto from approved CV + manual, by device/ad)', async () => {
  const rv = await req('GET', `/api/analytics/revenues?siteId=${ctx.site.id}`); assert(rv.data.rows.some(r => r.conversion_id === ctx.cvId && r.amount === 3000 && r.device === 'mobile'), 'auto revenue from approved cv missing');
  const man = await req('POST', '/api/analytics/revenues', { site_id: ctx.site.id, ad_id: ctx.adId, device: 'desktop', amount: 1500, note: 'manual' }); assert(man.status === 201, 'manual revenue failed');
  const m = await req('GET', `/api/analytics/sites/${ctx.site.id}`); assert(m.data.revenue === 4500 && m.data.byDevice.mobile.revenue === 3000 && m.data.byDevice.desktop.revenue === 1500 && m.data.byAd.some(a => a.ad_id === ctx.adId && a.revenue === 4500), 'revenue aggregation mismatch ' + JSON.stringify({ r: m.data.revenue }));
  const rv2 = await req('GET', `/api/analytics/revenues?siteId=${ctx.site.id}`); assert(rv2.data.monthly.length >= 1, 'monthly missing');
  return `total=¥${m.data.revenue} mobile=¥${m.data.byDevice.mobile.revenue} desktop=¥${m.data.byDevice.desktop.revenue}`;
});
await step('AI Analysis (access/click: data_used, reasoning, causes, suggestions, uncertainty)', async () => {
  assert(AI, 'Ollama not connected');
  const r = await req('POST', '/api/ai/analyze', { siteId: ctx.site.id, type: 'click' }); assert(r.status === 200 && r.data.analysisId, 'analysis failed: ' + r.text.slice(0, 300)); const res = r.data.result;
  for (const k of ['data_used', 'reasoning', 'possible_causes', 'suggestions', 'uncertainty']) assert(k in res, `result missing ${k}`);
  const a = await req('GET', `/api/ai/analyses/${r.data.analysisId}`); assert(a.data.analysis_type === 'click' && a.data.input_summary, 'analysis not persisted'); const sent = JSON.stringify(a.data.input_summary); assert(!/password|api_key|@example\.com/i.test(sent), 'sensitive data leaked to AI input');
  ctx.analysisId = r.data.analysisId; return `analysis#${r.data.analysisId} suggestions=${(res.suggestions || []).length} recs=${r.data.recommendationIds.length} ${r.data.durationMs}ms; sensitive filter ok`;
});
await step('AI Recommendation (generate, categories)', async () => {
  assert(AI, 'Ollama not connected');
  const cats = await req('GET', '/api/ai/recommendations/categories'); assert(cats.data.length === 9 && cats.data.includes('INTERNAL_LINK'), 'categories');
  const r = await req('POST', '/api/ai/recommendations/generate', { siteId: ctx.site.id, pageId: ctx.pageId }); assert(r.status === 200, 'generate failed: ' + r.text.slice(0, 300));
  const list = await req('GET', `/api/ai/recommendations?siteId=${ctx.site.id}&status=pending`); assert(list.data.length >= 1, 'no pending recommendations'); ctx.recs = list.data;
  return `generated=${r.data.recommendationIds.length} pending total=${list.data.length} categories=${[...new Set(list.data.map(x => x.category))].join(',')}`;
});
await step('Approval Workflow (Approve→Apply draft only / Reject / Hold)', async () => {
  // Create a deterministic recommendation via direct route? Use mobile rec if available, else first pending.
  let recId = ctx.mobileRecId; let recs = (await req('GET', `/api/ai/recommendations?siteId=${ctx.site.id}&status=pending`)).data;
  if (!recId) { recId = recs[0]?.id; }
  if (!recId) { // fabricate via experiments-free path: run optimize is AI; fallback: create analysis-less rec through analyze? Must have AI. Use direct DB-less approach -> fail honestly.
    throw new Error('no pending recommendation available (AI not connected)'); }
  const hold = await req('POST', `/api/ai/recommendations/${recId}/review`, { decision: 'hold', note: 'later' }); assert(hold.data.status === 'hold', 'hold failed');
  const pv = await req('GET', `/api/ai/recommendations/${recId}/preview`); assert(pv.status === 200 && 'applicableCount' in pv.data, 'preview failed');
  const appr = await req('POST', `/api/ai/recommendations/${recId}/review`, { decision: 'approve' }); assert(appr.data.status === 'approved' && appr.data.reviewed_by, 'approve failed');
  const before = (await req('GET', `/api/builder/pages/${ctx.pageId}/versions`)).data.length;
  const ap = await req('POST', `/api/ai/recommendations/${recId}/apply`); assert(ap.status === 200 && ap.data.published === false && ap.data.improvementHistoryId, 'apply failed: ' + ap.text);
  const after = (await req('GET', `/api/ai/recommendations?siteId=${ctx.site.id}&status=applied`)).data; assert(after.some(x => x.id === recId), 'status should be applied');
  const pub = await fetch(`${BASE}/s/${ctx.site.slug}/`); assert(pub.status === 200, 'public still served'); // published version unchanged by apply (draft only)
  const other = recs.find(x => x.id !== recId); if (other) { const rj = await req('POST', `/api/ai/recommendations/${other.id}/review`, { decision: 'reject', note: 'not now' }); assert(rj.data.status === 'rejected' && rj.data.review_note === 'not now', 'reject failed'); const apRej = await req('POST', `/api/ai/recommendations/${other.id}/apply`); assert(apRej.status === 409, 'rejected must not apply'); }
  ctx.improvementId = ap.data.improvementHistoryId; return `rec#${recId} hold→approve→apply(${ap.data.appliedCount} changes, draft only, history#${ctx.improvementId}); reject verified`;
});
await step('A/B Test (create A/B, running, variant metrics, data-insufficient verdict)', async () => {
  const ex = await req('POST', '/api/ai/experiments', { siteId: ctx.site.id, pageId: ctx.pageId, name: 'E2E CTA test', hypothesis: 'ボタン文言でCTRが変わる可能性', min_sample_size: 50, overridesB: { [ctx.ctaId]: { props: { buttonText: 'B: 無料で試す' } } } }); assert(ex.status === 201 && ex.data.variants.length === 2, 'create failed ' + ex.text); ctx.expId = ex.data.id; const [A, Bv] = ex.data.variants;
  await req('PUT', `/api/ai/experiments/${ctx.expId}`, { status: 'running' });
  const pubRes = await fetch(`${BASE}/s/${ctx.site.slug}/`); const html = await pubRes.text(); const setc = pubRes.headers.get('set-cookie') || ''; assert(setc.includes(`aap_exp_${ctx.expId}=`), 'variant cookie not set on public page'); const vid = Number(setc.match(new RegExp(`aap_exp_${ctx.expId}=(\\d+)`))[1]); assert([A.id, Bv.id].includes(vid), 'invalid variant assigned'); assert(html.includes(`"variantId":${vid}`), 'tracking should carry variantId');
  const pvB = await req('GET', `/api/preview/pages/${ctx.pageId}?variantId=${Bv.id}`); assert(pvB.text.includes('B: 無料で試す'), 'variant B override not rendered'); const pvA = await req('GET', `/api/preview/pages/${ctx.pageId}?variantId=${A.id}`); assert(!pvA.text.includes('B: 無料で試す'), 'variant A should not have B text');
  for (let i = 0; i < 3; i++) { await fetch(`${BASE}/t/e`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId: ctx.site.id, pageId: ctx.pageId, sessionId: 'ab-a' + i, type: 'pageview', device: 'mobile', variantId: A.id }) }); }
  for (let i = 0; i < 2; i++) { await fetch(`${BASE}/t/e`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId: ctx.site.id, pageId: ctx.pageId, sessionId: 'ab-b' + i, type: 'pageview', device: 'mobile', variantId: Bv.id }) }); }
  await fetch(`${BASE}/t/ad`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId: ctx.site.id, pageId: ctx.pageId, adId: ctx.adId, sessionId: 'ab-b0', device: 'mobile', variantId: Bv.id }) });
  const d = await req('GET', `/api/ai/experiments/${ctx.expId}`); const mA = d.data.variants.find(v => v.id === A.id).metrics, mB = d.data.variants.find(v => v.id === Bv.id).metrics; assert(mA.pv === 3 && mB.pv === 2 && mB.affiliateClicks === 1 && mB.ctr === 50, 'variant metrics mismatch ' + JSON.stringify({ mA, mB })); assert(d.data.sufficientData === false && d.data.verdict.includes('データ不足'), 'should report insufficient data');
  let aiNote = 'AI skipped'; if (AI) { const an = await req('POST', `/api/ai/experiments/${ctx.expId}/analyze`); assert(an.status === 200 && an.data.sufficientData === false && an.data.result.verdict === '判断にはデータ不足', 'ai ab analysis should say データ不足'); aiNote = `AI verdict="${an.data.result.verdict}"`; }
  return `exp#${ctx.expId} A pv=3 B pv=2 click=1 ctr=50% → "${d.data.verdict}" ${aiNote}`;
});
await step('Improvement History (before→change→after + post analysis, no causal claim)', async () => {
  assert(ctx.improvementId, 'no improvement recorded (approval step failed)');
  const h = await req('GET', `/api/ai/improvements/${ctx.improvementId}`); assert(h.data.before_snapshot && h.data.after_snapshot && h.data.before_metrics && h.data.change_summary, 'history incomplete');
  let note = ''; if (AI) { const an = await req('POST', `/api/ai/improvements/${ctx.improvementId}/analyze`); assert(an.status === 200 && an.data.after && an.data.result.uncertainty, 'post analysis failed'); const h2 = await req('GET', `/api/ai/improvements/${ctx.improvementId}`); assert(h2.data.after_metrics && h2.data.ai_post_analysis_id, 'after metrics not saved'); note = ` post-analysis#${an.data.analysisId} uncertainty present`; }
  return `history#${ctx.improvementId} before/change/after saved${note}`;
});
await step('Undo / Redo (server-side history, survives reload)', async () => {
  const s0 = (await req('GET', `/api/builder/pages/${ctx.pageId}`)).data; const n0 = s0.components.length;
  const add = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'divider' }); assert(add.data.history.canUndo, 'canUndo should be true');
  const u = await req('POST', `/api/builder/pages/${ctx.pageId}/undo`); assert(u.data.ok && u.data.snapshot.components.length === n0, 'undo did not restore count');
  const s1 = (await req('GET', `/api/builder/pages/${ctx.pageId}`)).data; assert(s1.components.length === n0 && s1.history.canRedo, 'reload after undo should show restored state + canRedo');
  const r = await req('POST', `/api/builder/pages/${ctx.pageId}/redo`); assert(r.data.ok && r.data.snapshot.components.length === n0 + 1, 'redo failed');
  const s2 = (await req('GET', `/api/builder/pages/${ctx.pageId}`)).data; assert(s2.components.length === n0 + 1, 'reload after redo');
  await req('POST', `/api/builder/pages/${ctx.pageId}/undo`); const e = await req('PUT', `/api/builder/pages/${ctx.pageId}/components/${ctx.headingId}`, { props: { text: 'After undo edit', level: 2 } }); assert(!e.data.history.canRedo, 'new action must clear redo stack');
  const hist = await req('GET', `/api/builder/pages/${ctx.pageId}/history`); assert(hist.data.length >= 3, 'history list');
  return `add→undo(${n0})→redo(${n0 + 1})→undo→edit clears redo; history entries=${hist.data.length}`;
});
await step('Autosave (creates autosave version, does NOT publish)', async () => {
  const before = (await req('GET', `/api/builder/pages/${ctx.pageId}/versions`)).data.length;
  const pubBefore = await (await fetch(`${BASE}/s/${ctx.site.slug}/`)).text();
  await req('PUT', `/api/builder/pages/${ctx.pageId}/components/${ctx.headingId}`, { props: { text: 'AUTOSAVE-ONLY-TEXT', level: 2 } });
  const a = await req('POST', `/api/builder/pages/${ctx.pageId}/autosave`); assert(a.data.ok && a.data.kind === 'autosave' && a.data.published === false, 'autosave failed');
  const vs = (await req('GET', `/api/builder/pages/${ctx.pageId}/versions`)).data; assert(vs.length === before + 1 && vs[0].kind === 'autosave', 'autosave version missing');
  const pubAfter = await (await fetch(`${BASE}/s/${ctx.site.slug}/`)).text(); assert(!pubAfter.includes('AUTOSAVE-ONLY-TEXT'), 'autosave must NOT change public site'); assert(pubAfter.includes('a8mat=TEST123'), 'public page broken');
  const draft = await req('GET', `/api/preview/pages/${ctx.pageId}`); assert(draft.text.includes('AUTOSAVE-ONLY-TEXT'), 'draft preview should show autosaved change');
  return `autosave v${a.data.version}; public unchanged, draft preview updated`;
});
await step('Version Control (manual save, list, publish version, public uses publish snapshot)', async () => {
  const s = await req('POST', `/api/builder/pages/${ctx.pageId}/save`, { note: 'E2E manual' }); assert(s.data.ok && s.data.kind === 'manual', 'save failed');
  const vs = (await req('GET', `/api/builder/pages/${ctx.pageId}/versions`)).data; assert(vs[0].kind === 'manual' && vs[0].note === 'E2E manual' && vs.some(v => v.kind === 'publish') && vs.some(v => v.kind === 'autosave'), 'version kinds missing');
  const v = await req('GET', `/api/builder/pages/${ctx.pageId}/versions/${vs[0].id}`); assert(v.data.snapshot.components.length >= 1, 'version snapshot');
  const p = await req('POST', `/api/builder/pages/${ctx.pageId}/publish`); assert(p.data.kind === 'publish', 'page publish failed');
  const pub = await (await fetch(`${BASE}/s/${ctx.site.slug}/`)).text(); assert(pub.includes('AUTOSAVE-ONLY-TEXT'), 'after publish, public should include latest draft');
  ctx.versions = vs; return `versions=${vs.length + 1} (manual/autosave/publish/ai_apply) public updated only after Publish`;
});
await step('Rollback (restore old version, undo-able, new version recorded)', async () => {
  const vs = (await req('GET', `/api/builder/pages/${ctx.pageId}/versions`)).data; const initial = vs[vs.length - 1]; assert(initial.version === 1, 'initial version');
  const cur = (await req('GET', `/api/builder/pages/${ctx.pageId}`)).data.components.length;
  const rb = await req('POST', `/api/builder/pages/${ctx.pageId}/versions/${initial.id}/rollback`); assert(rb.data.ok && rb.data.restoredFrom === 1 && rb.data.snapshot.components.length !== cur, 'rollback did not change state');
  const vs2 = (await req('GET', `/api/builder/pages/${ctx.pageId}/versions`)).data; assert(vs2[0].kind === 'rollback', 'rollback version not recorded');
  const u = await req('POST', `/api/builder/pages/${ctx.pageId}/undo`); assert(u.data.ok && u.data.snapshot.components.length === cur, 'rollback should be undo-able');
  return `rolled back to v1 (${rb.data.snapshot.components.length} comps) then undo → ${cur} comps`;
});
await step('SEO (title/meta/canonical/robots/sitemap/OGP/JSON-LD/headings/internal links/report)', async () => {
  const up = await req('PUT', `/api/sites/${ctx.site.id}/pages/${ctx.pageId}`, { seo_title: 'XServer VPS 徹底比較 | E2E', meta_description: 'XServer VPSの料金・性能・評判を比較し、用途別のおすすめプランをわかりやすく解説します。初心者向けの選び方も紹介。', canonical_url: `${BASE}/s/${ctx.site.slug}/`, robots: 'index,follow', og_image: '/uploads/x.png' }); assert(up.status === 200, 'seo update failed');
  await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'faq', props: { title: 'FAQ', items: [{ q: '無料期間は？', a: '10日間の無料お試しがあります（時期により異なる可能性）' }] } });
  await req('POST', `/api/builder/pages/${ctx.pageId}/publish`);
  const html = await (await fetch(`${BASE}/s/${ctx.site.slug}/`)).text();
  for (const needle of ['<title>XServer VPS 徹底比較 | E2E</title>', 'name="description"', 'rel="canonical"', 'name="robots" content="index,follow"', 'property="og:title"', 'property="og:image"', 'application/ld+json', '"@type":"FAQPage"', '"@type":"BreadcrumbList"', 'rel="alternate" type="application/rss+xml"']) assert(html.includes(needle), 'missing ' + needle);
  const sm = await fetch(`${BASE}/s/${ctx.site.slug}/sitemap.xml`); assert(sm.status === 200 && (await sm.text()).includes('<urlset'), 'sitemap'); const rb = await fetch(`${BASE}/s/${ctx.site.slug}/robots.txt`); assert((await rb.text()).includes('Sitemap:'), 'robots'); const feed = await fetch(`${BASE}/s/${ctx.site.slug}/feed.xml`); assert(feed.status === 200, 'feed');
  const rep = await req('GET', `/api/preview/seo/sites/${ctx.site.id}`); const pg = rep.data.pages.find(p => p.pageId === ctx.pageId); assert(pg && typeof pg.score === 'number' && Array.isArray(pg.headings) && 'internalLinks' in pg, 'seo report');
  let aiNote = ''; if (AI) { const t = await req('POST', '/api/articles/ai/seo-title', { title: 'XServer VPS 比較', keywords: ['VPS'] }); assert(t.status === 200 && Array.isArray(t.data.result.titles), 'ai seo title'); aiNote = ` AI titles=${t.data.result.titles.length}`; }
  return `tags ok, sitemap/robots/feed ok, score=${pg.score}${aiNote}`;
});
await step('Security (XSS sanitize, SQLi, CSRF, rate limit, headers, secrets, ad code untouched)', async () => {
  const draft = await req('GET', `/api/preview/pages/${ctx.pageId}`); assert(!draft.text.includes('<script>alert(1)</script>'), 'XSS: script must be stripped from text component');
  const x = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'heading', props: { text: '<img src=x onerror=alert(1)>', level: 2 } }); const pv = await req('GET', `/api/preview/pages/${ctx.pageId}`); assert(pv.text.includes('&lt;img src=x onerror=alert(1)&gt;'), 'XSS: heading must be escaped'); await req('DELETE', `/api/builder/pages/${ctx.pageId}/components/${x.data.component.id}`);
  const sqli = await req('POST', '/api/auth/login', { email: "' OR 1=1 --", password: "' OR '1'='1" }, { noCsrf: true }); assert(sqli.status === 401, 'SQLi login must fail'); const h = await req('GET', '/api/health'); assert(h.data.ok, 'db intact after sqli');
  const sq2 = await fetch(`${BASE}/s/${ctx.site.slug}/search?q=%27%20OR%201%3D1%20--`); assert(sq2.status === 200, 'search sqli should not crash');
  const me = await req('GET', '/api/auth/me'); assert(!JSON.stringify(me.data).replace(/must_change_password/g, '').match(/sessionSecret|password|SESSION_SECRET|ADMIN_PASSWORD/i), 'secrets leaked in /me');
  const admin = await fetch(`${BASE}/admin/`); assert(admin.headers.get('content-security-policy') && admin.headers.get('x-content-type-options') === 'nosniff', 'security headers missing');
  const pub = await fetch(`${BASE}/s/${ctx.site.slug}/`); assert(pub.headers.get('x-frame-options') === 'SAMEORIGIN', 'x-frame-options'); const pubHtml = await pub.text(); assert(!/localhost:12000|OLLAMA|SESSION_SECRET|ADMIN_PASSWORD/.test(pubHtml) && !pubHtml.includes(ADMIN_PASSWORD), 'public site leaks config');
  const sc = cookie; assert(/aap_sid=/.test(sc), 'session cookie'); const loginRes = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }) }); const setc = loginRes.headers.get('set-cookie') || ''; assert(/HttpOnly/i.test(setc) && /SameSite=Lax/i.test(setc), 'cookie flags');
  let limited = false; for (let i = 0; i < 12; i++) { const r = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.9' }, body: JSON.stringify({ email: 'nobody@example.com', password: 'x' }) }); if (r.status === 429) { limited = true; break; } } assert(limited, 'login rate limit not triggered');
  const ad = await req('GET', `/api/affiliate/ads/${ctx.adId}`); assert(ad.data.integrity_ok && ad.data.original_code.includes('tracking=xyz'), 'ad code integrity');
  const logs = await req('GET', '/api/auth/audit-logs?limit=5'); assert(logs.data.length > 0 && logs.data[0].action, 'audit logs');
  return 'XSS escaped/sanitized, SQLi safe, CSRF enforced, rate limit 429, CSP/nosniff/XFO, HttpOnly+SameSite, no secret leak, ad integrity, audit logs';
});
await step('Authorization / RBAC (viewer read-only, editor no admin ops)', async () => {
  const saved = { cookie, csrf };
  const vpw = 'Viewer-Test-Pass-2026!', epw = 'Editor-Test-Pass-2026!';
  const weak = await req('POST', '/api/auth/users', { email: 'weak@example.com', name: 'W', password: 'short', role: 'viewer' }); assert(weak.status === 400, 'weak password for new user must be rejected');
  const cv = await req('POST', '/api/auth/users', { email: 'e2e-viewer@example.com', name: 'Viewer', password: vpw, role: 'viewer' }); assert(cv.status === 201, 'create viewer: ' + cv.text);
  const ce = await req('POST', '/api/auth/users', { email: 'e2e-editor@example.com', name: 'Editor', password: epw, role: 'editor' }); assert(ce.status === 201, 'create editor');
  cookie = ''; csrf = ''; const v = await req('POST', '/api/auth/login', { email: 'e2e-viewer@example.com', password: vpw }, { noCsrf: true }); assert(v.status === 200 && v.data.user.must_change_password === true, 'viewer login / must_change flag'); csrf = v.data.csrf;
  assert((await req('GET', '/api/sites')).status === 200, 'viewer can read'); assert((await req('POST', '/api/sites', { name: 'nope' })).status === 403, 'viewer must not create'); assert((await req('GET', '/api/auth/users')).status === 403, 'viewer must not list users'); assert((await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'divider' })).status === 403, 'viewer must not edit builder');
  cookie = ''; csrf = ''; const e = await req('POST', '/api/auth/login', { email: 'e2e-editor@example.com', password: epw }, { noCsrf: true }); assert(e.status === 200, 'editor login'); csrf = e.data.csrf;
  assert((await req('GET', '/api/auth/users')).status === 403, 'editor must not manage users'); assert((await req('DELETE', `/api/sites/${ctx.site.id}`)).status === 403, 'editor must not delete site'); const ok = await req('POST', `/api/builder/pages/${ctx.pageId}/components`, { type: 'divider' }); assert(ok.status === 201, 'editor can edit'); await req('DELETE', `/api/builder/pages/${ctx.pageId}/components/${ok.data.component.id}`);
  const lo = await req('POST', '/api/auth/logout'); assert(lo.data.ok, 'logout');
  cookie = saved.cookie; csrf = saved.csrf;
  await req('DELETE', `/api/auth/users/${cv.data.id}`); await req('DELETE', `/api/auth/users/${ce.data.id}`);
  return 'viewer: read ok / write 403; editor: edit ok / admin ops 403; weak pw rejected';
});
await step('Account Security (no secrets in UI/API, email change, password change, policy, session rotation, rate limit)', async () => {
  // 1. Login page / JS / API must not contain initial credentials
  const html = await (await fetch(`${BASE}/admin/`)).text();
  const js = (await Promise.all(['core', 'app', 'pages', 'pages2', 'builder', 'uitest'].map(f => fetch(`${BASE}/admin/assets/${f}.js`).then(r => r.text())))).join('\n');
  for (const needle of [ADMIN_PASSWORD, 'ADMIN_PASSWORD', 'ADMIN_EMAIL', 'SESSION_SECRET', 'Admin1234', '初期アカウント']) assert(!html.includes(needle) && !js.includes(needle), `client code leaks "${needle}"`);
  assert(!js.includes('value="admin@example.com"'), 'login email must not be prefilled');
  const meJson = JSON.stringify((await req('GET', '/api/auth/me')).data); assert(!/password|secret|ADMIN_/i.test(meJson.replace(/must_change_password/g, '')), '/me leaks secrets');
  const cfgJson = JSON.stringify((await req('GET', '/api/auth/me')).data.config); assert(!/admin|password|secret/i.test(cfgJson), 'public config leaks admin info');
  // 2. Account info endpoint: masked email, no hash
  const acct = await req('GET', '/api/auth/account'); assert(acct.status === 200 && acct.data.email_masked.includes('*') && !('password_hash' in acct.data) && acct.data.password_policy, 'account endpoint');
  const unauth = await req('GET', '/api/auth/account', undefined, { cookieOverride: '' }); assert(unauth.status === 401, 'account must require auth');
  // 3. Password change validations
  const newPw = 'E2E-New-Secure-Pass-2026!';
  assert((await req('PUT', '/api/auth/account/password', { current_password: 'wrong-current', new_password: newPw, new_password_confirm: newPw })).status === 401, 'wrong current password must 401');
  assert((await req('PUT', '/api/auth/account/password', { current_password: ADMIN_PASSWORD, new_password: newPw, new_password_confirm: newPw + 'x' })).status === 400, 'mismatch must 400');
  assert((await req('PUT', '/api/auth/account/password', { current_password: ADMIN_PASSWORD, new_password: 'weakpass', new_password_confirm: 'weakpass' })).status === 400, 'weak password must 400');
  assert((await req('PUT', '/api/auth/account/password', { current_password: ADMIN_PASSWORD, new_password: newPw, new_password_confirm: newPw }, { noCsrf: true })).status === 403, 'CSRF required');
  const oldCookie = cookie;
  const ch = await req('PUT', '/api/auth/account/password', { current_password: ADMIN_PASSWORD, new_password: newPw, new_password_confirm: newPw }); assert(ch.status === 200 && ch.data.message === '管理者アカウント情報を更新しました。' && ch.data.user.must_change_password === false && ch.data.csrf, 'password change failed: ' + ch.text);
  assert(!JSON.stringify(ch.data).includes(newPw), 'response must not echo password'); csrf = ch.data.csrf;
  assert(cookie !== oldCookie, 'session id must rotate after password change');
  const oldSess = await req('GET', '/api/sites', undefined, { cookieOverride: oldCookie }); assert(oldSess.status === 401, 'old session must be revoked');
  // 4. Old password no longer works, new works
  const c0 = cookie, cs0 = csrf; cookie = ''; csrf = '';
  assert((await req('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }, { noCsrf: true })).status === 401, 'old password must fail');
  const nl = await req('POST', '/api/auth/login', { email: ADMIN_EMAIL, password: newPw }, { noCsrf: true }); assert(nl.status === 200, 'new password login'); csrf = nl.data.csrf;
  // 5. Email change
  const newEmail = 'e2e-admin-changed@example.com';
  assert((await req('PUT', '/api/auth/account/email', { current_password: newPw, new_email: 'not-an-email' })).status === 400, 'invalid email must 400');
  assert((await req('PUT', '/api/auth/account/email', { current_password: 'bad', new_email: newEmail })).status === 401, 'email change needs current password');
  const em = await req('PUT', '/api/auth/account/email', { current_password: newPw, new_email: newEmail }); assert(em.status === 200 && em.data.user.email === newEmail, 'email change failed: ' + em.text); csrf = em.data.csrf;
  cookie = ''; csrf = ''; const l2 = await req('POST', '/api/auth/login', { email: newEmail, password: newPw }, { noCsrf: true }); assert(l2.status === 200, 'login with new email'); csrf = l2.data.csrf;
  // 6. Stored hash is scrypt (not plaintext) — verify via users listing not exposing hash, and DB check through admin API shape
  const users = await req('GET', '/api/auth/users'); assert(users.data.every(u => !('password_hash' in u)), 'users API must not expose hashes');
  // 7. Rate limit on account changes (8/10min): remaining attempts should hit 429 eventually
  let limited = false; for (let i = 0; i < 12; i++) { const r = await req('PUT', '/api/auth/account/password', { current_password: 'x', new_password: newPw, new_password_confirm: newPw }); if (r.status === 429) { limited = true; break; } } assert(limited, 'account change rate limit not triggered');
  // 8. Restore original credentials for subsequent runs (rate-limited now, so wait for a fresh key by using a different X-Forwarded-For)
  const restore = async (path, body) => req('PUT', path, body, { headers: { 'X-Forwarded-For': '198.51.100.7' } });
  const r1 = await restore('/api/auth/account/email', { current_password: newPw, new_email: ADMIN_EMAIL }); assert(r1.status === 200, 'restore email'); csrf = r1.data.csrf;
  const r2 = await restore('/api/auth/account/password', { current_password: newPw, new_password: ADMIN_PASSWORD, new_password_confirm: ADMIN_PASSWORD }); assert(r2.status === 200, 'restore password: ' + r2.text); csrf = r2.data.csrf;
  return 'no secrets in HTML/JS/API; pw change (401/400/403 guards, rotation, revoke, old pw fails); email change; rate limit 429; hash never exposed';
});
await step('Logout (session destroyed)', async () => { const r = await req('POST', '/api/auth/logout'); assert(r.data.ok, 'logout failed'); const me = await req('GET', '/api/auth/me'); assert(me.data.authenticated === false, 'session should be destroyed'); const s = await req('GET', '/api/sites'); assert(s.status === 401, 'should be 401 after logout'); return 'session invalidated'; });

// ---- Report ----
const pass = results.filter(r => r.ok).length, fail = results.length - pass;
console.log('\n==================== TEST REPORT ====================');
for (const r of results) console.log(`${r.name.padEnd(60, ' ')} ${r.ok ? 'PASS' : 'FAILED'}${r.ok ? '' : '  <- ' + r.error}`);
console.log('=====================================================');
console.log(`TOTAL ${results.length}  PASS ${pass}  FAILED ${fail}  (AI model: ${ctx.ai?.model || '?'} status: ${ctx.ai?.status || '?'})\n`);
const fs = await import('node:fs');
fs.writeFileSync(new URL('../TEST_REPORT.json', import.meta.url), JSON.stringify({ base: BASE, date: new Date().toISOString(), ai: ctx.ai && { status: ctx.ai.status, model: ctx.ai.model, baseUrl: ctx.ai.baseUrl }, results }, null, 2));
process.exit(fail ? 1 : 0);
