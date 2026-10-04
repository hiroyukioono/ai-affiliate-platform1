// Unit tests (node --test). Run: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openTestDb, J, P } from '../src/db/index.js';
import { hashPassword, verifyPassword, escapeHtml, sanitizeHtml, safeUrl, slugify, filterForAI, rateLimit, sha256 } from '../src/lib/security.js';
import { extractJson, repairTruncated } from '../src/ai/service.js';
import { getPageSnapshot, applySnapshot, recordHistory, undo, redo, saveVersion, historyState } from '../src/lib/builder.js';
import { mobileQualityCheck } from '../src/render/mobileCheck.js';
import { renderPage } from '../src/render/site.js';
import { OllamaProvider } from '../src/ai/provider.js';
import { runSeed } from '../src/db/seed.js';

test('password hashing (scrypt) verifies and rejects', () => {
  const h = hashPassword('Secret123!');
  assert.ok(h.startsWith('scrypt$'));
  assert.equal(verifyPassword('Secret123!', h), true);
  assert.equal(verifyPassword('wrong', h), false);
  assert.notEqual(hashPassword('Secret123!'), h, 'salted');
});

test('escapeHtml / sanitizeHtml / safeUrl', () => {
  assert.equal(escapeHtml('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
  const dirty = '<p onclick="x()">ok</p><script>alert(1)</script><iframe src="x"></iframe><a href="javascript:alert(1)">l</a>';
  const clean = sanitizeHtml(dirty);
  assert.ok(!/<script|<iframe|onclick|javascript:/i.test(clean));
  assert.ok(clean.includes('<p>ok</p>') || clean.includes('<p >ok</p>'));
  assert.equal(safeUrl('javascript:alert(1)'), '#');
  assert.equal(safeUrl('https://example.com/a?b=1'), 'https://example.com/a?b=1');
  assert.equal(safeUrl('/s/x/'), '/s/x/');
});

test('slugify is URL-safe for Japanese input and stable', () => {
  assert.equal(slugify('XServer VPS 比較ガイド'), 'xserver-vps');
  const jp = slugify('比較ガイド'); assert.match(jp, /^[a-z0-9-]+$/); assert.equal(jp, slugify('比較ガイド'));
  assert.equal(slugify('  Hello  World!! '), 'hello-world');
});

test('filterForAI removes sensitive keys and values', () => {
  const out = filterForAI({ name: 'x', password: 'p', api_key: 'k', nested: { token: 't', email: 'a@b.com', note: 'contact a@b.com or sk-abcdefghijklmnop' }, list: [{ secret: 's', ok: 1 }] });
  assert.equal(out.password, undefined); assert.equal(out.api_key, undefined); assert.equal(out.nested.token, undefined); assert.equal(out.nested.email, undefined);
  assert.ok(!out.nested.note.includes('a@b.com') && !out.nested.note.includes('sk-abc'));
  assert.equal(out.list[0].secret, undefined); assert.equal(out.list[0].ok, 1);
});

test('rateLimit fixed window', () => {
  const db = openTestDb();
  for (let i = 0; i < 3; i++) assert.equal(rateLimit(db, 'k', 3, 60).allowed, true);
  const r = rateLimit(db, 'k', 3, 60); assert.equal(r.allowed, false); assert.ok(r.retryAfter > 0);
});

test('extractJson handles fences, trailing commas, truncation', () => {
  assert.deepEqual(extractJson('```json\n{"a":1}\n```'), { a: 1 });
  assert.deepEqual(extractJson('text before {"a":[1,2,],} after'), { a: [1, 2] });
  const t = extractJson('{"pages":[{"title":"A","slug":"a"},{"title":"B","sl'); assert.ok(t && Array.isArray(t.pages) && t.pages.length >= 1 && t.__truncated);
  assert.equal(extractJson('no json here'), null);
  assert.ok(repairTruncated('{"a":{"b":[1,{"c":"x').a.b.length === 2);
});

test('seed inserts 10 mobile prompts, 10 designs, 3 responsive sets, 3 users', () => {
  const db = openTestDb();
  const r = runSeed(db, { log: () => {} });
  assert.equal(r.mobilePrompts, 10); assert.equal(r.designs, 10); assert.equal(r.responsiveSets, 3); assert.equal(r.users, 3);
  assert.equal(db.get('SELECT COUNT(*) n FROM mobile_prompt_versions').n, 10);
  const again = runSeed(db, { log: () => {} }); assert.equal(again.mobilePrompts, 0, 'idempotent');
});

function fixture() {
  const db = openTestDb(); runSeed(db, { log: () => {} });
  const s = db.run("INSERT INTO sites(name,slug,design_theme_id,responsive_set_id,mobile_prompt_id) VALUES('T','t',1,1,1)").lastInsertRowid;
  db.run('INSERT INTO mobile_design_settings(site_id) VALUES(?)', [s]);
  const p = db.run("INSERT INTO site_pages(site_id,title,slug,page_type,status) VALUES(?,'Home','home','home','published')", [s]).lastInsertRowid;
  const c1 = db.run('INSERT INTO site_components(page_id,type,props,sort_order) VALUES(?,?,?,0)', [p, 'heading', J({ text: 'H', level: 1 })]).lastInsertRowid;
  const c2 = db.run('INSERT INTO site_components(page_id,type,props,sort_order,mobile_config) VALUES(?,?,?,1,?)', [p, 'cta', J({ title: 'C', buttonText: 'Go', url: '#' }), J({ width: '100%' })]).lastInsertRowid;
  return { db, s, p, c1, c2 };
}

test('builder: snapshot / history undo-redo / versions / nested transaction', () => {
  const { db, s, p } = fixture();
  const before = getPageSnapshot(db, p); assert.equal(before.components.length, 2);
  db.run('INSERT INTO site_components(page_id,type,props,sort_order) VALUES(?,?,?,2)', [p, 'divider', '{}']);
  const after = getPageSnapshot(db, p);
  recordHistory(db, p, 1, 'add', before, after);
  assert.deepEqual(historyState(db, p), { canUndo: true, canRedo: false });
  assert.equal(undo(db, p).ok, true); assert.equal(getPageSnapshot(db, p).components.length, 2);
  assert.deepEqual(historyState(db, p), { canUndo: false, canRedo: true });
  assert.equal(redo(db, p).ok, true); assert.equal(getPageSnapshot(db, p).components.length, 3);
  const v = saveVersion(db, s, p, 'manual', 'n', 1); assert.equal(v.version, 1);
  // nested transaction via savepoint must not throw
  db.transaction(() => applySnapshot(db, p, before));
  assert.equal(getPageSnapshot(db, p).components.length, 2);
  assert.equal(undo(db, p).ok, true, 'redo re-enabled undo'); assert.equal(undo(db, p).ok, false, 'no more undo');
});

test('mobileQualityCheck detects overflow / tap / passes clean page', () => {
  const { db, p } = fixture();
  const ok = mobileQualityCheck(db, p); assert.equal(ok.status, 'PASS'); assert.equal(ok.viewports.length, 5);
  db.run('INSERT INTO site_components(page_id,type,props,sort_order,mobile_config) VALUES(?,?,?,5,?)', [p, 'button', J({ text: 'x' }), J({ width: '700px', height: '20px' })]);
  const bad = mobileQualityCheck(db, p); assert.equal(bad.status, 'ERROR');
  assert.ok(bad.issues.some(i => i.check === 'horizontal_scroll' && i.viewport === 320)); assert.ok(bad.issues.some(i => i.check === 'tap_target'));
});

test('renderPage: SEO tags, responsive CSS, escaping, ad code verbatim', () => {
  const { db, s, p, c2 } = fixture();
  const code = '<a href="https://px.a8.net/x?a8mat=ABC+DEF&t=1"><img src="https://www.a8.net/i.gif" width="300" height="250"></a>';
  const ad = db.run("INSERT INTO affiliate_ads(site_id,name,original_code,original_code_hash) VALUES(?,?,?,?)", [s, 'ad', code, sha256(code)]).lastInsertRowid;
  db.run('INSERT INTO site_components(page_id,type,props,sort_order) VALUES(?,?,?,3)', [p, 'affiliate_ad', J({ adId: ad })]);
  db.run('INSERT INTO site_components(page_id,type,props,sort_order) VALUES(?,?,?,4)', [p, 'heading', J({ text: '<script>x</script>', level: 2 })]);
  const site = db.get('SELECT * FROM sites WHERE id=?', [s]); const page = db.get('SELECT * FROM site_pages WHERE id=?', [p]);
  const snap = getPageSnapshot(db, p);
  const html = renderPage({ site, page, components: snap.components, pages: [page], design: db.get('SELECT * FROM design_themes WHERE id=1'), responsive: { desktop_config: {}, tablet_config: {}, mobile_config: {}, breakpoints: { tablet: 1024, mobile: 767 } }, mobileSettings: db.get('SELECT * FROM mobile_design_settings WHERE site_id=?', [s]), ads: new Map([[ad, db.get('SELECT * FROM affiliate_ads WHERE id=?', [ad])]]), products: new Map(), articles: new Map(), categories: [], baseUrl: 'http://x' });
  assert.ok(html.includes('<meta name="viewport"') && html.includes('rel="canonical"') && html.includes('application/ld+json') && html.includes('og:title'));
  assert.ok(html.includes('@media (max-width:767px)') && html.includes('max-width:100%'));
  assert.ok(html.includes(code), 'ad code must be rendered verbatim');
  assert.ok(html.includes('&lt;script&gt;x&lt;/script&gt;') && !html.includes('<script>x</script>'));
  assert.ok(html.includes(`#c${c2}{width:100%}`), 'per-device css');
  assert.ok(html.includes('/t/e'), 'tracking script present');
});

test('OllamaProvider.healthCheck classifies connection refused', async () => {
  const p = new OllamaProvider({ baseUrl: 'http://127.0.0.1:1/v1', model: 'llama3.1:8b', timeoutMs: 2000 });
  const h = await p.healthCheck();
  assert.equal(h.status, 'ERROR'); assert.equal(h.checks.server, false); assert.ok(h.errors[0].includes('接続拒否') || h.errors[0].includes('エラー')); assert.ok(h.hint.includes('ollama'));
});

test('OllamaProvider.chat against mock OpenAI-compatible server + max token cap', async () => {
  const { createServer } = await import('node:http');
  let received;
  const srv = createServer((req, res) => { let b = ''; req.on('data', d => b += d).on('end', () => { received = JSON.parse(b); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ model: received.model, choices: [{ message: { content: '{"ok":true}' } }], usage: { total_tokens: 5 } })); }); });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const p = new OllamaProvider({ baseUrl: `http://127.0.0.1:${port}/v1`, model: 'llama3.1:8b', apiKey: 'ollama', timeoutMs: 5000, maxTokensCap: 100 });
  const r = await p.chat([{ role: 'user', content: 'hi' }], { maxTokens: 2000, json: true });
  assert.equal(r.content, '{"ok":true}'); assert.equal(received.model, 'llama3.1:8b'); assert.equal(received.max_tokens, 100); assert.deepEqual(received.response_format, { type: 'json_object' });
  srv.close();
});
