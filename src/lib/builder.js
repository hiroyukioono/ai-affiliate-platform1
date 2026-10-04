// Site Builder core: page snapshots, versions, undo/redo history, apply snapshot.
import { getDb, J, P } from '../db/index.js';

export const COMPONENT_TYPES = ['heading', 'text', 'image', 'button', 'cta', 'affiliate_ad', 'product', 'comparison_table', 'ranking', 'article', 'faq', 'search', 'banner', 'spacer', 'divider', 'html', 'video'];

export function parseComponent(row) {
  if (!row) return row;
  return { ...row, props: P(row.props, {}), desktop_config: P(row.desktop_config, {}), tablet_config: P(row.tablet_config, {}), mobile_config: P(row.mobile_config, {}) };
}

export function getPageSnapshot(db, pageId) {
  const page = db.get('SELECT * FROM site_pages WHERE id=?', [pageId]);
  if (!page) return null;
  const sections = db.all('SELECT * FROM site_sections WHERE page_id=? ORDER BY sort_order, id', [pageId]).map(s => ({ ...s, desktop_config: P(s.desktop_config, {}), tablet_config: P(s.tablet_config, {}), mobile_config: P(s.mobile_config, {}) }));
  const components = db.all('SELECT * FROM site_components WHERE page_id=? ORDER BY sort_order, id', [pageId]).map(parseComponent);
  return { page: { ...page, structured_data: P(page.structured_data, null) }, sections, components };
}

// Replace page content with a snapshot (used by undo/redo/rollback/ai apply). Keeps component IDs when possible.
export function applySnapshot(db, pageId, snap) {
  db.transaction(() => {
    const p = snap.page || {};
    db.run(`UPDATE site_pages SET title=COALESCE(?,title), seo_title=?, meta_description=?, canonical_url=?, robots=COALESCE(?,robots), og_image=?, structured_data=?, updated_at=datetime('now') WHERE id=?`,
      [p.title ?? null, p.seo_title ?? null, p.meta_description ?? null, p.canonical_url ?? null, p.robots ?? null, p.og_image ?? null, p.structured_data ? J(p.structured_data) : null, pageId]);
    db.run('DELETE FROM site_components WHERE page_id=?', [pageId]);
    db.run('DELETE FROM site_sections WHERE page_id=?', [pageId]);
    for (const s of snap.sections || []) {
      db.run('INSERT INTO site_sections(id,page_id,name,sort_order,desktop_config,tablet_config,mobile_config) VALUES(?,?,?,?,?,?,?)',
        [s.id || null, pageId, s.name || 'Section', s.sort_order || 0, J(s.desktop_config || {}), J(s.tablet_config || {}), J(s.mobile_config || {})]);
    }
    (snap.components || []).forEach((cp, i) => {
      db.run(`INSERT INTO site_components(id,page_id,section_id,type,props,desktop_config,tablet_config,mobile_config,sort_order,sort_order_tablet,sort_order_mobile)
              VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
        [cp.id || null, pageId, cp.section_id || null, cp.type, J(cp.props || {}), J(cp.desktop_config || {}), J(cp.tablet_config || {}), J(cp.mobile_config || {}),
          cp.sort_order ?? i, cp.sort_order_tablet ?? null, cp.sort_order_mobile ?? null]);
    });
  });
}

export function saveVersion(db, siteId, pageId, kind, note, userId) {
  const snap = getPageSnapshot(db, pageId);
  const last = db.get('SELECT MAX(version) v FROM builder_versions WHERE page_id=?', [pageId]);
  const version = (last?.v || 0) + 1;
  const r = db.run('INSERT INTO builder_versions(site_id,page_id,version,snapshot,kind,note,created_by) VALUES(?,?,?,?,?,?,?)',
    [siteId, pageId, version, J(snap), kind, note || null, userId || null]);
  // Keep autosaves bounded (latest 30 autosave versions per page)
  if (kind === 'autosave') {
    db.run(`DELETE FROM builder_versions WHERE page_id=? AND kind='autosave' AND id NOT IN (SELECT id FROM builder_versions WHERE page_id=? AND kind='autosave' ORDER BY id DESC LIMIT 30)`, [pageId, pageId]);
  }
  return { id: r.lastInsertRowid, version };
}

// History: record before/after around a mutation. Position-based stack; redo entries are discarded on new action.
export function recordHistory(db, pageId, userId, action, beforeSnap, afterSnap) {
  db.run('DELETE FROM builder_history WHERE page_id=? AND is_undone=1', [pageId]);
  const last = db.get('SELECT MAX(position) p FROM builder_history WHERE page_id=?', [pageId]);
  const position = (last?.p || 0) + 1;
  db.run('INSERT INTO builder_history(page_id,user_id,action,before_state,after_state,position) VALUES(?,?,?,?,?,?)',
    [pageId, userId || null, action, J(beforeSnap), J(afterSnap), position]);
  // bound history to 100 entries
  db.run('DELETE FROM builder_history WHERE page_id=? AND id NOT IN (SELECT id FROM builder_history WHERE page_id=? ORDER BY position DESC LIMIT 100)', [pageId, pageId]);
  return position;
}

export function undo(db, pageId) {
  const entry = db.get('SELECT * FROM builder_history WHERE page_id=? AND is_undone=0 ORDER BY position DESC LIMIT 1', [pageId]);
  if (!entry) return { ok: false, message: 'Undoできる操作がありません' };
  applySnapshot(db, pageId, P(entry.before_state, {}));
  db.run('UPDATE builder_history SET is_undone=1 WHERE id=?', [entry.id]);
  return { ok: true, action: entry.action, position: entry.position };
}

export function redo(db, pageId) {
  const entry = db.get('SELECT * FROM builder_history WHERE page_id=? AND is_undone=1 ORDER BY position ASC LIMIT 1', [pageId]);
  if (!entry) return { ok: false, message: 'Redoできる操作がありません' };
  applySnapshot(db, pageId, P(entry.after_state, {}));
  db.run('UPDATE builder_history SET is_undone=0 WHERE id=?', [entry.id]);
  return { ok: true, action: entry.action, position: entry.position };
}

export function historyState(db, pageId) {
  const canUndo = !!db.get('SELECT id FROM builder_history WHERE page_id=? AND is_undone=0 LIMIT 1', [pageId]);
  const canRedo = !!db.get('SELECT id FROM builder_history WHERE page_id=? AND is_undone=1 LIMIT 1', [pageId]);
  return { canUndo, canRedo };
}

// Wrap a mutation so that history is recorded automatically.
export function mutate(db, pageId, userId, action, fn) {
  const before = getPageSnapshot(db, pageId);
  const out = db.transaction(() => fn());
  const after = getPageSnapshot(db, pageId);
  recordHistory(db, pageId, userId, action, before, after);
  return out;
}

// Default components for a brand-new page
export function defaultComponents(title) {
  return [
    { type: 'heading', props: { text: title, level: 1 } },
    { type: 'text', props: { html: '<p>ここに本文を入力してください。</p>' } },
    { type: 'cta', props: { title: '今すぐチェック', text: '公式サイトで詳細を確認する', buttonText: '公式サイトへ', url: '#' }, desktop_config: { width: '320px' }, tablet_config: { width: '80%' }, mobile_config: { width: '100%' } }
  ];
}
