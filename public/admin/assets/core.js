// Core: API client, router, UI helpers, state
window.App = (() => {
  const state = { user: null, csrf: null, config: null, route: '', params: {}, theme: localStorage.getItem('aap_theme') || 'light', sites: [], currentSiteId: Number(localStorage.getItem('aap_site')) || null };

  async function api(method, url, body, opts = {}) {
    const headers = {};
    if (state.csrf) headers['X-CSRF-Token'] = state.csrf;
    let payload;
    if (body instanceof FormData) payload = body; else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
    const res = await fetch(url, { method, headers, body: payload, credentials: 'same-origin' });
    const ct = res.headers.get('content-type') || '';
    const data = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
      if (res.status === 401 && !opts.silent) { state.user = null; navigate('/login'); }
      const err = new Error(data?.message || data?.error || `HTTP ${res.status}`); err.status = res.status; err.data = data; throw err;
    }
    return data;
  }
  const get = (u) => api('GET', u), post = (u, b) => api('POST', u, b), put = (u, b) => api('PUT', u, b), del = (u) => api('DELETE', u);

  // ---- helpers ----
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (n, d = 0) => Number(n || 0).toLocaleString('ja-JP', { maximumFractionDigits: d });
  const yen = (n) => '¥' + fmt(n);
  const pct = (n) => fmt(n, 2) + '%';
  const dt = (s) => s ? String(s).replace('T', ' ').slice(0, 16) : '-';
  const h = (strings, ...vals) => strings.reduce((a, s, i) => a + s + (vals[i] ?? ''), '');

  function toast(msg, type = 'info', ms = 3500) {
    const el = document.createElement('div'); el.className = `toast toast-${type}`; el.textContent = msg;
    document.getElementById('toast-container').appendChild(el); setTimeout(() => el.remove(), ms);
  }
  function modal({ title, body, footer, size = '', onMount }) {
    const root = document.getElementById('modal-root');
    root.innerHTML = `<div class="modal-bg" id="modal-bg"><div class="modal ${size}" role="dialog" aria-modal="true"><div class="modal-h"><span>${title}</span><button class="btn btn-ghost btn-sm" id="modal-x"><i class="fas fa-times"></i></button></div><div class="modal-b">${body}</div>${footer ? `<div class="modal-f">${footer}</div>` : ''}</div></div>`;
    const close = () => { root.innerHTML = ''; };
    root.querySelector('#modal-x').onclick = close;
    root.querySelector('#modal-bg').addEventListener('click', (e) => { if (e.target.id === 'modal-bg') close(); });
    if (onMount) onMount(root, close);
    return close;
  }
  function confirm(msg, { danger = false } = {}) {
    return new Promise((resolve) => {
      modal({ title: '確認', body: `<p class="text-sm">${esc(msg)}</p>`, footer: `<button class="btn btn-secondary" id="c-no">キャンセル</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="c-yes">OK</button>`,
        onMount: (root, close) => { root.querySelector('#c-no').onclick = () => { close(); resolve(false); }; root.querySelector('#c-yes').onclick = () => { close(); resolve(true); }; } });
    });
  }
  function prompt(title, fields, { submitLabel = '保存', size = '' } = {}) {
    // fields: [{name,label,type:'text'|'textarea'|'select'|'number'|'checkbox'|'json',value,options,required,help}]
    return new Promise((resolve) => {
      const body = `<form id="pf" class="space-y-3">${fields.map(f => {
        const v = f.value ?? '';
        if (f.type === 'textarea' || f.type === 'json') return `<div><label class="label">${esc(f.label)}</label><textarea class="textarea" name="${f.name}" ${f.rows ? `style="min-height:${f.rows * 1.4}rem"` : ''}>${esc(f.type === 'json' ? JSON.stringify(v, null, 2) : v)}</textarea>${f.help ? `<p class="text-xs text-slate-500 mt-1">${f.help}</p>` : ''}</div>`;
        if (f.type === 'select') return `<div><label class="label">${esc(f.label)}</label><select class="select" name="${f.name}">${(f.options || []).map(o => `<option value="${esc(o.value)}" ${String(o.value) === String(v) ? 'selected' : ''}>${esc(o.label)}</option>`).join('')}</select></div>`;
        if (f.type === 'checkbox') return `<label class="flex items-center gap-2 text-sm"><input type="checkbox" name="${f.name}" ${v ? 'checked' : ''}> ${esc(f.label)}</label>`;
        if (f.type === 'static') return `<div class="text-sm">${f.value}</div>`;
        return `<div><label class="label">${esc(f.label)}</label><input class="input" type="${f.type || 'text'}" name="${f.name}" value="${esc(v)}" ${f.required ? 'required' : ''} ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''}>${f.help ? `<p class="text-xs text-slate-500 mt-1">${f.help}</p>` : ''}</div>`;
      }).join('')}</form>`;
      modal({ title, body, size, footer: `<button class="btn btn-secondary" id="p-cancel">キャンセル</button><button class="btn btn-primary" id="p-ok">${submitLabel}</button>`,
        onMount: (root, close) => {
          root.querySelector('#p-cancel').onclick = () => { close(); resolve(null); };
          const submit = () => {
            const form = root.querySelector('#pf'); if (!form.reportValidity()) return;
            const out = {};
            for (const f of fields) {
              if (f.type === 'static') continue;
              const el = form.elements[f.name];
              if (f.type === 'checkbox') out[f.name] = el.checked;
              else if (f.type === 'number') out[f.name] = el.value === '' ? null : Number(el.value);
              else if (f.type === 'json') { try { out[f.name] = el.value.trim() ? JSON.parse(el.value) : {}; } catch (e) { toast(`${f.label}: JSONが不正です`, 'error'); return; } }
              else out[f.name] = el.value;
            }
            close(); resolve(out);
          };
          root.querySelector('#p-ok').onclick = submit;
          root.querySelector('#pf').addEventListener('submit', (e) => { e.preventDefault(); submit(); });
        } });
    });
  }
  function jsonView(obj) { return `<pre class="json">${esc(JSON.stringify(obj, null, 2))}</pre>`; }
  function badge(text, color = 'gray') { return `<span class="badge badge-${color}">${esc(text)}</span>`; }
  const statusColor = (s) => ({ published: 'green', draft: 'gray', archived: 'red', ACTIVE: 'green', INACTIVE: 'gray', pending: 'yellow', approved: 'green', rejected: 'red', hold: 'blue', applied: 'purple', running: 'green', completed: 'blue', paused: 'yellow', PASS: 'green', WARNING: 'yellow', ERROR: 'red', CONNECTED: 'green', high: 'red', medium: 'yellow', low: 'gray' }[s] || 'gray');
  function spinner(text = '処理中...') { return `<div class="flex items-center gap-2 text-sm text-slate-500"><span class="spinner"></span> ${esc(text)}</div>`; }
  async function withBusy(btn, fn) { const old = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spinner"></span> AI処理中...`; try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = old; } }

  // AI result renderer (data_used, reasoning, possible_causes, suggestions, uncertainty)
  function aiResult(r) {
    if (!r) return '';
    const list = (arr) => Array.isArray(arr) && arr.length ? `<ul class="list-disc pl-5 text-sm space-y-1">${arr.map(x => `<li>${esc(typeof x === 'string' ? x : JSON.stringify(x))}</li>`).join('')}</ul>` : '<p class="text-xs text-slate-500">なし</p>';
    return `<div class="ai-box space-y-3 text-sm">
      ${r.summary ? `<p class="font-semibold">${esc(r.summary)}</p>` : ''}
      ${r.verdict ? `<p class="font-bold text-amber-700">${esc(r.verdict)}</p>` : ''}
      <div><div class="font-semibold text-xs text-purple-700 mb-1"><i class="fas fa-database"></i> 使用データ</div>${list(r.data_used)}</div>
      ${r.reasoning ? `<div><div class="font-semibold text-xs text-purple-700 mb-1"><i class="fas fa-brain"></i> 分析理由</div><p>${esc(r.reasoning)}</p></div>` : ''}
      <div><div class="font-semibold text-xs text-purple-700 mb-1"><i class="fas fa-search"></i> 原因候補（断定ではありません）</div>${list(r.possible_causes)}</div>
      ${Array.isArray(r.suggestions) && r.suggestions.length ? `<div><div class="font-semibold text-xs text-purple-700 mb-1"><i class="fas fa-lightbulb"></i> 改善案</div><div class="space-y-2">${r.suggestions.map(s => `<div class="bg-white/70 dark:bg-slate-800 rounded p-2"><div class="flex gap-2 items-center flex-wrap">${badge(s.category || 'CONTENT', 'blue')}${badge(s.priority || 'medium', statusColor(s.priority))}<strong>${esc(s.title)}</strong></div><p class="text-xs mt-1">${esc(s.description || '')}</p>${s.rationale ? `<p class="text-xs text-slate-500 mt-1">根拠: ${esc(s.rationale)}</p>` : ''}</div>`).join('')}</div></div>` : ''}
      ${r.changes ? `<div><div class="font-semibold text-xs text-purple-700 mb-1">変更案 (${r.changes.length})</div>${jsonView(r.changes)}</div>` : ''}
      <div class="text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/30 rounded p-2"><i class="fas fa-triangle-exclamation"></i> 不確実性: ${esc(r.uncertainty || '記載なし')}</div>
    </div>`;
  }

  // ---- router ----
  const routes = [];
  function route(pattern, handler) { routes.push({ pattern, handler, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '/?$') }); }
  function navigate(path) { location.hash = '#' + path; }
  async function render() {
    const path = location.hash.replace(/^#/, '') || '/';
    const app = document.getElementById('app');
    if (!state.user && path !== '/login') { navigate('/login'); return; }
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) { state.route = path; state.params = m.groups || {}; try { await r.handler(app, state.params); } catch (e) { console.error(e); app.innerHTML = `<div class="p-8"><div class="card text-red-600">エラー: ${esc(e.message)}</div></div>`; } return; }
    }
    app.innerHTML = '<div class="p-8">Not found</div>';
  }
  window.addEventListener('hashchange', render);

  function setTheme(t) { state.theme = t; localStorage.setItem('aap_theme', t); document.documentElement.classList.toggle('dark', t === 'dark'); }
  setTheme(state.theme);

  async function loadSites() { state.sites = await get('/api/sites'); if (!state.currentSiteId && state.sites[0]) state.currentSiteId = state.sites[0].id; if (state.currentSiteId && !state.sites.find(s => s.id === state.currentSiteId)) state.currentSiteId = state.sites[0]?.id || null; return state.sites; }
  function setSite(id) { state.currentSiteId = Number(id) || null; localStorage.setItem('aap_site', state.currentSiteId || ''); }
  const can = (role) => ({ viewer: 1, editor: 2, admin: 3 }[state.user?.role] || 0) >= ({ viewer: 1, editor: 2, admin: 3 }[role]);

  return { state, api, get, post, put, del, esc, fmt, yen, pct, dt, h, toast, modal, confirm, prompt, jsonView, badge, statusColor, spinner, withBusy, aiResult, route, navigate, render, setTheme, loadSites, setSite, can };
})();
