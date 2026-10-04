import { Hono } from 'hono';
import { getDb, J, P } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { body, user, logAction, notFound } from '../lib/http.js';
import { int, oneOf, assert, str } from '../lib/security.js';
import { COMPONENT_TYPES, getPageSnapshot, saveVersion, applySnapshot, mutate, undo, redo, historyState, parseComponent } from '../lib/builder.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));

function page(db, pageId) { return db.get('SELECT * FROM site_pages WHERE id=?', [pageId]); }

// Get page with components + history state
r.get('/pages/:pageId', (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  const snap = getPageSnapshot(db, pageId); if (!snap) return notFound(c, 'Page');
  const site = db.get('SELECT * FROM sites WHERE id=?', [snap.page.site_id]);
  const lastVersion = db.get('SELECT id, version, kind, created_at FROM builder_versions WHERE page_id=? ORDER BY id DESC LIMIT 1', [pageId]);
  const lastPublish = db.get("SELECT id, version, created_at FROM builder_versions WHERE page_id=? AND kind='publish' ORDER BY id DESC LIMIT 1", [pageId]);
  return c.json({ ...snap, site, history: historyState(db, pageId), lastVersion, lastPublish, componentTypes: COMPONENT_TYPES });
});

// Add component
r.post('/pages/:pageId/components', requireAuth('editor'), async (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId')); const b = await body(c);
  if (!page(db, pageId)) return notFound(c, 'Page');
  const type = oneOf(b.type, COMPONENT_TYPES, 'type');
  const id = mutate(db, pageId, user(c).id, `add:${type}`, () => {
    const position = int(b.position, { name: 'position', min: 0 });
    const comps = db.all('SELECT id, sort_order FROM site_components WHERE page_id=? ORDER BY sort_order, id', [pageId]);
    const idx = position === undefined ? comps.length : Math.min(position, comps.length);
    const res = db.run('INSERT INTO site_components(page_id,section_id,type,props,desktop_config,tablet_config,mobile_config,sort_order) VALUES(?,?,?,?,?,?,?,?)',
      [pageId, int(b.section_id, { name: 'section_id' }) ?? null, type, J(b.props || {}), J(b.desktop_config || {}), J(b.tablet_config || {}), J(b.mobile_config || {}), idx]);
    // renumber
    const ids = comps.map(x => x.id); ids.splice(idx, 0, res.lastInsertRowid);
    ids.forEach((cid, i) => db.run('UPDATE site_components SET sort_order=? WHERE id=?', [i, cid]));
    return res.lastInsertRowid;
  });
  logAction(c, 'COMPONENT_ADD', 'site_component', id, { type, pageId });
  return c.json({ component: parseComponent(db.get('SELECT * FROM site_components WHERE id=?', [id])), history: historyState(db, pageId) }, 201);
});

// Update component (props / configs)
r.put('/pages/:pageId/components/:cid', requireAuth('editor'), async (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId')); const cid = Number(c.req.param('cid')); const b = await body(c);
  const cur = db.get('SELECT * FROM site_components WHERE id=? AND page_id=?', [cid, pageId]); if (!cur) return notFound(c, 'Component');
  mutate(db, pageId, user(c).id, `edit:${cur.type}`, () => {
    db.run(`UPDATE site_components SET props=?, desktop_config=?, tablet_config=?, mobile_config=?, section_id=?, sort_order_tablet=?, sort_order_mobile=?, updated_at=datetime('now') WHERE id=?`,
      [J(b.props !== undefined ? b.props : P(cur.props, {})), J(b.desktop_config !== undefined ? b.desktop_config : P(cur.desktop_config, {})),
        J(b.tablet_config !== undefined ? b.tablet_config : P(cur.tablet_config, {})), J(b.mobile_config !== undefined ? b.mobile_config : P(cur.mobile_config, {})),
        b.section_id !== undefined ? int(b.section_id, { name: 'section_id' }) ?? null : cur.section_id,
        b.sort_order_tablet !== undefined ? int(b.sort_order_tablet, { name: 'sort_order_tablet' }) ?? null : cur.sort_order_tablet,
        b.sort_order_mobile !== undefined ? int(b.sort_order_mobile, { name: 'sort_order_mobile' }) ?? null : cur.sort_order_mobile, cid]);
  });
  return c.json({ component: parseComponent(db.get('SELECT * FROM site_components WHERE id=?', [cid])), history: historyState(db, pageId) });
});

// Delete component
r.delete('/pages/:pageId/components/:cid', requireAuth('editor'), (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId')); const cid = Number(c.req.param('cid'));
  const cur = db.get('SELECT * FROM site_components WHERE id=? AND page_id=?', [cid, pageId]); if (!cur) return notFound(c, 'Component');
  mutate(db, pageId, user(c).id, `delete:${cur.type}`, () => {
    db.run('DELETE FROM site_components WHERE id=?', [cid]);
    db.all('SELECT id FROM site_components WHERE page_id=? ORDER BY sort_order, id', [pageId]).forEach((x, i) => db.run('UPDATE site_components SET sort_order=? WHERE id=?', [i, x.id]));
  });
  logAction(c, 'COMPONENT_DELETE', 'site_component', cid, { pageId });
  return c.json({ ok: true, history: historyState(db, pageId) });
});

// Reorder (drag & drop): body { order: [componentId,...], device?: 'desktop'|'tablet'|'mobile' }
r.post('/pages/:pageId/reorder', requireAuth('editor'), async (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId')); const b = await body(c);
  assert(Array.isArray(b.order) && b.order.length > 0, 'order array required');
  const device = oneOf(b.device || 'desktop', ['desktop', 'tablet', 'mobile'], 'device');
  const col = device === 'desktop' ? 'sort_order' : device === 'tablet' ? 'sort_order_tablet' : 'sort_order_mobile';
  const existing = new Set(db.all('SELECT id FROM site_components WHERE page_id=?', [pageId]).map(x => x.id));
  assert(b.order.every(id => existing.has(Number(id))), 'order contains unknown component ids');
  mutate(db, pageId, user(c).id, `reorder:${device}`, () => {
    b.order.forEach((id, i) => db.run(`UPDATE site_components SET ${col}=?, updated_at=datetime('now') WHERE id=?`, [i, Number(id)]));
  });
  logAction(c, 'COMPONENT_REORDER', 'site_page', pageId, { device });
  return c.json({ ok: true, history: historyState(db, pageId) });
});

// Move one component to a position (alternative to reorder)
r.post('/pages/:pageId/components/:cid/move', requireAuth('editor'), async (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId')); const cid = Number(c.req.param('cid')); const b = await body(c);
  const to = int(b.position, { name: 'position', min: 0, required: true });
  const ids = db.all('SELECT id FROM site_components WHERE page_id=? ORDER BY sort_order, id', [pageId]).map(x => x.id);
  const from = ids.indexOf(cid); assert(from !== -1, 'component not found', 404);
  mutate(db, pageId, user(c).id, 'move', () => {
    ids.splice(from, 1); ids.splice(Math.min(to, ids.length), 0, cid);
    ids.forEach((id, i) => db.run('UPDATE site_components SET sort_order=? WHERE id=?', [i, id]));
  });
  return c.json({ ok: true, history: historyState(db, pageId) });
});

// Undo / Redo
r.post('/pages/:pageId/undo', requireAuth('editor'), (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  const out = undo(db, pageId);
  return c.json({ ...out, history: historyState(db, pageId), snapshot: getPageSnapshot(db, pageId) });
});
r.post('/pages/:pageId/redo', requireAuth('editor'), (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  const out = redo(db, pageId);
  return c.json({ ...out, history: historyState(db, pageId), snapshot: getPageSnapshot(db, pageId) });
});

// Autosave (creates autosave version; never publishes)
r.post('/pages/:pageId/autosave', requireAuth('editor'), (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  const p = page(db, pageId); if (!p) return notFound(c, 'Page');
  const v = saveVersion(db, p.site_id, pageId, 'autosave', 'Autosave', user(c).id);
  return c.json({ ok: true, ...v, kind: 'autosave', published: false });
});
// Manual save
r.post('/pages/:pageId/save', requireAuth('editor'), async (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId')); const b = await body(c);
  const p = page(db, pageId); if (!p) return notFound(c, 'Page');
  const v = saveVersion(db, p.site_id, pageId, 'manual', str(b.note || 'Manual save', { max: 200 }), user(c).id);
  logAction(c, 'BUILDER_SAVE', 'site_page', pageId, v);
  return c.json({ ok: true, ...v, kind: 'manual' });
});
// Publish single page
r.post('/pages/:pageId/publish', requireAuth('editor'), (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  const p = page(db, pageId); if (!p) return notFound(c, 'Page');
  const v = db.transaction(() => {
    const v = saveVersion(db, p.site_id, pageId, 'publish', 'Publish', user(c).id);
    db.run("UPDATE site_pages SET status='published', updated_at=datetime('now') WHERE id=?", [pageId]);
    db.run("UPDATE sites SET status='published', updated_at=datetime('now') WHERE id=?", [p.site_id]);
    return v;
  });
  logAction(c, 'PAGE_PUBLISH', 'site_page', pageId, v);
  return c.json({ ok: true, ...v, kind: 'publish' });
});

// Versions
r.get('/pages/:pageId/versions', (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  return c.json(db.all('SELECT v.id, v.version, v.kind, v.note, v.created_at, u.email as created_by_email FROM builder_versions v LEFT JOIN users u ON u.id=v.created_by WHERE v.page_id=? ORDER BY v.version DESC', [pageId]));
});
r.get('/pages/:pageId/versions/:vid', (c) => {
  const db = getDb();
  const v = db.get('SELECT * FROM builder_versions WHERE id=? AND page_id=?', [c.req.param('vid'), c.req.param('pageId')]); if (!v) return notFound(c, 'Version');
  return c.json({ ...v, snapshot: P(v.snapshot, null) });
});
r.post('/pages/:pageId/versions/:vid/rollback', requireAuth('editor'), (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  const v = db.get('SELECT * FROM builder_versions WHERE id=? AND page_id=?', [c.req.param('vid'), pageId]); if (!v) return notFound(c, 'Version');
  const p = page(db, pageId);
  mutate(db, pageId, user(c).id, `rollback:v${v.version}`, () => applySnapshot(db, pageId, P(v.snapshot, {})));
  const nv = saveVersion(db, p.site_id, pageId, 'rollback', `Rollback to v${v.version}`, user(c).id);
  logAction(c, 'BUILDER_ROLLBACK', 'site_page', pageId, { from: v.version, newVersion: nv.version });
  return c.json({ ok: true, restoredFrom: v.version, ...nv, snapshot: getPageSnapshot(db, pageId), history: historyState(db, pageId) });
});

// History list
r.get('/pages/:pageId/history', (c) => {
  const db = getDb();
  return c.json(db.all('SELECT id, action, position, is_undone, created_at FROM builder_history WHERE page_id=? ORDER BY position DESC LIMIT 100', [c.req.param('pageId')]));
});

// Sections
r.post('/pages/:pageId/sections', requireAuth('editor'), async (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId')); const b = await body(c);
  const id = mutate(db, pageId, user(c).id, 'add:section', () => db.run('INSERT INTO site_sections(page_id,name,sort_order,desktop_config,tablet_config,mobile_config) VALUES(?,?,?,?,?,?)',
    [pageId, str(b.name || 'Section', { max: 100 }), int(b.sort_order, { name: 'sort_order' }) ?? 0, J(b.desktop_config || {}), J(b.tablet_config || {}), J(b.mobile_config || {})]).lastInsertRowid);
  return c.json(db.get('SELECT * FROM site_sections WHERE id=?', [id]), 201);
});
r.delete('/pages/:pageId/sections/:sid', requireAuth('editor'), (c) => {
  const db = getDb(); const pageId = Number(c.req.param('pageId'));
  mutate(db, pageId, user(c).id, 'delete:section', () => db.run('DELETE FROM site_sections WHERE id=? AND page_id=?', [c.req.param('sid'), pageId]));
  return c.json({ ok: true });
});

export default r;
