// Site Builder: 3-pane (Components | Canvas | Properties), drag & drop, undo/redo, autosave, versions, device preview
(() => {
  const { state, get, post, put, del, esc, toast, modal, confirm, prompt, jsonView, badge, statusColor, spinner, withBusy, aiResult, route, navigate, render, loadSites, can } = App;

  const PALETTE = [
    ['heading', 'fa-heading', 'Heading'], ['text', 'fa-align-left', 'Text'], ['image', 'fa-image', 'Image'], ['button', 'fa-hand-pointer', 'Button'], ['cta', 'fa-bullhorn', 'CTA'],
    ['affiliate_ad', 'fa-rectangle-ad', 'Affiliate Ad'], ['product', 'fa-box', 'Product'], ['comparison_table', 'fa-table', 'Comparison Table'], ['ranking', 'fa-ranking-star', 'Ranking'],
    ['article', 'fa-newspaper', 'Article'], ['faq', 'fa-circle-question', 'FAQ'], ['search', 'fa-magnifying-glass', 'Search'], ['banner', 'fa-flag', 'Banner'], ['spacer', 'fa-arrows-up-down', 'Spacer'],
    ['divider', 'fa-minus', 'Divider'], ['html', 'fa-code', 'HTML'], ['video', 'fa-video', 'Video']
  ];
  const DEFAULT_PROPS = {
    heading: { text: '見出し', level: 2 }, text: { html: '<p>テキストを入力してください。</p>' }, image: { src: '', alt: '', lazy: true }, button: { text: 'ボタン', url: '#' },
    cta: { title: '今すぐチェック', text: '公式サイトで最新情報を確認', buttonText: '公式サイトへ', url: '#', linkId: null }, affiliate_ad: { adId: null, label: 'PR' }, product: { productId: null, buttonText: '公式サイトへ' },
    comparison_table: { title: '比較表', firstColumn: '項目', columns: ['プランA', 'プランB'], rows: [{ label: '料金', values: ['¥1,000', '¥2,000'] }, { label: 'メモリ', values: ['2GB', '4GB'] }], recommended: 0 },
    ranking: { title: 'おすすめランキング', items: [{ name: '1位', description: '', url: '#' }] }, article: { articleId: null, html: '' }, faq: { title: 'よくある質問', items: [{ q: '質問？', a: '回答' }] },
    search: { placeholder: 'サイト内検索', buttonText: '検索' }, banner: { text: 'キャンペーン実施中', url: '#', background: '#ea580c' }, spacer: {}, divider: {}, html: { html: '<div>Custom HTML</div>' }, video: { youtubeId: '', src: '' }
  };
  const CFG_FIELDS = [['width', 'Width'], ['maxWidth', 'Max Width'], ['height', 'Height'], ['minHeight', 'Min Height'], ['fontSize', 'Font Size'], ['lineHeight', 'Line Height'], ['margin', 'Margin'], ['padding', 'Padding'], ['textAlign', 'Text Align'], ['display', 'Display'], ['position', 'Position'], ['background', 'Background'], ['color', 'Color'], ['borderRadius', 'Border Radius']];

  const B = { pageId: null, siteId: null, data: null, selected: null, device: 'desktop', dirty: false, autosaveTimer: null, lastAutosave: null, dragId: null, ads: [], links: [], products: [], articles: [], media: [] };

  route('/builder', async (app) => { await loadSites(); const s = App.site(); if (s) { const site = await get(`/api/sites/${s.id}`); navigate(`/builder/${s.id}/${site.pages[0]?.id || ''}`); } else { const main = App.mount(app, '', { title: 'Site Builder' }); App.needSite(main); } });
  route('/builder/:siteId', async (app, { siteId }) => { const site = await get(`/api/sites/${siteId}`); navigate(`/builder/${siteId}/${site.pages[0]?.id || ''}`); });

  route('/builder/:siteId/:pageId', async (app, { siteId, pageId }) => {
    B.siteId = Number(siteId); B.pageId = Number(pageId); B.selected = null; B.dirty = false; App.setSite(siteId);
    const [site, ads, links, products, articles, media] = await Promise.all([get(`/api/sites/${siteId}`), get(`/api/affiliate/ads?siteId=${siteId}`), get(`/api/affiliate/links?siteId=${siteId}`), get(`/api/affiliate/products?siteId=${siteId}`), get(`/api/articles?siteId=${siteId}`), get(`/api/media?siteId=${siteId}`)]);
    Object.assign(B, { site, ads, links, products, articles, media });
    const main = App.mount(app, '', { title: `Site Builder`, full: true, siteSelector: false, actions: `<select class="select !w-auto !min-h-0 !py-1.5 text-sm" id="page-sel">${site.pages.map(p => `<option value="${p.id}" ${p.id === B.pageId ? 'selected' : ''}>${esc(p.title)} (/${esc(p.slug)})</option>`).join('')}</select><button class="btn btn-ghost btn-sm" id="add-page" title="ページ追加"><i class="fas fa-plus"></i></button>` });
    main.closest('#app').querySelector('#page-sel').onchange = (e) => navigate(`/builder/${siteId}/${e.target.value}`);
    main.closest('#app').querySelector('#add-page').onclick = async () => { const v = await prompt('ページ追加', [{ name: 'title', label: 'タイトル', required: true }, { name: 'page_type', label: '種類', type: 'select', value: 'page', options: ['page', 'article', 'category'].map(x => ({ value: x, label: x })) }]); if (!v) return; const p = await post(`/api/sites/${siteId}/pages`, v); navigate(`/builder/${siteId}/${p.id}`); };
    await load();
    main.innerHTML = `
      <div class="h-14 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 px-3 overflow-x-auto" id="toolbar">
        ${can('editor') ? `<button class="btn btn-secondary btn-sm" id="undo" title="Undo (Ctrl+Z)"><i class="fas fa-rotate-left"></i> Undo</button><button class="btn btn-secondary btn-sm" id="redo" title="Redo (Ctrl+Y)"><i class="fas fa-rotate-right"></i> Redo</button>` : ''}
        <div class="device-tabs ml-2" style="min-width:260px"><div class="device-tab active" data-d="desktop"><i class="fas fa-desktop"></i> Desktop</div><div class="device-tab" data-d="tablet"><i class="fas fa-tablet-screen-button"></i> Tablet</div><div class="device-tab" data-d="mobile"><i class="fas fa-mobile-screen"></i> Mobile</div></div>
        <span class="text-xs text-slate-500 ml-2" id="save-state"></span>
        <div class="ml-auto flex gap-1 items-center">
          <button class="btn btn-secondary btn-sm" id="qc"><i class="fas fa-clipboard-check"></i> Quality</button>
          ${can('editor') ? `<button class="btn btn-secondary btn-sm" id="ai-mobile"><i class="fas fa-robot"></i> AI Mobile</button>` : ''}
          <button class="btn btn-secondary btn-sm" id="versions"><i class="fas fa-clock-rotate-left"></i> Versions</button>
          <button class="btn btn-secondary btn-sm" id="preview"><i class="fas fa-eye"></i> Preview</button>
          ${can('editor') ? `<button class="btn btn-primary btn-sm" id="save"><i class="fas fa-save"></i> Save</button><button class="btn btn-success btn-sm" id="publish"><i class="fas fa-upload"></i> Publish</button>` : ''}
        </div>
      </div>
      <div class="builder">
        <div class="builder-left p-3"><h3 class="text-xs font-bold uppercase text-slate-500 mb-2">Components</h3><p class="text-[10px] text-slate-400 mb-2">ドラッグしてキャンバスへ、またはクリックで末尾に追加</p>${PALETTE.map(([t, i, l]) => `<div class="palette-item" draggable="true" data-type="${t}"><i class="fas ${i}"></i>${l}</div>`).join('')}</div>
        <div class="builder-center"><div class="canvas-frame" id="canvas-frame"><div class="canvas-list" id="canvas"></div></div></div>
        <div class="builder-right" id="props"></div>
      </div>`;
    bindToolbar(main); renderCanvas(); renderProps(); updateSaveState();
    document.onkeydown = (e) => { if (!location.hash.startsWith('#/builder/')) return; if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); doUndo(); } if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); doRedo(); } if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); doSave(); } };
  });

  async function load() { B.data = await get(`/api/builder/pages/${B.pageId}`); }
  function comps() { const list = [...B.data.components]; const key = B.device === 'desktop' ? null : B.device === 'tablet' ? 'sort_order_tablet' : 'sort_order_mobile'; if (key) list.sort((a, b) => ((a[key] ?? a.sort_order) - (b[key] ?? b.sort_order)) || a.sort_order - b.sort_order); return list; }
  function cfg(c) { return c[B.device + '_config'] || {}; }
  function markDirty() { B.dirty = true; updateSaveState(); clearTimeout(B.autosaveTimer); B.autosaveTimer = setTimeout(autosave, 3000); }
  async function autosave() { if (!B.dirty || !can('editor')) return; try { const r = await post(`/api/builder/pages/${B.pageId}/autosave`); B.dirty = false; B.lastAutosave = new Date(); updateSaveState(`Autosaved v${r.version} (未公開)`); } catch (e) { updateSaveState('Autosave失敗: ' + e.message); } }
  function updateSaveState(msg) { const el = document.getElementById('save-state'); if (!el) return; const h = B.data?.history || {}; document.getElementById('undo') && (document.getElementById('undo').disabled = !h.canUndo); document.getElementById('redo') && (document.getElementById('redo').disabled = !h.canRedo); el.innerHTML = msg ? esc(msg) : B.dirty ? '<i class="fas fa-circle text-amber-500 text-[8px]"></i> 未保存（3秒後に自動保存）' : `${B.data.lastVersion ? `v${B.data.lastVersion.version} ${B.data.lastVersion.kind}` : ''} ${B.data.lastPublish ? `· 公開 v${B.data.lastPublish.version}` : '· <span class="text-amber-600">未公開</span>'}`; }

  function summary(c) {
    const p = c.props || {};
    switch (c.type) {
      case 'heading': return `<${'h' + (p.level || 2)} class="font-bold ${p.level == 1 ? 'text-xl' : 'text-lg'}">${esc(p.text)}</${'h' + (p.level || 2)}>`;
      case 'text': return `<div class="text-sm line-clamp-3 opacity-80">${esc(String(p.html || '').replace(/<[^>]+>/g, ' ')).slice(0, 200)}</div>`;
      case 'image': return p.src ? `<img src="${esc(p.src)}" alt="${esc(p.alt)}" class="max-h-32 rounded" loading="lazy">` : '<div class="bg-slate-100 text-slate-400 text-xs p-4 text-center rounded"><i class="fas fa-image"></i> 画像未設定</div>';
      case 'button': return `<span class="inline-block bg-blue-600 text-white text-sm px-3 py-1.5 rounded">${esc(p.text)}</span>`;
      case 'cta': return `<div class="border-2 border-amber-400 rounded p-2 text-center bg-amber-50"><div class="font-bold text-sm">${esc(p.title)}</div><div class="text-xs">${esc(p.text)}</div><span class="inline-block bg-orange-500 text-white text-xs px-3 py-1 rounded mt-1">${esc(p.buttonText)}</span>${p.linkId ? `<div class="text-[10px] text-slate-500">link #${p.linkId}</div>` : ''}</div>`;
      case 'affiliate_ad': { const ad = B.ads.find(a => a.id === Number(p.adId)); return `<div class="border border-dashed border-green-400 rounded p-2 bg-green-50 text-xs"><i class="fas fa-rectangle-ad"></i> ${ad ? `${esc(ad.name)} (${ad.width || '?'}×${ad.height || '?'}) ${ad.integrity_ok ? '🔒' : '⚠'}` : '<span class="text-red-500">広告未選択</span>'}</div>`; }
      case 'product': { const pr = B.products.find(x => x.id === Number(p.productId)); return `<div class="text-sm"><i class="fas fa-box text-pink-500"></i> ${pr ? esc(pr.name) + ' ' + esc(pr.price || '') : '<span class="text-red-500">商品未選択</span>'}</div>`; }
      case 'comparison_table': return `<div class="text-xs"><b>${esc(p.title)}</b> · ${(p.columns || []).length}列 × ${(p.rows || []).length}行 · mobile: ${cfg(c).layout || B.site.mobile_settings?.table_layout || 'scroll'}</div>`;
      case 'ranking': return `<div class="text-xs"><b>${esc(p.title)}</b> · ${(p.items || []).length}件</div>`;
      case 'article': { const a = B.articles.find(x => x.id === Number(p.articleId)); return `<div class="text-xs"><i class="fas fa-newspaper"></i> ${a ? esc(a.title) : (p.html ? 'inline HTML' : '<span class="text-red-500">記事未選択</span>')}</div>`; }
      case 'faq': return `<div class="text-xs"><b>${esc(p.title)}</b> · ${(p.items || []).length}問</div>`;
      case 'search': return `<div class="flex gap-1"><span class="border rounded px-2 py-1 text-xs flex-1 text-slate-400">${esc(p.placeholder)}</span><span class="bg-blue-600 text-white text-xs px-2 py-1 rounded">${esc(p.buttonText)}</span></div>`;
      case 'banner': return `<div class="rounded p-2 text-white text-sm text-center" style="background:${esc(p.background)}">${esc(p.text)}</div>`;
      case 'spacer': return '<div class="h-4 bg-slate-100 rounded text-[10px] text-center text-slate-400">spacer</div>';
      case 'divider': return '<hr class="border-slate-300">';
      case 'html': return `<code class="text-[10px] text-slate-500 line-clamp-2">${esc(p.html)}</code>`;
      case 'video': return `<div class="text-xs"><i class="fas fa-video"></i> ${esc(p.youtubeId ? 'YouTube: ' + p.youtubeId : p.src || '未設定')}</div>`;
      default: return esc(c.type);
    }
  }

  function renderCanvas() {
    const frame = document.getElementById('canvas-frame'); const canvas = document.getElementById('canvas'); if (!canvas) return;
    frame.style.width = B.device === 'mobile' ? '390px' : B.device === 'tablet' ? '820px' : '100%';
    const list = comps();
    canvas.innerHTML = list.map(c => { const cf = cfg(c); const hidden = cf.visibility === 'hidden' || cf.display === 'none'; return `<div class="canvas-item ${B.selected === c.id ? 'selected' : ''} ${hidden ? 'hidden-dev' : ''}" data-id="${c.id}" draggable="${can('editor')}"><div class="ci-head"><span><span class="handle"><i class="fas fa-grip-vertical"></i></span> ${badge(c.type, 'gray')} #${c.id} ${hidden ? badge('hidden on ' + B.device, 'red') : ''} ${cf.width ? `<small>w:${esc(cf.width)}</small>` : ''}</span>${can('editor') ? `<span class="flex gap-1"><button class="btn btn-ghost btn-sm !min-h-0 !py-0 mv" data-dir="-1" title="上へ"><i class="fas fa-chevron-up"></i></button><button class="btn btn-ghost btn-sm !min-h-0 !py-0 mv" data-dir="1" title="下へ"><i class="fas fa-chevron-down"></i></button><button class="btn btn-ghost btn-sm !min-h-0 !py-0 dup" title="複製"><i class="fas fa-copy"></i></button><button class="btn btn-ghost btn-sm !min-h-0 !py-0 text-red-600 rm" title="削除"><i class="fas fa-trash"></i></button></span>` : ''}</div><div class="ci-body">${summary(c)}</div></div>`; }).join('') + `<div class="canvas-drop-end" id="drop-end">${list.length ? 'ここにドロップして末尾へ追加' : 'コンポーネントをここへドラッグ'}</div>`;
    canvas.querySelectorAll('.canvas-item').forEach(el => {
      const id = Number(el.dataset.id);
      el.onclick = (e) => { if (e.target.closest('button')) return; B.selected = id; renderCanvas(); renderProps(); };
      el.querySelectorAll('.mv').forEach(b => b.onclick = async (e) => { e.stopPropagation(); const order = list.map(x => x.id); const i = order.indexOf(id); const j = i + Number(b.dataset.dir); if (j < 0 || j >= order.length) return; [order[i], order[j]] = [order[j], order[i]]; await reorder(order); });
      el.querySelector('.rm')?.addEventListener('click', async (e) => { e.stopPropagation(); await mutateApi('DELETE', `/api/builder/pages/${B.pageId}/components/${id}`); if (B.selected === id) B.selected = null; });
      el.querySelector('.dup')?.addEventListener('click', async (e) => { e.stopPropagation(); const c = B.data.components.find(x => x.id === id); const idx = list.findIndex(x => x.id === id); await mutateApi('POST', `/api/builder/pages/${B.pageId}/components`, { type: c.type, props: c.props, desktop_config: c.desktop_config, tablet_config: c.tablet_config, mobile_config: c.mobile_config, position: idx + 1 }); });
      // Drag & drop reorder
      el.addEventListener('dragstart', (e) => { B.dragId = id; el.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'move:' + id); });
      el.addEventListener('dragend', () => { el.classList.remove('dragging'); canvas.querySelectorAll('.drop-before,.drop-after').forEach(x => x.classList.remove('drop-before', 'drop-after')); });
      el.addEventListener('dragover', (e) => { e.preventDefault(); const r = el.getBoundingClientRect(); const before = e.clientY < r.top + r.height / 2; el.classList.toggle('drop-before', before); el.classList.toggle('drop-after', !before); });
      el.addEventListener('dragleave', () => el.classList.remove('drop-before', 'drop-after'));
      el.addEventListener('drop', async (e) => { e.preventDefault(); e.stopPropagation(); const r = el.getBoundingClientRect(); const before = e.clientY < r.top + r.height / 2; const data = e.dataTransfer.getData('text/plain'); el.classList.remove('drop-before', 'drop-after'); const order = list.map(x => x.id); let idx = order.indexOf(id) + (before ? 0 : 1);
        if (data.startsWith('new:')) { await addComponent(data.slice(4), idx); }
        else if (B.dragId && B.dragId !== id) { const from = order.indexOf(B.dragId); order.splice(from, 1); if (from < idx) idx--; order.splice(idx, 0, B.dragId); await reorder(order); } B.dragId = null; });
    });
    const end = canvas.querySelector('#drop-end');
    end.addEventListener('dragover', (e) => { e.preventDefault(); end.classList.add('over'); }); end.addEventListener('dragleave', () => end.classList.remove('over'));
    end.addEventListener('drop', async (e) => { e.preventDefault(); end.classList.remove('over'); const data = e.dataTransfer.getData('text/plain'); if (data.startsWith('new:')) await addComponent(data.slice(4)); else if (B.dragId) { const order = list.map(x => x.id).filter(x => x !== B.dragId); order.push(B.dragId); await reorder(order); } B.dragId = null; });
    document.querySelectorAll('.palette-item').forEach(p => { p.ondragstart = (e) => { e.dataTransfer.setData('text/plain', 'new:' + p.dataset.type); e.dataTransfer.effectAllowed = 'copy'; }; p.onclick = () => can('editor') && addComponent(p.dataset.type); });
  }

  async function addComponent(type, position) { await mutateApi('POST', `/api/builder/pages/${B.pageId}/components`, { type, props: JSON.parse(JSON.stringify(DEFAULT_PROPS[type] || {})), position, desktop_config: type === 'cta' ? { width: '320px' } : {}, tablet_config: type === 'cta' ? { width: '80%' } : {}, mobile_config: type === 'cta' ? { width: '100%' } : {} }, (r) => { B.selected = r.component?.id; }); }
  async function reorder(order) { await mutateApi('POST', `/api/builder/pages/${B.pageId}/reorder`, { order, device: B.device }); }
  async function mutateApi(method, url, body, after) {
    if (!can('editor')) return toast('編集権限がありません', 'warn');
    try { const r = await App.api(method, url, body); await load(); if (after) after(r); renderCanvas(); renderProps(); markDirty(); } catch (e) { toast(e.message, 'error'); }
  }
  async function doUndo() { try { const r = await post(`/api/builder/pages/${B.pageId}/undo`); if (!r.ok) return toast(r.message, 'info'); await load(); renderCanvas(); renderProps(); markDirty(); toast(`Undo: ${r.action}`, 'info', 1500); } catch (e) { toast(e.message, 'error'); } }
  async function doRedo() { try { const r = await post(`/api/builder/pages/${B.pageId}/redo`); if (!r.ok) return toast(r.message, 'info'); await load(); renderCanvas(); renderProps(); markDirty(); toast(`Redo: ${r.action}`, 'info', 1500); } catch (e) { toast(e.message, 'error'); } }
  async function doSave() { if (!can('editor')) return; clearTimeout(B.autosaveTimer); try { const r = await post(`/api/builder/pages/${B.pageId}/save`, { note: 'Manual save' }); B.dirty = false; await load(); updateSaveState(); toast(`保存しました (v${r.version}) — 公開はされていません`, 'success'); } catch (e) { toast(e.message, 'error'); } }

  function bindToolbar(main) {
    main.querySelector('#undo')?.addEventListener('click', doUndo); main.querySelector('#redo')?.addEventListener('click', doRedo); main.querySelector('#save')?.addEventListener('click', doSave);
    main.querySelectorAll('.device-tab').forEach(t => t.onclick = () => { main.querySelectorAll('.device-tab').forEach(x => x.classList.remove('active')); t.classList.add('active'); B.device = t.dataset.d; renderCanvas(); renderProps(); });
    main.querySelector('#publish')?.addEventListener('click', async () => { if (!await confirm('このページを公開しますか？現在の下書きが公開バージョンになります。')) return; try { await post(`/api/builder/pages/${B.pageId}/publish`); await loadSites(); await load(); updateSaveState(); toast(`公開しました → /s/${B.site.slug}/${B.data.page.slug === 'home' ? '' : B.data.page.slug}`, 'success', 6000); } catch (e) { toast(e.message, 'error'); } });
    main.querySelector('#preview').onclick = () => App.previewModal(B.pageId, { title: `Preview: ${B.data.page.title}（下書き）` });
    main.querySelector('#qc').onclick = async () => { const r = await get(`/api/ai/mobile/quality-check/${B.pageId}`); modal({ title: `Mobile Quality Check ${badge(r.status, statusColor(r.status))}`, size: 'modal-lg', body: `<p class="text-xs text-slate-500 mb-2">対象幅: ${r.viewports.join(' / ')}px · ルール: 最小フォント ${r.rules.minFontPx}px, 行間 ${r.rules.minLineHeight}, タップ ${r.rules.minTapPx}px</p><div class="flex flex-wrap gap-1 mb-3">${Object.entries(r.summary).map(([k, v]) => `<span class="badge badge-${statusColor(v)}">${k}: ${v}</span>`).join('')}</div>${r.issues.length ? `<table class="table"><thead><tr><th>Level</th><th>Check</th><th>Message</th><th>Component</th><th>Viewport</th></tr></thead><tbody>${r.issues.map(i => `<tr><td>${badge(i.level, statusColor(i.level))}</td><td><code>${i.check}</code></td><td>${esc(i.message)}</td><td>${i.componentId ? `<button class="btn btn-sm btn-ghost sel" data-id="${i.componentId}">#${i.componentId}</button>` : '-'}</td><td>${i.viewport ? i.viewport + 'px' : '-'}</td></tr>`).join('')}</tbody></table>` : '<p class="text-green-600 font-bold">PASS — 問題は見つかりませんでした</p>'}`, onMount: (root, close) => root.querySelectorAll('.sel').forEach(b => b.onclick = () => { B.selected = Number(b.dataset.id); B.device = 'mobile'; main.querySelectorAll('.device-tab').forEach(x => x.classList.toggle('active', x.dataset.d === 'mobile')); close(); renderCanvas(); renderProps(); }) }); };
    main.querySelector('#ai-mobile')?.addEventListener('click', async () => {
      const prompts = await get('/api/mobile-prompts');
      const v = await prompt('AI Mobile Optimization', [{ name: 'static', type: 'static', value: `<p class="text-xs">Ollamaへ「サイト構造・CSS・コンポーネント・Mobile Prompt・現在のMobile設定・Quality Check結果」を渡し、改善案を生成します。改善案は <b>pending</b> として保存され、Preview → Approve → Apply の手順でのみ適用されます（自動適用・自動公開なし）。</p>` }, { name: 'promptId', label: 'Mobile Prompt', type: 'select', value: B.site.mobile_prompt_id, options: prompts.filter(p => p.status === 'ACTIVE').map(p => ({ value: p.id, label: p.name })) }], { submitLabel: 'AIで最適化案を生成' }); if (!v) return;
      const c = modal({ title: 'AI Mobile Optimization', body: spinner('Ollamaで分析中（1〜3分かかる場合があります）...') });
      try { const r = await post('/api/ai/mobile/optimize', { pageId: B.pageId, promptId: Number(v.promptId) }); c();
        modal({ title: `AI Mobile Optimization 結果 (改善案 #${r.recommendationId}, ${r.changes.length} changes)`, size: 'modal-lg', body: `${aiResult({ ...r.result, changes: r.changes })}${r.cssSuggestions.length ? `<div class="mt-2"><b class="text-xs">CSS提案</b><ul class="text-xs list-disc pl-4">${r.cssSuggestions.map(s => `<li><code>${esc(s)}</code></li>`).join('')}</ul></div>` : ''}<p class="text-xs text-slate-500 mt-2">${r.model} · ${r.durationMs}ms · 次: ${r.next}</p>`, footer: `<button class="btn btn-secondary" id="pv"><i class="fas fa-eye"></i> Preview（未適用）</button><button class="btn btn-success" id="ap"><i class="fas fa-check"></i> Approve</button><button class="btn btn-danger" id="rj">Reject</button>`,
          onMount: (root, close) => { root.querySelector('#pv').onclick = () => App.previewModal(B.pageId, { recommendationId: r.recommendationId, title: 'AI Mobile最適化 適用後プレビュー（未適用）' }); root.querySelector('#rj').onclick = async () => { await post(`/api/ai/recommendations/${r.recommendationId}/review`, { decision: 'reject' }); toast('却下しました', 'info'); close(); }; root.querySelector('#ap').onclick = async () => { await post(`/api/ai/recommendations/${r.recommendationId}/review`, { decision: 'approve' }); close(); if (await confirm('承認しました。今すぐ下書きへ適用しますか？（公開はされません）')) { const a = await post(`/api/ai/recommendations/${r.recommendationId}/apply`); toast(`${a.appliedCount}件を適用しました。Previewで確認してからPublishしてください。`, 'success', 6000); await load(); renderCanvas(); renderProps(); markDirty(); } }; } });
      } catch (e) { c(); toast(e.message, 'error'); }
    });
    main.querySelector('#versions').onclick = async () => { const vs = await get(`/api/builder/pages/${B.pageId}/versions`); modal({ title: 'バージョン履歴', size: 'modal-lg', body: `<p class="text-xs text-slate-500 mb-2">manual=手動保存, autosave=自動保存(未公開), publish=公開, rollback=復元, ai_apply=AI改善案適用</p><table class="table"><thead><tr><th>Ver</th><th>Kind</th><th>Note</th><th>User</th><th>日時</th><th></th></tr></thead><tbody>${vs.map(v => `<tr><td>v${v.version}</td><td>${badge(v.kind, v.kind === 'publish' ? 'green' : v.kind === 'autosave' ? 'gray' : 'blue')}</td><td>${esc(v.note || '')}</td><td class="text-xs">${esc(v.created_by_email || '')}</td><td>${App.dt(v.created_at)}</td><td class="whitespace-nowrap"><button class="btn btn-sm btn-ghost pv" data-id="${v.id}"><i class="fas fa-eye"></i></button>${can('editor') ? `<button class="btn btn-sm btn-secondary rb" data-id="${v.id}" data-v="${v.version}">Rollback</button>` : ''}</td></tr>`).join('')}</tbody></table>`, onMount: (root, close) => { root.querySelectorAll('.pv').forEach(b => b.onclick = () => App.previewModal(B.pageId, { versionId: b.dataset.id, title: `Version preview` })); root.querySelectorAll('.rb').forEach(b => b.onclick = async () => { if (!await confirm(`v${b.dataset.v} の状態へ戻します（Undo可能、公開はされません）`)) return; await post(`/api/builder/pages/${B.pageId}/versions/${b.dataset.id}/rollback`); close(); await load(); renderCanvas(); renderProps(); markDirty(); toast(`v${b.dataset.v} へロールバックしました`, 'success'); }); } }); };
  }

  // ---- Properties panel ----
  function renderProps() {
    const el = document.getElementById('props'); if (!el) return;
    const c = B.data.components.find(x => x.id === B.selected);
    if (!c) { el.innerHTML = `<div class="p-3"><h3 class="text-xs font-bold uppercase text-slate-500 mb-2">Page</h3><div class="text-sm"><b>${esc(B.data.page.title)}</b><br><small class="text-slate-500">/${esc(B.data.page.slug)} · ${B.data.page.page_type} · ${badge(B.data.page.status, statusColor(B.data.page.status))}</small></div><div class="text-xs mt-2 text-slate-500">SEO title: ${esc(B.data.page.seo_title || '(auto)')}<br>Meta: ${esc((B.data.page.meta_description || '(なし)').slice(0, 80))}</div>${can('editor') ? `<button class="btn btn-secondary btn-sm mt-2" id="page-seo"><i class="fas fa-magnifying-glass-chart"></i> SEO設定</button>` : ''}<p class="text-xs text-slate-400 mt-4">コンポーネントをクリックすると、ここにプロパティと Desktop / Tablet / Mobile 別の設定が表示されます。</p></div>`; el.querySelector('#page-seo')?.addEventListener('click', () => App.pageSeoDialog(B.siteId, B.data.page)); return; }
    const p = c.props || {}; const cf = cfg(c); const ro = !can('editor') ? 'disabled' : '';
    const sel = (name, val, opts, lbl) => `<div><label class="label">${lbl}</label><select class="select prop" name="${name}" ${ro}>${opts.map(o => `<option value="${esc(o.v ?? o)}" ${String(o.v ?? o) === String(val ?? '') ? 'selected' : ''}>${esc(o.l ?? o)}</option>`).join('')}</select></div>`;
    const inp = (name, val, lbl, type = 'text') => `<div><label class="label">${lbl}</label><input class="input prop" type="${type}" name="${name}" value="${esc(val ?? '')}" ${ro}></div>`;
    const ta = (name, val, lbl, rows = 4) => `<div><label class="label">${lbl}</label><textarea class="textarea prop" name="${name}" style="min-height:${rows * 1.5}rem" ${ro}>${esc(val ?? '')}</textarea></div>`;
    let propsHtml = '';
    switch (c.type) {
      case 'heading': propsHtml = inp('text', p.text, 'テキスト') + sel('level', p.level || 2, [1, 2, 3, 4], 'レベル'); break;
      case 'text': propsHtml = ta('html', p.html, 'HTML (p, ul, strong, a 等)', 8); break;
      case 'image': propsHtml = `<div><label class="label">画像</label><select class="select prop" name="src" ${ro}><option value="">-- メディアから選択 --</option>${B.media.map(m => `<option value="${esc(m.url)}" ${m.url === p.src ? 'selected' : ''}>${esc(m.original_name)}</option>`).join('')}</select></div>` + inp('src', p.src, 'または画像URL') + inp('alt', p.alt, 'alt テキスト') + inp('caption', p.caption, 'キャプション') + inp('href', p.href, 'リンク先URL') + inp('width', p.width, '幅(px, CLS対策)', 'number') + inp('height', p.height, '高さ(px)', 'number') + `<label class="flex items-center gap-2 text-sm mt-2"><input type="checkbox" class="prop" name="lazy" ${p.lazy !== false ? 'checked' : ''} ${ro}> Lazy Loading</label>`; break;
      case 'button': propsHtml = inp('text', p.text, 'テキスト') + inp('url', p.url, 'URL') + `<label class="flex items-center gap-2 text-sm mt-2"><input type="checkbox" class="prop" name="external" ${p.external ? 'checked' : ''} ${ro}> 新しいタブ</label>`; break;
      case 'cta': propsHtml = inp('title', p.title, 'タイトル') + ta('text', p.text, '説明文', 2) + inp('buttonText', p.buttonText, 'ボタン文言') + sel('linkId', p.linkId || '', [{ v: '', l: '-- 直接URL --' }, ...B.links.map(l => ({ v: l.id, l: `${l.name} (計測リダイレクト)` }))], 'アフィリエイトリンク') + inp('url', p.url, '直接URL (リンク未選択時)') + inp('note', p.note, '注記'); break;
      case 'affiliate_ad': { const ad = B.ads.find(a => a.id === Number(p.adId)); propsHtml = sel('adId', p.adId || '', [{ v: '', l: '-- 広告を選択 --' }, ...B.ads.map(a => ({ v: a.id, l: `${a.name} ${a.width || '?'}×${a.height || '?'}` }))], '広告') + inp('label', p.label, 'ラベル (PR表記)') + (ad ? `<div class="text-[10px] bg-slate-50 dark:bg-slate-900 p-2 rounded mt-2 font-mono break-all max-h-24 overflow-auto">${esc(ad.original_code)}</div><p class="text-[10px] text-amber-700 mt-1"><i class="fas fa-lock"></i> Original Codeは改変されません。位置・余白・幅はコンテナ設定で調整。</p>` : ''); break; }
      case 'product': propsHtml = sel('productId', p.productId || '', [{ v: '', l: '-- 商品を選択 --' }, ...B.products.map(x => ({ v: x.id, l: x.name }))], '商品') + inp('buttonText', p.buttonText, 'ボタン文言'); break;
      case 'comparison_table': propsHtml = inp('title', p.title, 'タイトル') + inp('firstColumn', p.firstColumn, '先頭列名') + ta('columns', (p.columns || []).join('\n'), '列 (1行1列)', 3) + ta('rows', (p.rows || []).map(r => [r.label, ...(r.values || [])].join(' | ')).join('\n'), '行 (ラベル | 値1 | 値2 ...)', 6) + inp('recommended', p.recommended, 'おすすめ列 index (0〜)', 'number') + `<p class="text-[10px] text-slate-500 mt-1">Mobile表示: Mobile設定の「layout」で scroll(横スクロール)/card(カード)を選択</p>`; break;
      case 'ranking': propsHtml = inp('title', p.title, 'タイトル') + ta('items', (p.items || []).map(i => [i.name, i.description, i.url, i.buttonText].join(' | ')).join('\n'), '項目 (名前 | 説明 | URL | ボタン)', 6); break;
      case 'article': propsHtml = sel('articleId', p.articleId || '', [{ v: '', l: '-- inline HTML --' }, ...B.articles.map(a => ({ v: a.id, l: a.title }))], '記事') + ta('html', p.html, 'inline HTML (記事未選択時)', 6); break;
      case 'faq': propsHtml = inp('title', p.title, 'タイトル') + ta('items', (p.items || []).map(i => `${i.q} | ${i.a}`).join('\n'), 'Q&A (質問 | 回答, 1行1件)', 6); break;
      case 'search': propsHtml = inp('placeholder', p.placeholder, 'プレースホルダ') + inp('buttonText', p.buttonText, 'ボタン'); break;
      case 'banner': propsHtml = inp('text', p.text, 'テキスト') + inp('url', p.url, 'URL') + inp('image', p.image, '画像URL') + inp('background', p.background, '背景色', 'color'); break;
      case 'html': propsHtml = ta('html', p.html, 'HTML (script等は除去されます)', 8); break;
      case 'video': propsHtml = inp('youtubeId', p.youtubeId, 'YouTube ID') + inp('src', p.src, 'または動画URL (mp4)') + inp('poster', p.poster, 'ポスター画像URL') + inp('title', p.title, 'タイトル'); break;
      default: propsHtml = '<p class="text-xs text-slate-400">設定項目なし</p>';
    }
    const devCfg = `<div class="prop-group"><h4><i class="fas fa-${B.device === 'desktop' ? 'desktop' : B.device === 'tablet' ? 'tablet-screen-button' : 'mobile-screen'}"></i> ${B.device.toUpperCase()} 設定 <small class="normal-case font-normal">(デバイスタブで切替)</small></h4>
      <div class="grid grid-cols-2 gap-2">${CFG_FIELDS.map(([k, l]) => `<div><label class="label">${l}</label><input class="input cfg !min-h-0 !py-1.5 text-xs" name="${k}" value="${esc(cf[k] ?? '')}" placeholder="${k === 'width' ? (B.device === 'desktop' ? '300px' : B.device === 'tablet' ? '80%' : '100%') : ''}" ${ro}></div>`).join('')}
      <div><label class="label">Visibility</label><select class="select cfg !min-h-0 !py-1.5 text-xs" name="visibility" ${ro}><option value="" ${!cf.visibility ? 'selected' : ''}>表示</option><option value="hidden" ${cf.visibility === 'hidden' ? 'selected' : ''}>非表示</option></select></div>
      ${c.type === 'comparison_table' ? `<div><label class="label">Table Layout</label><select class="select cfg !min-h-0 !py-1.5 text-xs" name="layout" ${ro}><option value="" ${!cf.layout ? 'selected' : ''}>サイト既定</option><option value="scroll" ${cf.layout === 'scroll' ? 'selected' : ''}>横スクロール</option><option value="card" ${cf.layout === 'card' ? 'selected' : ''}>カード表示</option></select></div>` : ''}
      ${B.device === 'desktop' && B.site.responsive_set_id ? `<div><label class="label">Region</label><select class="select cfg !min-h-0 !py-1.5 text-xs" name="region" ${ro}><option value="" ${!cf.region ? 'selected' : ''}>メイン</option><option value="sidebar" ${cf.region === 'sidebar' ? 'selected' : ''}>サイドバー(2カラム時)</option></select></div>` : ''}</div>
      <p class="text-[10px] text-slate-500 mt-2">単位: %, rem, em, vw, clamp(), px。順番は各デバイスタブでドラッグ＆ドロップ（Tablet/Mobileは独立順序）。</p></div>`;
    el.innerHTML = `<div class="p-3 flex items-center justify-between"><h3 class="text-xs font-bold uppercase text-slate-500">${badge(c.type, 'blue')} #${c.id}</h3><button class="btn btn-ghost btn-sm" id="deselect"><i class="fas fa-times"></i></button></div><div class="prop-group"><h4>Properties</h4><div class="space-y-2">${propsHtml}</div></div>${devCfg}<div class="prop-group grid grid-cols-3 gap-1 text-[10px]">${['desktop', 'tablet', 'mobile'].map(d => `<div class="rounded border p-1 ${d === B.device ? 'border-blue-500' : 'border-slate-200'}"><b>${d}</b><br>${Object.entries(c[d + '_config'] || {}).map(([k, v]) => `${k}:${esc(v)}`).join('<br>') || '<span class="text-slate-400">既定</span>'}</div>`).join('')}</div>`;
    el.querySelector('#deselect').onclick = () => { B.selected = null; renderCanvas(); renderProps(); };
    if (!can('editor')) return;
    let t;
    const commit = async () => {
      const np = { ...p };
      el.querySelectorAll('.prop').forEach(i => {
        const n = i.name; let v = i.type === 'checkbox' ? i.checked : i.value;
        if (c.type === 'comparison_table' && n === 'columns') v = v.split('\n').map(s => s.trim()).filter(Boolean);
        else if (c.type === 'comparison_table' && n === 'rows') v = v.split('\n').filter(l => l.trim()).map(l => { const [label, ...values] = l.split('|').map(s => s.trim()); return { label, values }; });
        else if (c.type === 'ranking' && n === 'items') v = v.split('\n').filter(l => l.trim()).map(l => { const [name, description, url, buttonText] = l.split('|').map(s => s.trim()); return { name, description, url, buttonText }; });
        else if (c.type === 'faq' && n === 'items') v = v.split('\n').filter(l => l.trim()).map(l => { const [q, a] = l.split('|').map(s => s.trim()); return { q, a }; });
        else if (['level', 'adId', 'productId', 'articleId', 'linkId', 'recommended', 'width', 'height'].includes(n)) v = v === '' ? null : Number(v);
        if (n === 'src' && i.tagName === 'SELECT') { if (v) np.src = v; return; }
        np[n] = v;
      });
      const ncf = { ...cf }; el.querySelectorAll('.cfg').forEach(i => { if (i.value === '') delete ncf[i.name]; else ncf[i.name] = i.value; });
      const body = { props: np }; body[B.device + '_config'] = ncf;
      try { await put(`/api/builder/pages/${B.pageId}/components/${c.id}`, body); await load(); renderCanvas(); markDirty(); } catch (e) { toast(e.message, 'error'); }
    };
    el.querySelectorAll('.prop,.cfg').forEach(i => { i.addEventListener('change', commit); if (i.tagName !== 'SELECT' && i.type !== 'checkbox') i.addEventListener('input', () => { clearTimeout(t); t = setTimeout(commit, 700); }); });
  }
})();
