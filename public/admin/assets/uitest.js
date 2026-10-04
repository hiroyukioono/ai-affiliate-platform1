// UI smoke test runner (dev only). Open /admin/#/uitest?pw=... to auto-login and walk through every route,
// reporting rendering errors to console as "UITEST ..." lines. Not loaded unless hash starts with #/uitest.
(() => {
  if (!location.hash.startsWith('#/uitest')) return;
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  const email = q.get('email') || 'admin@example.com', pw = q.get('pw') || 'Admin1234!';
  const ALL = ['/', '/sites', '/designs', '/responsive', '/mobile-prompts', '/mobile', '/media', '/articles', '/categories', '/products', '/affiliate-programs', '/affiliate-links', '/ads', '/analytics', '/conversions', '/revenue', '/seo', '/ai', '/recommendations', '/experiments', '/improvements', '/calendar', '/settings', '/builder'];
  const start = Number(q.get('start') || 0), count = Number(q.get('count') || ALL.length);
  const routes = ALL.slice(start, start + count);
  const doBuilder = q.get('builder') !== '0';
  const errors = [];
  window.addEventListener('error', (e) => errors.push(`${location.hash}: ${e.message}`));
  window.addEventListener('unhandledrejection', (e) => errors.push(`${location.hash}: ${e.reason?.message || e.reason}`));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  (async () => {
    await sleep(800);
    try {
      const r = await App.post('/api/auth/login', { email, password: pw });
      App.state.user = r.user; App.state.csrf = r.csrf; await App.loadSites();
      console.log('UITEST login ok', r.user.email);
    } catch (e) { console.error('UITEST LOGIN FAILED', e.message); return; }
    const results = [];
    for (const path of routes) {
      const before = errors.length;
      location.hash = '#' + path; await sleep(1500);
      const main = document.querySelector('#main');
      const text = main ? main.innerText.trim() : '';
      const hasError = errors.length > before || /^エラー:/.test(text);
      const ok = !!main && text.length > 0 && !hasError;
      results.push({ path, ok, chars: text.length, err: errors.slice(before).join(' | ') });
      console.log(`UITEST ${ok ? 'PASS' : 'FAIL'} ${path} (${text.length} chars)${hasError ? ' ERR: ' + errors.slice(before).join(' | ') : ''}`);
    }
    // Builder interaction: add component via palette click, select it, switch device, undo
    if (doBuilder) try {
      const site = App.site(); const detail = await App.get(`/api/sites/${site.id}`); location.hash = `#/builder/${site.id}/${detail.pages[0].id}`; await sleep(1800);
      const n0 = document.querySelectorAll('.canvas-item').length;
      document.querySelector('.palette-item[data-type="divider"]').click(); await sleep(1200);
      const n1 = document.querySelectorAll('.canvas-item').length;
      document.querySelector('.device-tab[data-d="mobile"]').click(); await sleep(400);
      const w = document.getElementById('canvas-frame').style.width;
      document.querySelectorAll('.canvas-item')[0].click(); await sleep(400);
      const propsShown = !!document.querySelector('#props .prop-group');
      document.getElementById('undo').click(); await sleep(1200);
      const n2 = document.querySelectorAll('.canvas-item').length;
      const ok = n1 === n0 + 1 && w === '390px' && propsShown && n2 === n0;
      console.log(`UITEST ${ok ? 'PASS' : 'FAIL'} builder-interaction add:${n0}->${n1} mobileWidth:${w} props:${propsShown} undo:${n2}`);
      results.push({ path: 'builder-interaction', ok });
    } catch (e) { console.error('UITEST FAIL builder-interaction', e.message); results.push({ path: 'builder-interaction', ok: false }); }
    console.log(`UITEST SUMMARY ${results.filter(r => r.ok).length}/${results.length} PASS`);
    window.__uitest = results;
  })();
})();
