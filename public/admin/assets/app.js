// App shell: layout, login, navigation, boot
(() => {
  const { state, get, post, esc, toast, route, navigate, render, setTheme, loadSites, setSite, badge } = App;

  const MENU = [
    { path: '/', icon: 'fa-gauge', label: 'Dashboard' },
    { path: '/sites', icon: 'fa-globe', label: 'Sites' },
    { path: '/builder', icon: 'fa-pen-ruler', label: 'Site Builder' },
    { path: '/designs', icon: 'fa-palette', label: 'Designs' },
    { path: '/responsive', icon: 'fa-table-cells-large', label: 'Responsive Designs' },
    { path: '/mobile-prompts', icon: 'fa-mobile-screen', label: 'Mobile Prompts' },
    { path: '/mobile', icon: 'fa-mobile-screen-button', label: 'Mobile Dashboard' },
    { path: '/media', icon: 'fa-images', label: 'Media' },
    { path: '/articles', icon: 'fa-newspaper', label: 'Articles' },
    { path: '/categories', icon: 'fa-folder-tree', label: 'Categories' },
    { path: '/products', icon: 'fa-box', label: 'Products' },
    { path: '/affiliate-programs', icon: 'fa-handshake', label: 'Affiliate Programs' },
    { path: '/affiliate-links', icon: 'fa-link', label: 'Affiliate Links' },
    { path: '/ads', icon: 'fa-rectangle-ad', label: 'Affiliate Ads' },
    { path: '/analytics', icon: 'fa-chart-line', label: 'Analytics' },
    { path: '/conversions', icon: 'fa-bullseye', label: 'Conversions' },
    { path: '/revenue', icon: 'fa-yen-sign', label: 'Revenue' },
    { path: '/seo', icon: 'fa-magnifying-glass-chart', label: 'SEO' },
    { path: '/ai', icon: 'fa-robot', label: 'AI' },
    { path: '/recommendations', icon: 'fa-lightbulb', label: 'AI Recommendations' },
    { path: '/experiments', icon: 'fa-flask', label: 'Experiments (A/B)' },
    { path: '/improvements', icon: 'fa-clock-rotate-left', label: 'Improvement History' },
    { path: '/calendar', icon: 'fa-calendar-days', label: 'Content Calendar' },
    { path: '/settings', icon: 'fa-gear', label: 'Settings' }
  ];

  App.layout = function (content, { title = '', actions = '', full = false, siteSelector = true } = {}) {
    const cur = state.route.split('/')[1] || '';
    const siteOpts = state.sites.map(s => `<option value="${s.id}" ${s.id === state.currentSiteId ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
    return `
    <div class="flex h-full">
      <aside class="admin-sidebar w-60 bg-slate-900 text-slate-200 flex flex-col shrink-0" id="sidebar">
        <div class="px-4 py-4 border-b border-slate-800 flex items-center justify-between">
          <div><div class="font-bold text-white text-sm leading-tight"><i class="fas fa-robot text-blue-400"></i> AI Affiliate</div><div class="text-[10px] text-slate-400">Platform Admin</div></div>
          <button class="md:hidden text-slate-400" id="sb-close"><i class="fas fa-times"></i></button>
        </div>
        <nav class="flex-1 overflow-y-auto p-2 space-y-0.5">${MENU.map(m => `<a href="#${m.path}" class="nav-link ${('/' + cur) === m.path || (m.path === '/' && cur === '') ? 'active' : ''}"><i class="fas ${m.icon}"></i>${m.label}</a>`).join('')}</nav>
        <div class="p-3 border-t border-slate-800 text-xs">
          <div class="flex items-center justify-between"><span class="truncate">${esc(state.user?.name)} ${badge(state.user?.role, 'blue')}</span><button class="btn btn-ghost btn-sm text-slate-300" id="logout-btn" title="ログアウト"><i class="fas fa-right-from-bracket"></i></button></div>
          ${state.user?.must_change_password ? `<a href="#/settings" class="block mt-2 text-[11px] text-amber-300"><i class="fas fa-triangle-exclamation"></i> パスワード変更を推奨</a>` : ''}
          <div class="mt-2 flex items-center gap-2"><span class="status-dot ${state.aiStatus === 'CONNECTED' ? 'bg-green-400' : state.aiStatus ? 'bg-red-400' : 'bg-slate-500'}"></span><span class="text-slate-400">Ollama ${state.aiStatus || '...'}</span></div>
        </div>
      </aside>
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 px-4 shrink-0">
          <button class="md:hidden btn btn-ghost btn-sm" id="sb-open"><i class="fas fa-bars"></i></button>
          <h1 class="font-bold text-lg truncate">${title}</h1>
          <div class="ml-auto flex items-center gap-2">
            ${siteSelector && state.sites.length ? `<select class="select !w-auto !min-h-0 !py-1.5 text-sm" id="site-sel" title="対象サイト">${siteOpts}</select>` : ''}
            ${actions}
            <button class="btn btn-ghost btn-sm" id="theme-btn" title="テーマ切替"><i class="fas ${state.theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i></button>
          </div>
        </header>
        <main class="flex-1 overflow-auto ${full ? '' : 'p-4 md:p-6'}" id="main">${content}</main>
      </div>
    </div>`;
  };
  App.mount = function (app, html, opts) {
    app.innerHTML = App.layout(html, opts);
    app.querySelector('#logout-btn').onclick = async () => { await post('/api/auth/logout'); state.user = null; state.csrf = null; toast('ログアウトしました', 'info'); navigate('/login'); };
    app.querySelector('#theme-btn').onclick = () => { setTheme(state.theme === 'dark' ? 'light' : 'dark'); render(); };
    const sel = app.querySelector('#site-sel'); if (sel) sel.onchange = () => { setSite(sel.value); render(); };
    const sb = app.querySelector('#sidebar'); app.querySelector('#sb-open')?.addEventListener('click', () => sb.classList.add('sidebar-mobile-open')); app.querySelector('#sb-close')?.addEventListener('click', () => sb.classList.remove('sidebar-mobile-open'));
    return app.querySelector('#main');
  };
  App.site = () => state.sites.find(s => s.id === state.currentSiteId);
  App.needSite = (main) => { if (!App.site()) { main.innerHTML = `<div class="card text-center py-10"><p class="mb-3">サイトがありません。まずサイトを作成してください。</p><a href="#/sites" class="btn btn-primary">Sitesへ</a></div>`; return false; } return true; };

  // ---- Login ----
  route('/login', async (app) => {
    if (state.user) { navigate('/'); return; }
    app.innerHTML = `<div class="min-h-full flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-blue-900">
      <form id="login-form" class="card w-full max-w-sm space-y-4" autocomplete="on">
        <div class="text-center"><i class="fas fa-robot text-4xl text-blue-600"></i><h1 class="text-xl font-bold mt-2">管理者ログイン</h1><p class="text-xs text-slate-500">AI Affiliate Platform</p></div>
        <div><label class="label" for="login-email">メールアドレス</label><input id="login-email" class="input" type="email" name="email" required autocomplete="username" maxlength="200"></div>
        <div><label class="label" for="login-password">パスワード</label><input id="login-password" class="input" type="password" name="password" required autocomplete="current-password" maxlength="200"></div>
        <button class="btn btn-primary w-full justify-center" type="submit"><i class="fas fa-right-to-bracket"></i> ログイン</button>
        <p id="login-err" class="text-sm text-red-600 hidden" role="alert"></p>
        <p class="text-[11px] text-slate-500">パスワードを忘れた場合は、システム管理者に連絡してください。</p>
      </form></div>`;
    app.querySelector('#login-form').onsubmit = async (e) => {
      e.preventDefault(); const f = e.target; const err = app.querySelector('#login-err');
      const email = f.email.value, password = f.password.value; f.password.value = '';
      try { const r = await post('/api/auth/login', { email, password }); state.user = r.user; state.csrf = r.csrf; toast(`ようこそ ${r.user.name} さん`, 'success'); await loadSites();
        if (r.user.must_change_password) { toast('初期パスワードを使用しています。安全のため新しいパスワードを設定してください。', 'warn', 8000); navigate('/settings'); } else navigate('/'); }
      catch (ex) { err.textContent = ex.message; err.classList.remove('hidden'); }
    };
  });

  // ---- Boot ----
  (async () => {
    try {
      const me = await get('/api/auth/me');
      state.config = me.config;
      if (me.authenticated) { state.user = me.user; state.csrf = me.csrf; await loadSites(); }
    } catch (e) { console.error(e); }
    await render();
    if (state.user) get('/api/ai/status').then(s => { state.aiStatus = s.status; const dot = document.querySelector('#sidebar .status-dot'); if (dot) { dot.className = `status-dot ${s.status === 'CONNECTED' ? 'bg-green-400' : 'bg-red-400'}`; dot.nextElementSibling.textContent = `Ollama ${s.status}`; } }).catch(() => {});
  })();
})();
