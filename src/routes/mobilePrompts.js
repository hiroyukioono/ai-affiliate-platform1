import { Hono } from 'hono';
import { getDb, J, P } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { body, user, logAction, notFound } from '../lib/http.js';
import { str, oneOf, assert } from '../lib/security.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));
const parse = (p) => p && ({ ...p, rules: P(p.rules, {}) });

r.get('/', (c) => c.json(getDb().all('SELECT p.*, (SELECT COUNT(*) FROM sites s WHERE s.mobile_prompt_id=p.id) AS site_count FROM mobile_design_prompts p ORDER BY p.id').map(parse)));
r.get('/:id', (c) => { const p = getDb().get('SELECT * FROM mobile_design_prompts WHERE id=?', [c.req.param('id')]); return p ? c.json(parse(p)) : notFound(c, 'Prompt'); });
r.get('/:id/versions', (c) => c.json(getDb().all('SELECT id,version,name,note,created_at FROM mobile_prompt_versions WHERE prompt_id=? ORDER BY version DESC', [c.req.param('id')]).map(parse)));
r.get('/:id/versions/:vid', (c) => { const v = getDb().get('SELECT * FROM mobile_prompt_versions WHERE id=? AND prompt_id=?', [c.req.param('vid'), c.req.param('id')]); return v ? c.json(parse(v)) : notFound(c, 'Version'); });

function insertVersion(db, p, note, userId) {
  db.run('INSERT INTO mobile_prompt_versions(prompt_id,version,name,description,prompt,rules,note,created_by) VALUES(?,?,?,?,?,?,?,?)',
    [p.id, p.current_version, p.name, p.description, p.prompt, p.rules, note, userId]);
}

r.post('/', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb();
  const name = str(b.name, { name: 'name', required: true, max: 100 });
  const prompt = str(b.prompt, { name: 'prompt', required: true, max: 8000 });
  const status = oneOf(b.status || 'ACTIVE', ['ACTIVE', 'INACTIVE'], 'status');
  const res = db.run('INSERT INTO mobile_design_prompts(name,description,prompt,rules,status,created_by) VALUES(?,?,?,?,?,?)', [name, b.description || null, prompt, J(b.rules || {}), status, user(c).id]);
  insertVersion(db, db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [res.lastInsertRowid]), 'Created', user(c).id);
  logAction(c, 'MOBILE_PROMPT_CREATE', 'mobile_design_prompt', res.lastInsertRowid);
  return c.json(parse(db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [res.lastInsertRowid])), 201);
});

r.put('/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const id = Number(c.req.param('id'));
  const p = db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [id]); if (!p) return notFound(c, 'Prompt');
  const contentChanged = (b.prompt !== undefined && b.prompt !== p.prompt) || (b.rules !== undefined && J(b.rules) !== p.rules) || (b.name !== undefined && b.name !== p.name) || (b.description !== undefined && b.description !== p.description);
  const version = contentChanged ? p.current_version + 1 : p.current_version;
  db.run("UPDATE mobile_design_prompts SET name=?,description=?,prompt=?,rules=?,status=?,current_version=?,updated_at=datetime('now') WHERE id=?",
    [b.name ? str(b.name, { max: 100 }) : p.name, b.description ?? p.description, b.prompt !== undefined ? str(b.prompt, { max: 8000 }) : p.prompt, b.rules !== undefined ? J(b.rules) : p.rules,
      b.status ? oneOf(b.status, ['ACTIVE', 'INACTIVE'], 'status') : p.status, version, id]);
  if (contentChanged) insertVersion(db, db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [id]), b.note || 'Updated', user(c).id);
  logAction(c, 'MOBILE_PROMPT_UPDATE', 'mobile_design_prompt', id, { version });
  return c.json(parse(db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [id])));
});

r.post('/:id/toggle', requireAuth('editor'), (c) => {
  const db = getDb(); const id = Number(c.req.param('id'));
  const p = db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [id]); if (!p) return notFound(c, 'Prompt');
  const status = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  db.run("UPDATE mobile_design_prompts SET status=?, updated_at=datetime('now') WHERE id=?", [status, id]);
  logAction(c, 'MOBILE_PROMPT_TOGGLE', 'mobile_design_prompt', id, { status });
  return c.json({ id, status });
});

r.post('/:id/duplicate', requireAuth('editor'), (c) => {
  const db = getDb(); const p = db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [c.req.param('id')]); if (!p) return notFound(c, 'Prompt');
  const res = db.run('INSERT INTO mobile_design_prompts(name,description,prompt,rules,status,created_by) VALUES(?,?,?,?,?,?)', [`${p.name} (Copy)`, p.description, p.prompt, p.rules, 'INACTIVE', user(c).id]);
  insertVersion(db, db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [res.lastInsertRowid]), `Duplicated from #${p.id}`, user(c).id);
  logAction(c, 'MOBILE_PROMPT_DUPLICATE', 'mobile_design_prompt', res.lastInsertRowid, { from: p.id });
  return c.json(parse(db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [res.lastInsertRowid])), 201);
});

r.post('/:id/rollback/:vid', requireAuth('editor'), (c) => {
  const db = getDb(); const id = Number(c.req.param('id'));
  const v = db.get('SELECT * FROM mobile_prompt_versions WHERE id=? AND prompt_id=?', [c.req.param('vid'), id]); if (!v) return notFound(c, 'Version');
  const p = db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [id]);
  db.run("UPDATE mobile_design_prompts SET name=?,description=?,prompt=?,rules=?,current_version=?,updated_at=datetime('now') WHERE id=?", [v.name, v.description, v.prompt, v.rules, p.current_version + 1, id]);
  insertVersion(db, db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [id]), `Rollback to v${v.version}`, user(c).id);
  logAction(c, 'MOBILE_PROMPT_ROLLBACK', 'mobile_design_prompt', id, { to: v.version });
  return c.json(parse(db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [id])));
});

r.delete('/:id', requireAuth('editor'), (c) => {
  const db = getDb(); const id = Number(c.req.param('id'));
  const p = db.get('SELECT * FROM mobile_design_prompts WHERE id=?', [id]); if (!p) return notFound(c, 'Prompt');
  const inUse = db.get('SELECT COUNT(*) n FROM sites WHERE mobile_prompt_id=?', [id]).n;
  assert(!inUse, `このPromptは ${inUse} サイトで使用中のため削除できません`, 409);
  db.run('DELETE FROM mobile_design_prompts WHERE id=?', [id]);
  logAction(c, 'MOBILE_PROMPT_DELETE', 'mobile_design_prompt', id);
  return c.json({ ok: true });
});

export default r;
