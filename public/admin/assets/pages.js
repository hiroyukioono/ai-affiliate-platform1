// Pages: Dashboard, Sites (AI generation wizard), Designs, Responsive, Mobile Prompts, Media
(() => {
  const { state, get, post, put, del, esc, fmt, yen, pct, dt, toast, modal, confirm, prompt, jsonView, badge, statusColor, spinner, withBusy, aiResult, route, navigate, render, loadSites, setSite, can } = App;

  // ================= Dashboard =================
  route('/', async (app) => {
    const main = App.mount(app, spinner('読み込み中'), { title: 'Dashboard' });
    const [ov, ai] = await Promise.all([get('/api/analytics/overview'), get('/api/ai/status').catch(e => ({ status: 'ERROR', errors: [e.message] }))]);
    state.aiStatus = ai.status;
    main.innerHTML = `
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="stat"><div class="l">Total PV</div><div class="v">${fmt(ov.totals.pv)}</div></div>
        <div class="stat"><div class="l">Affiliate Clicks</div><div class="v">${fmt(ov.totals.clicks)}</div></div>
        <div class="stat"><div class="l">Conversions</div><div class="v">${fmt(ov.totals.cv)}</div></div>
        <div class="stat"><div class="l">Revenue</div><div class="v">${yen(ov.totals.revenue)}</div></div>
      </div>
      <div class="grid md:grid-cols-3 gap-4 mb-6">
        <div class="card md:col-span-2"><h2 class="font-bold mb-3"><i class="fas fa-globe text-blue-500"></i> Sites</h2>
          <div class="table-wrap"><table class="table"><thead><tr><th>Site</th><th>Status</th><th>PV</th><th>Clicks</th><th>CTR</th><th>CV</th><th>CVR</th><th>Revenue</th><th></th></tr></thead><tbody>
          ${ov.sites.map(s => `<tr><td><strong>${esc(s.name)}</strong><br><small class="text-slate-500">/s/${esc(s.slug)}/</small></td><td>${badge(s.status, statusColor(s.status))}</td><td>${fmt(s.metrics.pv)}</td><td>${fmt(s.metrics.affiliateClicks)}</td><td>${pct(s.metrics.ctr)}</td><td>${fmt(s.metrics.cv)}</td><td>${pct(s.metrics.cvr)}</td><td>${yen(s.metrics.revenue)}</td><td><a href="#/sites/${s.id}" class="btn btn-sm btn-secondary">開く</a></td></tr>`).join('') || '<tr><td colspan="9" class="text-center text-slate-500 py-6">サイトがありません。<a href="#/sites" class="text-blue-600 underline">AIでサイトを作成</a></td></tr>'}
          </tbody></table></div></div>
        <div class="card"><h2 class="font-bold mb-3"><i class="fas fa-robot text-purple-500"></i> Ollama Status</h2>
          <div class="flex items-center gap-2 mb-2">${badge(ai.status, statusColor(ai.status))}<span class="text-xs text-slate-500">${esc(state.config?.ai?.model)} @ ${esc(state.config?.ai?.baseUrl)}</span></div>
          ${ai.errors?.length ? `<ul class="text-xs text-red-600 list-disc pl-4 space-y-1">${ai.errors.map(e => `<li>${esc(e)}</li>`).join('')}</ul>` : `<p class="text-xs text-green-700">テストプロンプト応答: "${esc(ai.checks?.testResponse)}" (${ai.checks?.durationMs}ms)</p>`}
          ${ai.hint ? `<p class="text-xs bg-amber-50 text-amber-800 p-2 rounded mt-2"><i class="fas fa-circle-info"></i> ${esc(ai.hint)}</p>` : ''}
          <a href="#/ai" class="btn btn-secondary btn-sm mt-3">AI設定・接続テスト</a>
        </div>
      </div>
      <div class="card"><h2 class="font-bold mb-2">ワークフロー</h2>
        <div class="flex flex-wrap gap-2 text-xs">${['広告タイトル入力', 'AIテーマ分析', 'サイト構造生成', '管理者確認', 'サイト作成', 'デザイン/Mobile Prompt選択', 'Site Builder編集', 'Desktop/Tablet/Mobile Preview', 'Mobile Quality Check', 'Publish', 'アクセス/クリック/CV/Revenue計測', 'AI分析', 'AI改善案', 'Preview', 'Approve', 'Apply', 'A/Bテスト', '改善前後比較'].map((s, i) => `<span class="badge badge-gray">${i + 1}. ${s}</span>`).join('')}</div></div>`;
  });

  // ================= Sites =================
  route('/sites', async (app) => {
    const main = App.mount(app, spinner(), { title: 'Sites', siteSelector: false, actions: can('editor') ? `<button class="btn btn-primary btn-sm" id="new-site"><i class="fas fa-wand-magic-sparkles"></i> AIでサイト作成</button>` : '' });
    await loadSites();
    main.innerHTML = `<div class="grid-auto">${state.sites.map(s => `<div class="card flex flex-col gap-2">
      <div class="flex justify-between items-start"><div><h3 class="font-bold">${esc(s.name)}</h3><small class="text-slate-500">/s/${esc(s.slug)}/ · ${esc(s.ad_title || '')}</small></div>${badge(s.status, statusColor(s.status))}</div>
      <div class="text-xs text-slate-500">Design: ${esc(s.design_name || '-')} · Mobile: ${esc(s.mobile_prompt_name || '-')} · Pages: ${s.page_count} · PV: ${fmt(s.pv)}</div>
      <div class="flex gap-2 flex-wrap mt-auto"><a href="#/sites/${s.id}" class="btn btn-secondary btn-sm"><i class="fas fa-gear"></i> 設定</a><a href="#/builder/${s.id}" class="btn btn-primary btn-sm"><i class="fas fa-pen-ruler"></i> Builder</a>${s.status === 'published' ? `<a href="/s/${esc(s.slug)}/" target="_blank" class="btn btn-ghost btn-sm"><i class="fas fa-up-right-from-square"></i> 公開サイト</a>` : ''}</div></div>`).join('') || '<div class="card col-span-full text-center py-10 text-slate-500">サイトがありません。「AIでサイト作成」から始めてください。</div>'}</div>`;
    main.closest('#app').querySelector('#new-site')?.addEventListener('click', siteWizard);
  });

  // AI site generation wizard: ad title -> theme analysis -> structure -> confirm -> create
  async function siteWizard() {
    const [designs, prompts, resp] = await Promise.all([get('/api/designs'), get('/api/mobile-prompts'), get('/api/responsive')]);
    let theme = null, pages = null, adTitle = '';
    const close = modal({ title: '<i class="fas fa-wand-magic-sparkles text-purple-500"></i> AIサイト生成ウィザード', size: 'modal-lg', body: `
      <div id="wz-step1" class="space-y-3">
        <p class="text-sm">広告タイトル（アフィリエイト案件名）を入力してください。AI (${esc(state.config.ai.model)}) がサイトテーマ・ターゲット・カテゴリ・SEOキーワード・CTA候補・比較表候補を提案します。</p>
        <div class="flex gap-2"><input class="input" id="wz-ad" placeholder="例: XServer VPS" value="XServer VPS"><button class="btn btn-primary" id="wz-analyze"><i class="fas fa-brain"></i> AIテーマ分析</button></div>
        <textarea class="textarea" id="wz-notes" placeholder="補足メモ（任意）: ターゲット層、強調したい点など" style="min-height:60px"></textarea>
        <div id="wz-theme"></div>
      </div>
      <div id="wz-step2" class="hidden space-y-3 mt-4 border-t pt-4">
        <h3 class="font-bold">ステップ2: サイト構造</h3>
        <div class="flex gap-2 flex-wrap"><button class="btn btn-primary" id="wz-structure"><i class="fas fa-sitemap"></i> AIでページ構造生成</button><button class="btn btn-secondary" id="wz-skip">構造生成をスキップ（ホームのみ）</button></div>
        <div id="wz-pages"></div>
      </div>
      <div id="wz-step3" class="hidden space-y-3 mt-4 border-t pt-4">
        <h3 class="font-bold">ステップ3: 確認して作成</h3>
        <div class="grid md:grid-cols-2 gap-3">
          <div><label class="label">サイト名</label><input class="input" id="wz-name"></div>
          <div><label class="label">スラッグ (URL)</label><input class="input" id="wz-slug"></div>
          <div><label class="label">デザイン</label><select class="select" id="wz-design">${designs.filter(d => d.is_active).map(d => `<option value="${d.id}">${esc(d.name)} (${esc(d.category)})</option>`).join('')}</select></div>
          <div><label class="label">Mobile Prompt</label><select class="select" id="wz-mp">${prompts.filter(p => p.status === 'ACTIVE').map(p => `<option value="${p.id}" ${p.name === 'Mobile Affiliate' ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></div>
          <div><label class="label">Responsive Design Set</label><select class="select" id="wz-rs">${resp.map(r => `<option value="${r.id}">${esc(r.name)}</option>`).join('')}</select></div>
        </div>
        <p class="text-xs text-slate-500">※ 作成後も下書き状態です。自動公開はされません。Site Builderで編集し、Previewを確認してからPublishしてください。</p>
      </div>`, footer: `<button class="btn btn-secondary" id="wz-cancel">キャンセル</button><button class="btn btn-success hidden" id="wz-create"><i class="fas fa-check"></i> サイトを作成</button>`,
      onMount: (root, close) => {
        root.querySelector('#wz-cancel').onclick = close;
        root.querySelector('#wz-analyze').onclick = (e) => withBusy(e.currentTarget, async () => {
          adTitle = root.querySelector('#wz-ad').value.trim(); if (!adTitle) return toast('広告タイトルを入力してください', 'warn');
          root.querySelector('#wz-theme').innerHTML = spinner('Ollamaで分析中（数十秒〜数分かかる場合があります）...');
          try {
            const r = await post('/api/sites/analyze-theme', { adTitle, notes: root.querySelector('#wz-notes').value });
            theme = r.theme;
            root.querySelector('#wz-theme').innerHTML = `<div class="ai-box text-sm space-y-2">
              <div class="flex justify-between"><strong>${esc(theme.site_name || adTitle)}</strong><small>${r.model} · ${r.durationMs}ms</small></div>
              <p><b>テーマ:</b> ${esc(theme.theme)}</p><p><b>ターゲット:</b> ${esc(theme.target_audience)}</p>
              <p><b>カテゴリ:</b> ${(theme.categories || []).map(c => badge(c.name, 'blue')).join(' ')}</p>
              <p><b>SEOキーワード:</b> ${(theme.seo_keywords || []).map(k => badge(k, 'gray')).join(' ')}</p>
              <p><b>CTA候補:</b> ${(theme.cta_candidates || []).map(k => `<span class="badge badge-green">${esc(k)}</span>`).join(' ')}</p>
              <p><b>比較表候補:</b> ${(theme.comparison_candidates || []).map(k => esc(k.name)).join(', ')}</p>
              <p><b>記事案:</b></p><ul class="list-disc pl-5">${(theme.article_ideas || []).map(a => `<li>${esc(a.title)} <small class="text-slate-500">(${esc(a.intent)})</small></li>`).join('')}</ul>
              <p class="text-xs text-amber-700">不確実性: ${esc(theme.uncertainty || '')}</p>
              <details class="acc"><summary class="text-xs">生JSON</summary>${jsonView(theme)}</details></div>`;
            root.querySelector('#wz-step2').classList.remove('hidden');
            root.querySelector('#wz-name').value = theme.site_name || adTitle; root.querySelector('#wz-slug').value = (theme.site_name || adTitle).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'site';
          } catch (ex) { root.querySelector('#wz-theme').innerHTML = `<p class="text-red-600 text-sm">AI分析エラー: ${esc(ex.message)}</p>`; }
        });
        root.querySelector('#wz-structure').onclick = (e) => withBusy(e.currentTarget, async () => {
          root.querySelector('#wz-pages').innerHTML = spinner('ページ構造を生成中...');
          try {
            const r = await post('/api/sites/generate-structure', { adTitle, theme });
            pages = r.pages;
            root.querySelector('#wz-pages').innerHTML = `<div class="space-y-2">${pages.map((p, i) => `<details class="rec-card acc"><summary>${badge(p.page_type, 'blue')} <strong>${esc(p.title)}</strong> <small class="text-slate-500">/${esc(p.slug)} · ${(p.components || []).length} components</small></summary><p class="text-xs mt-1"><b>SEO Title:</b> ${esc(p.seo_title)}</p><p class="text-xs"><b>Meta:</b> ${esc(p.meta_description)}</p><p class="text-xs">${(p.components || []).map(c => badge(c.type, 'gray')).join(' ')}</p></details>`).join('')}</div>`;
            root.querySelector('#wz-step3').classList.remove('hidden'); root.querySelector('#wz-create').classList.remove('hidden');
          } catch (ex) { root.querySelector('#wz-pages').innerHTML = `<p class="text-red-600 text-sm">構造生成エラー: ${esc(ex.message)}</p>`; }
        });
        root.querySelector('#wz-skip').onclick = () => { pages = null; root.querySelector('#wz-step3').classList.remove('hidden'); root.querySelector('#wz-create').classList.remove('hidden'); };
        root.querySelector('#wz-create').onclick = async (e) => {
          const btn = e.currentTarget; btn.disabled = true;
          try {
            const site = await post('/api/sites', { name: root.querySelector('#wz-name').value, slug: root.querySelector('#wz-slug').value, ad_title: adTitle, theme, pages, design_theme_id: Number(root.querySelector('#wz-design').value), mobile_prompt_id: Number(root.querySelector('#wz-mp').value), responsive_set_id: Number(root.querySelector('#wz-rs').value) });
            toast(`サイト「${site.name}」を作成しました（下書き）`, 'success'); await loadSites(); setSite(site.id); close(); navigate(`/builder/${site.id}`);
          } catch (ex) { toast(ex.message, 'error'); btn.disabled = false; }
        };
      } });
  }

  // Site detail / settings
  route('/sites/:id', async (app, { id }) => {
    const main = App.mount(app, spinner(), { title: 'Site 設定', siteSelector: false });
    const [site, designs, prompts, resp] = await Promise.all([get(`/api/sites/${id}`), get('/api/designs'), get('/api/mobile-prompts'), get('/api/responsive')]);
    const ms = site.mobile_settings || {};
    const msFields = ['font_size', 'line_height', 'margin', 'padding', 'width', 'height', 'display', 'position', 'image_size', 'button_size', 'cta_width', 'card_layout', 'table_layout', 'navigation'];
    main.innerHTML = `<div class="grid lg:grid-cols-3 gap-4">
      <div class="card lg:col-span-2 space-y-3">
        <div class="flex justify-between items-center"><h2 class="font-bold">${esc(site.name)} ${badge(site.status, statusColor(site.status))}</h2><div class="flex gap-2"><a href="#/builder/${site.id}" class="btn btn-primary btn-sm"><i class="fas fa-pen-ruler"></i> Builder</a>${site.status === 'published' ? `<button class="btn btn-secondary btn-sm" id="unpub">非公開にする</button>` : `<button class="btn btn-success btn-sm" id="pub"><i class="fas fa-upload"></i> Publish</button>`}${can('admin') ? `<button class="btn btn-danger btn-sm" id="del-site"><i class="fas fa-trash"></i></button>` : ''}</div></div>
        <form id="site-form" class="grid md:grid-cols-2 gap-3">
          <div><label class="label">サイト名</label><input class="input" name="name" value="${esc(site.name)}"></div>
          <div><label class="label">広告タイトル</label><input class="input" name="ad_title" value="${esc(site.ad_title || '')}"></div>
          <div><label class="label">デザイン</label><select class="select" name="design_theme_id">${designs.map(d => `<option value="${d.id}" ${d.id === site.design_theme_id ? 'selected' : ''}>${esc(d.name)}</option>`).join('')}</select></div>
          <div><label class="label">Mobile Prompt</label><select class="select" name="mobile_prompt_id">${prompts.map(p => `<option value="${p.id}" ${p.id === site.mobile_prompt_id ? 'selected' : ''}>${esc(p.name)} [${p.status}]</option>`).join('')}</select></div>
          <div><label class="label">Responsive Set</label><select class="select" name="responsive_set_id">${resp.map(r => `<option value="${r.id}" ${r.id === site.responsive_set_id ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}</select></div>
          <div><label class="label">ターゲット</label><input class="input" name="target_audience" value="${esc(site.target_audience || '')}"></div>
          <div class="md:col-span-2"><label class="label">SEOキーワード (カンマ区切り)</label><input class="input" name="seo_keywords" value="${esc((Array.isArray(site.seo_keywords) ? site.seo_keywords : []).join(', '))}"></div>
          <div><label class="label">サイト説明 (meta description既定)</label><input class="input" name="description" value="${esc(site.settings?.description || '')}"></div>
          <div><label class="label">OGP画像URL</label><input class="input" name="ogImage" value="${esc(site.settings?.ogImage || '')}"></div>
          <div class="md:col-span-2"><label class="label">カスタムCSS</label><textarea class="textarea" name="customCss" style="min-height:70px">${esc(site.settings?.customCss || '')}</textarea></div>
          <div class="md:col-span-2"><button class="btn btn-primary" type="submit"><i class="fas fa-save"></i> 保存</button></div>
        </form>
        <div class="border-t pt-3"><h3 class="font-bold mb-2">ページ (${site.pages.length}) <button class="btn btn-secondary btn-sm" id="add-page"><i class="fas fa-plus"></i> ページ追加</button></h3>
          <div class="table-wrap"><table class="table"><thead><tr><th>Title</th><th>Slug</th><th>Type</th><th>Status</th><th></th></tr></thead><tbody>${site.pages.map(p => `<tr><td>${esc(p.title)}</td><td>/${esc(p.slug)}</td><td>${badge(p.page_type, 'blue')}</td><td>${badge(p.status, statusColor(p.status))}</td><td class="whitespace-nowrap"><a href="#/builder/${site.id}/${p.id}" class="btn btn-sm btn-secondary">編集</a> <button class="btn btn-sm btn-ghost page-seo" data-id="${p.id}">SEO</button> ${p.slug !== 'home' ? `<button class="btn btn-sm btn-ghost text-red-600 page-del" data-id="${p.id}"><i class="fas fa-trash"></i></button>` : ''}</td></tr>`).join('')}</tbody></table></div></div>
      </div>
      <div class="card space-y-3"><h3 class="font-bold"><i class="fas fa-mobile-screen"></i> Mobile Settings</h3>
        <form id="ms-form" class="grid grid-cols-2 gap-2">${msFields.map(k => `<div><label class="label">${k.replace(/_/g, ' ')}</label>${['table_layout', 'card_layout', 'navigation', 'display', 'position'].includes(k) ? `<select class="select" name="${k}">${({ table_layout: ['scroll', 'card'], card_layout: ['stack', 'grid', 'list'], navigation: ['hamburger', 'bottom-bar', 'none'], display: ['block', 'flex', 'grid'], position: ['static', 'sticky', 'sticky-cta'] })[k].map(o => `<option ${ms[k] === o ? 'selected' : ''}>${o}</option>`).join('')}</select>` : `<input class="input" name="${k}" value="${esc(ms[k] ?? '')}">`}</div>`).join('')}
        <div class="col-span-2"><label class="label">Visibility (JSON: componentType → hidden)</label><textarea class="textarea" name="visibility" style="min-height:50px">${esc(JSON.stringify(ms.visibility || {}))}</textarea></div>
        <div class="col-span-2"><button class="btn btn-primary w-full justify-center" type="submit">Mobile設定を保存</button></div></form>
        <div class="text-xs text-slate-500">Font Size / Line Height / Margin / Padding / Width / Height / Display / Position / Image Size / Button Size / CTA Width / Card Layout / Table Layout / Navigation / Visibility</div>
      </div></div>`;
    main.querySelector('#site-form').onsubmit = async (e) => {
      e.preventDefault(); const f = e.target;
      try { await put(`/api/sites/${id}`, { name: f.name.value, ad_title: f.ad_title.value, design_theme_id: Number(f.design_theme_id.value), mobile_prompt_id: Number(f.mobile_prompt_id.value), responsive_set_id: Number(f.responsive_set_id.value), target_audience: f.target_audience.value, seo_keywords: f.seo_keywords.value.split(',').map(s => s.trim()).filter(Boolean), settings: { description: f.description.value, ogImage: f.ogImage.value, customCss: f.customCss.value } }); toast('保存しました', 'success'); await loadSites(); } catch (ex) { toast(ex.message, 'error'); }
    };
    main.querySelector('#ms-form').onsubmit = async (e) => {
      e.preventDefault(); const f = e.target; const b = {}; msFields.forEach(k => b[k] = f[k].value);
      try { b.visibility = JSON.parse(f.visibility.value || '{}'); await put(`/api/sites/${id}/mobile-settings`, b); toast('Mobile設定を保存しました', 'success'); } catch (ex) { toast(ex.message, 'error'); }
    };
    main.querySelector('#pub')?.addEventListener('click', async () => { if (!await confirm('全ページを公開します。現在の下書き状態が公開バージョンになります。')) return; try { const r = await post(`/api/sites/${id}/publish`); toast('公開しました: ' + r.url, 'success'); await loadSites(); render(); } catch (ex) { toast(ex.message, 'error'); } });
    main.querySelector('#unpub')?.addEventListener('click', async () => { await post(`/api/sites/${id}/unpublish`); toast('非公開にしました', 'info'); await loadSites(); render(); });
    main.querySelector('#del-site')?.addEventListener('click', async () => { if (!await confirm('このサイトと全データを削除します。元に戻せません。', { danger: true })) return; await del(`/api/sites/${id}`); toast('削除しました', 'info'); await loadSites(); navigate('/sites'); });
    main.querySelector('#add-page').onclick = async () => { const v = await prompt('ページ追加', [{ name: 'title', label: 'タイトル', required: true }, { name: 'slug', label: 'スラッグ' }, { name: 'page_type', label: '種類', type: 'select', value: 'page', options: ['page', 'article', 'category'].map(x => ({ value: x, label: x })) }]); if (!v) return; try { const p = await post(`/api/sites/${id}/pages`, v); toast('ページを追加しました', 'success'); navigate(`/builder/${id}/${p.id}`); } catch (ex) { toast(ex.message, 'error'); } };
    main.querySelectorAll('.page-del').forEach(b => b.onclick = async () => { if (!await confirm('ページを削除しますか？', { danger: true })) return; await del(`/api/sites/${id}/pages/${b.dataset.id}`); render(); });
    main.querySelectorAll('.page-seo').forEach(b => b.onclick = () => App.pageSeoDialog(id, site.pages.find(p => p.id === Number(b.dataset.id))));
  });

  App.pageSeoDialog = async (siteId, p) => {
    const v = await prompt(`SEO設定: ${p.title}`, [
      { name: 'title', label: 'ページタイトル', value: p.title, required: true }, { name: 'seo_title', label: 'SEOタイトル (<title>)', value: p.seo_title || '', help: '32文字以内推奨。空欄なら「タイトル | サイト名」' },
      { name: 'meta_description', label: 'Meta Description', type: 'textarea', value: p.meta_description || '', rows: 3 }, { name: 'canonical_url', label: 'Canonical URL', value: p.canonical_url || '' },
      { name: 'robots', label: 'Robots', type: 'select', value: p.robots || 'index,follow', options: ['index,follow', 'noindex,follow', 'noindex,nofollow', 'index,nofollow'].map(x => ({ value: x, label: x })) },
      { name: 'og_image', label: 'OG Image URL', value: p.og_image || '' }, { name: 'structured_data', label: '構造化データ (JSON-LD、空欄で自動生成)', type: 'json', value: p.structured_data ? JSON.parse(p.structured_data) : '' }
    ], { size: 'modal-lg' });
    if (!v) return; if (v.structured_data && Object.keys(v.structured_data).length === 0) v.structured_data = null;
    try { await put(`/api/sites/${siteId}/pages/${p.id}`, v); toast('SEO設定を保存しました', 'success'); render(); } catch (ex) { toast(ex.message, 'error'); }
  };

  // ================= Designs =================
  const TOKEN_KEYS = ['primary', 'secondary', 'accent', 'bg', 'surface', 'text', 'muted', 'headerBg', 'headerText', 'footerBg', 'footerText'];
  async function designDialog(d) {
    const t = d?.tokens || {};
    const v = await prompt(d ? `デザイン編集: ${d.name}` : 'デザイン追加', [
      { name: 'name', label: '名前', value: d?.name || '', required: true }, { name: 'description', label: '説明', value: d?.description || '' }, { name: 'category', label: 'カテゴリ', value: d?.category || 'custom' },
      ...TOKEN_KEYS.map(k => ({ name: 't_' + k, label: `色: ${k}`, type: 'color', value: t[k] || '#2563eb' })),
      { name: 't_radius', label: '角丸 (radius)', value: t.radius || '8px' }, { name: 't_font', label: 'フォント', value: t.font || "system-ui,sans-serif" }, { name: 't_fontHead', label: '見出しフォント', value: t.fontHead || 'inherit' },
      { name: 'is_active', label: '有効', type: 'checkbox', value: d ? !!d.is_active : true }, { name: 'note', label: 'バージョンメモ', value: '' }
    ], { size: 'modal-lg' });
    if (!v) return;
    const tokens = {}; for (const k of Object.keys(v)) if (k.startsWith('t_')) tokens[k.slice(2)] = v[k];
    const body = { name: v.name, description: v.description, category: v.category, tokens, is_active: v.is_active, note: v.note, regenerateCss: true };
    try { if (d) await put(`/api/designs/${d.id}`, body); else await post('/api/designs', body); toast('保存しました', 'success'); render(); } catch (ex) { toast(ex.message, 'error'); }
  }
  App.designPreviewHtml = (d) => { const t = d.tokens || {}; return `<div style="font-family:${esc(t.font || 'system-ui')};background:${esc(t.bg)};color:${esc(t.text)};border-radius:8px;overflow:hidden;border:1px solid #e5e7eb"><div style="background:${esc(t.headerBg)};color:${esc(t.headerText)};padding:.5rem .75rem;font-weight:700;font-size:.8rem">${esc(d.name)}</div><div style="padding:.75rem"><div style="font-weight:700;font-family:${esc(t.fontHead || 'inherit')}">見出しサンプル</div><p style="font-size:.75rem;color:${esc(t.muted)};margin:.25rem 0">本文テキストのサンプルです。</p><div style="background:${esc(t.surface)};border:2px solid ${esc(t.accent)};border-radius:${esc(t.radius)};padding:.5rem;text-align:center"><span style="display:inline-block;background:${esc(t.primary)};color:#fff;padding:.4rem .9rem;border-radius:${esc(t.radius)};font-size:.75rem;font-weight:700">CTAボタン</span></div></div><div style="background:${esc(t.footerBg)};color:${esc(t.footerText)};padding:.35rem .75rem;font-size:.65rem">Footer</div></div>`; };

  route('/designs', async (app) => {
    const main = App.mount(app, spinner(), { title: 'Designs', siteSelector: false, actions: can('editor') ? `<button class="btn btn-secondary btn-sm" id="ai-design"><i class="fas fa-robot"></i> AIデザイン生成</button><button class="btn btn-primary btn-sm" id="new-design"><i class="fas fa-plus"></i> 追加</button>` : '' });
    const designs = await get('/api/designs');
    main.innerHTML = `<p class="text-sm text-slate-500 mb-3">${designs.length} テーマ（システム ${designs.filter(d => d.is_system).length} / カスタム ${designs.filter(d => !d.is_system).length}）。サイトごとに選択できます。</p><div class="grid-auto">${designs.map(d => `<div class="card space-y-2">${App.designPreviewHtml(d)}
      <div class="flex justify-between items-center"><div><strong>${esc(d.name)}</strong> ${d.is_system ? badge('system', 'gray') : ''} ${d.is_active ? '' : badge('inactive', 'red')}<br><small class="text-slate-500">${esc(d.category)} · v${d.current_version} · ${d.site_count} sites</small></div></div>
      <div class="flex gap-1 flex-wrap text-xs">${TOKEN_KEYS.slice(0, 6).map(k => `<span class="swatch" style="background:${esc(d.tokens[k])}" title="${k}"></span>`).join('')}</div>
      <div class="flex gap-1 flex-wrap"><button class="btn btn-sm btn-secondary d-prev" data-id="${d.id}"><i class="fas fa-eye"></i> プレビュー</button>${can('editor') ? `<button class="btn btn-sm btn-secondary d-edit" data-id="${d.id}"><i class="fas fa-pen"></i></button><button class="btn btn-sm btn-secondary d-dup" data-id="${d.id}"><i class="fas fa-copy"></i></button><button class="btn btn-sm btn-secondary d-ver" data-id="${d.id}"><i class="fas fa-clock-rotate-left"></i></button><button class="btn btn-sm btn-ghost text-red-600 d-del" data-id="${d.id}"><i class="fas fa-trash"></i></button>` : ''}</div></div>`).join('')}</div>`;
    const byId = (id) => designs.find(d => d.id === Number(id));
    app.querySelector('#new-design')?.addEventListener('click', () => designDialog(null));
    app.querySelector('#ai-design')?.addEventListener('click', async () => {
      const v = await prompt('AIデザイン生成', [{ name: 'brief', label: 'デザインの要望', type: 'textarea', value: '信頼感のあるVPS比較サイト向け。青系で清潔感、CTAはオレンジで目立たせる。', rows: 4 }], { submitLabel: 'AIで生成' }); if (!v) return;
      const c = modal({ title: 'AIデザイン生成', body: spinner('Ollamaでデザイン生成中...') });
      try { const r = await post('/api/designs/ai/generate', v); c(); const d = r.result; const tokens = d.tokens || {};
        modal({ title: 'AI生成デザイン（確認して保存）', body: `${App.designPreviewHtml({ name: d.name, tokens })}<p class="text-sm mt-2">${esc(d.description)}</p>${jsonView(tokens)}`, footer: `<button class="btn btn-primary" id="save-ai-d">このデザインを保存</button>`, onMount: (root, close) => { root.querySelector('#save-ai-d').onclick = async () => { await post('/api/designs', { name: d.name, description: d.description, category: d.category || 'ai', tokens, regenerateCss: true }); toast('保存しました', 'success'); close(); render(); }; } });
      } catch (ex) { c(); toast(ex.message, 'error'); }
    });
    main.querySelectorAll('.d-edit').forEach(b => b.onclick = () => designDialog(byId(b.dataset.id)));
    main.querySelectorAll('.d-dup').forEach(b => b.onclick = async () => { await post(`/api/designs/${b.dataset.id}/duplicate`); toast('複製しました', 'success'); render(); });
    main.querySelectorAll('.d-del').forEach(b => b.onclick = async () => { if (!await confirm('削除しますか？', { danger: true })) return; try { await del(`/api/designs/${b.dataset.id}`); toast('削除しました', 'info'); render(); } catch (ex) { toast(ex.message, 'error'); } });
    main.querySelectorAll('.d-prev').forEach(b => b.onclick = () => { const d = byId(b.dataset.id); modal({ title: `プレビュー: ${esc(d.name)}`, size: 'modal-lg', body: `<div class="grid md:grid-cols-2 gap-4">${App.designPreviewHtml(d)}<pre class="json">${esc(d.css)}</pre></div>` }); });
    main.querySelectorAll('.d-ver').forEach(b => b.onclick = async () => { const vs = await get(`/api/designs/${b.dataset.id}/versions`); modal({ title: 'バージョン履歴', body: `<table class="table"><thead><tr><th>Ver</th><th>Note</th><th>日時</th><th></th></tr></thead><tbody>${vs.map(v => `<tr><td>v${v.version}</td><td>${esc(v.note || '')}</td><td>${dt(v.created_at)}</td><td><button class="btn btn-sm btn-secondary rb" data-v="${v.id}">Rollback</button></td></tr>`).join('')}</tbody></table>`, onMount: (root, close) => root.querySelectorAll('.rb').forEach(x => x.onclick = async () => { await post(`/api/designs/${b.dataset.id}/rollback/${x.dataset.v}`); toast('ロールバックしました', 'success'); close(); render(); }) }); });
  });

  // ================= Responsive Designs =================
  const RESP_KEYS = ['containerWidth', 'columns', 'sidebar', 'fontSize', 'padding', 'adWidth', 'ctaWidth', 'tableLayout', 'navigation'];
  async function respDialog(s) {
    const fields = [{ name: 'name', label: '名前', value: s?.name || '', required: true }, { name: 'description', label: '説明', value: s?.description || '' }, { name: 'bp_tablet', label: 'Tablet breakpoint (px以下)', type: 'number', value: s?.breakpoints?.tablet ?? 1024 }, { name: 'bp_mobile', label: 'Mobile breakpoint (px以下)', type: 'number', value: s?.breakpoints?.mobile ?? 767 }];
    for (const dev of ['desktop', 'tablet', 'mobile']) fields.push({ name: dev, label: `${dev.toUpperCase()} 設定 (JSON: ${RESP_KEYS.join(', ')})`, type: 'json', value: s?.[dev + '_config'] || {}, rows: 5 });
    const v = await prompt(s ? `編集: ${s.name}` : 'Responsive Design Set 追加', fields, { size: 'modal-lg' }); if (!v) return;
    const body = { name: v.name, description: v.description, breakpoints: { tablet: v.bp_tablet, mobile: v.bp_mobile }, desktop_config: v.desktop, tablet_config: v.tablet, mobile_config: v.mobile };
    try { if (s) await put(`/api/responsive/${s.id}`, body); else await post('/api/responsive', body); toast('保存しました', 'success'); render(); } catch (ex) { toast(ex.message, 'error'); }
  }
  route('/responsive', async (app) => {
    const main = App.mount(app, spinner(), { title: 'Responsive Designs', siteSelector: false, actions: can('editor') ? `<button class="btn btn-secondary btn-sm" id="ai-resp"><i class="fas fa-robot"></i> AIレスポンシブ分析</button><button class="btn btn-primary btn-sm" id="new-resp"><i class="fas fa-plus"></i> 追加</button>` : '' });
    const sets = await get('/api/responsive');
    main.innerHTML = `<div class="space-y-4">${sets.map(s => `<div class="card"><div class="flex justify-between items-start flex-wrap gap-2"><div><strong>${esc(s.name)}</strong> ${s.is_system ? badge('system') : ''} <small class="text-slate-500">${esc(s.description || '')} · ${s.site_count} sites · tablet ≤${s.breakpoints.tablet}px · mobile ≤${s.breakpoints.mobile}px</small></div>
      <div class="flex gap-1">${can('editor') ? `<button class="btn btn-sm btn-secondary r-edit" data-id="${s.id}"><i class="fas fa-pen"></i> 編集</button><button class="btn btn-sm btn-secondary r-dup" data-id="${s.id}"><i class="fas fa-copy"></i></button><button class="btn btn-sm btn-ghost text-red-600 r-del" data-id="${s.id}"><i class="fas fa-trash"></i></button>` : ''}</div></div>
      <div class="grid md:grid-cols-3 gap-3 mt-3">${['desktop', 'tablet', 'mobile'].map(dv => `<div class="rounded border border-slate-200 dark:border-slate-700 p-3"><div class="font-semibold text-sm mb-2"><i class="fas fa-${dv === 'desktop' ? 'desktop' : dv === 'tablet' ? 'tablet-screen-button' : 'mobile-screen'}"></i> ${dv}</div><table class="text-xs w-full">${Object.entries(s[dv + '_config']).map(([k, v]) => `<tr><td class="text-slate-500 pr-2">${esc(k)}</td><td><code>${esc(v)}</code></td></tr>`).join('')}</table></div>`).join('')}</div>
      <div class="mt-3 flex gap-1 items-center text-xs text-slate-500">プレビュー: ${[320, 375, 390, 414, 430, 768, 1024, 1280].map(w => `<span class="badge ${w <= s.breakpoints.mobile ? 'badge-green' : w <= s.breakpoints.tablet ? 'badge-yellow' : 'badge-blue'}">${w}px → ${w <= s.breakpoints.mobile ? 'mobile' : w <= s.breakpoints.tablet ? 'tablet' : 'desktop'}</span>`).join(' ')}</div></div>`).join('')}</div>`;
    app.querySelector('#new-resp')?.addEventListener('click', () => respDialog(null));
    app.querySelector('#ai-resp')?.addEventListener('click', async () => { if (!App.site()) return toast('サイトを選択してください', 'warn'); const c = modal({ title: 'AIレスポンシブ分析', body: spinner(`「${esc(App.site().name)}」のレスポンシブ設定を分析中...`) }); try { const r = await post('/api/responsive/ai/analyze', { siteId: state.currentSiteId }); c(); modal({ title: 'AIレスポンシブ分析結果', size: 'modal-lg', body: aiResult(r.result) + `<p class="text-xs text-slate-500 mt-2">${r.model} · ${r.durationMs}ms</p>` }); } catch (ex) { c(); toast(ex.message, 'error'); } });
    main.querySelectorAll('.r-edit').forEach(b => b.onclick = () => respDialog(sets.find(s => s.id === Number(b.dataset.id))));
    main.querySelectorAll('.r-dup').forEach(b => b.onclick = async () => { await post(`/api/responsive/${b.dataset.id}/duplicate`); render(); });
    main.querySelectorAll('.r-del').forEach(b => b.onclick = async () => { if (!await confirm('削除しますか？', { danger: true })) return; try { await del(`/api/responsive/${b.dataset.id}`); render(); } catch (ex) { toast(ex.message, 'error'); } });
  });

  // ================= Mobile Prompts =================
  async function mpDialog(p) {
    const v = await prompt(p ? `編集: ${p.name}` : 'Mobile Prompt 追加', [{ name: 'name', label: '名前', value: p?.name || '', required: true }, { name: 'description', label: '説明', value: p?.description || '' }, { name: 'prompt', label: 'AIへの指示 (Prompt)', type: 'textarea', value: p?.prompt || '', rows: 6 }, { name: 'rules', label: 'ルール (JSON: minFontPx, minLineHeight, minTapPx, ctaWidth, tableLayout ...)', type: 'json', value: p?.rules || { minFontPx: 16, minLineHeight: 1.6, minTapPx: 44, ctaWidth: '100%', tableLayout: 'card' }, rows: 5 }, { name: 'status', label: 'ステータス', type: 'select', value: p?.status || 'ACTIVE', options: [{ value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }] }, { name: 'note', label: 'バージョンメモ', value: '' }], { size: 'modal-lg' });
    if (!v) return; try { if (p) await put(`/api/mobile-prompts/${p.id}`, v); else await post('/api/mobile-prompts', v); toast('保存しました', 'success'); render(); } catch (ex) { toast(ex.message, 'error'); }
  }
  route('/mobile-prompts', async (app) => {
    const main = App.mount(app, spinner(), { title: 'Mobile Prompts', siteSelector: false, actions: can('editor') ? `<button class="btn btn-primary btn-sm" id="new-mp"><i class="fas fa-plus"></i> 追加</button>` : '' });
    const ps = await get('/api/mobile-prompts');
    main.innerHTML = `<div class="table-wrap card"><table class="table"><thead><tr><th>Name</th><th>Status</th><th>Ver</th><th>Prompt</th><th>Rules</th><th>Sites</th><th></th></tr></thead><tbody>${ps.map(p => `<tr><td><strong>${esc(p.name)}</strong>${p.is_system ? ' ' + badge('system') : ''}<br><small class="text-slate-500">${esc(p.description || '')}</small></td><td><button class="badge badge-${statusColor(p.status)} mp-toggle" data-id="${p.id}" title="クリックで切替">${p.status}</button></td><td>v${p.current_version}</td><td class="max-w-xs"><div class="text-xs line-clamp-3">${esc(p.prompt)}</div></td><td class="text-xs">${Object.entries(p.rules).slice(0, 5).map(([k, v]) => `<div>${esc(k)}: <code>${esc(v)}</code></div>`).join('')}</td><td>${p.site_count}</td><td class="whitespace-nowrap">${can('editor') ? `<button class="btn btn-sm btn-secondary mp-edit" data-id="${p.id}"><i class="fas fa-pen"></i></button> <button class="btn btn-sm btn-secondary mp-dup" data-id="${p.id}"><i class="fas fa-copy"></i></button> <button class="btn btn-sm btn-secondary mp-ver" data-id="${p.id}"><i class="fas fa-clock-rotate-left"></i></button> <button class="btn btn-sm btn-ghost text-red-600 mp-del" data-id="${p.id}"><i class="fas fa-trash"></i></button>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
    app.querySelector('#new-mp')?.addEventListener('click', () => mpDialog(null));
    main.querySelectorAll('.mp-edit').forEach(b => b.onclick = () => mpDialog(ps.find(p => p.id === Number(b.dataset.id))));
    main.querySelectorAll('.mp-toggle').forEach(b => b.onclick = async () => { if (!can('editor')) return; await post(`/api/mobile-prompts/${b.dataset.id}/toggle`); render(); });
    main.querySelectorAll('.mp-dup').forEach(b => b.onclick = async () => { await post(`/api/mobile-prompts/${b.dataset.id}/duplicate`); toast('複製しました（INACTIVE）', 'success'); render(); });
    main.querySelectorAll('.mp-del').forEach(b => b.onclick = async () => { if (!await confirm('削除しますか？', { danger: true })) return; try { await del(`/api/mobile-prompts/${b.dataset.id}`); render(); } catch (ex) { toast(ex.message, 'error'); } });
    main.querySelectorAll('.mp-ver').forEach(b => b.onclick = async () => { const vs = await get(`/api/mobile-prompts/${b.dataset.id}/versions`); modal({ title: 'バージョン履歴', body: `<table class="table"><thead><tr><th>Ver</th><th>Name</th><th>Note</th><th>日時</th><th></th></tr></thead><tbody>${vs.map(v => `<tr><td>v${v.version}</td><td>${esc(v.name)}</td><td>${esc(v.note || '')}</td><td>${dt(v.created_at)}</td><td><button class="btn btn-sm btn-secondary rb" data-v="${v.id}">Rollback</button></td></tr>`).join('')}</tbody></table>`, onMount: (root, close) => root.querySelectorAll('.rb').forEach(x => x.onclick = async () => { await post(`/api/mobile-prompts/${b.dataset.id}/rollback/${x.dataset.v}`); toast('ロールバックしました', 'success'); close(); render(); }) }); });
  });

  // ================= Media =================
  route('/media', async (app) => {
    const main = App.mount(app, spinner(), { title: 'Media', actions: can('editor') ? `<label class="btn btn-primary btn-sm cursor-pointer"><i class="fas fa-upload"></i> アップロード<input type="file" id="up" class="hidden" accept="image/*" multiple></label>` : '' });
    const items = await get(`/api/media${state.currentSiteId ? '?siteId=' + state.currentSiteId : ''}`);
    main.innerHTML = `<p class="text-xs text-slate-500 mb-3">${items.length} 件。画像は公開サイトで max-width:100% + loading="lazy" で表示されます。</p><div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">${items.map(m => `<div class="card !p-2 space-y-1"><img src="${esc(m.url)}" alt="${esc(m.alt_text || '')}" class="w-full aspect-square object-cover rounded bg-slate-100" loading="lazy"><div class="text-[11px] truncate" title="${esc(m.original_name)}">${esc(m.original_name)}</div><div class="text-[10px] text-slate-500">${m.width || '?'}×${m.height || '?'} · ${fmt(m.size_bytes / 1024)}KB</div><div class="flex gap-1"><button class="btn btn-sm btn-ghost m-copy" data-url="${esc(m.url)}" title="URLコピー"><i class="fas fa-copy"></i></button>${can('editor') ? `<button class="btn btn-sm btn-ghost m-alt" data-id="${m.id}" title="alt編集"><i class="fas fa-font"></i></button><button class="btn btn-sm btn-ghost text-red-600 m-del" data-id="${m.id}"><i class="fas fa-trash"></i></button>` : ''}</div></div>`).join('') || '<div class="col-span-full card text-center text-slate-500 py-8">画像がありません</div>'}</div>`;
    app.querySelector('#up')?.addEventListener('change', async (e) => { for (const f of e.target.files) { const fd = new FormData(); fd.append('file', f); if (state.currentSiteId) fd.append('siteId', state.currentSiteId); try { await post('/api/media/upload', fd); } catch (ex) { toast(`${f.name}: ${ex.message}`, 'error'); } } toast('アップロード完了', 'success'); render(); });
    main.querySelectorAll('.m-copy').forEach(b => b.onclick = () => { navigator.clipboard?.writeText(location.origin + b.dataset.url); toast('URLをコピーしました', 'info'); });
    main.querySelectorAll('.m-alt').forEach(b => b.onclick = async () => { const m = items.find(x => x.id === Number(b.dataset.id)); const v = await prompt('alt テキスト', [{ name: 'alt_text', label: 'alt', value: m.alt_text || '' }]); if (v) { await put(`/api/media/${m.id}`, v); render(); } });
    main.querySelectorAll('.m-del').forEach(b => b.onclick = async () => { if (!await confirm('削除しますか？', { danger: true })) return; await del(`/api/media/${b.dataset.id}`); render(); });
  });
})();
