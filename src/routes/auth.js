import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { login, destroySession, requireAuth, hashPassword } from '../lib/auth.js';
import { body, user, logAction } from '../lib/http.js';
import { str, oneOf, assert } from '../lib/security.js';
import { publicConfig } from '../config.js';

const r = new Hono();

r.post('/login', async (c) => {
  const b = await body(c);
  str(b.email, { name: 'email', required: true, max: 200 });
  str(b.password, { name: 'password', required: true, max: 200 });
  const out = login(c, b.email, b.password);
  return c.json({ ok: true, ...out });
});

r.post('/logout', (c) => {
  const u = user(c);
  if (u) logAction(c, 'LOGOUT', 'user', u.id);
  destroySession(c);
  return c.json({ ok: true });
});

r.get('/me', (c) => {
  const s = c.get('session');
  if (!s) return c.json({ authenticated: false, config: publicConfig() });
  return c.json({ authenticated: true, user: s.user, csrf: s.csrf, config: publicConfig() });
});

// User management (admin only)
r.get('/users', requireAuth('admin'), (c) => {
  return c.json(getDb().all('SELECT id,email,name,role,is_active,last_login_at,created_at FROM users ORDER BY id'));
});
r.post('/users', requireAuth('admin'), async (c) => {
  const b = await body(c);
  str(b.email, { name: 'email', required: true, max: 200 }); assert(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email), 'invalid email');
  str(b.name, { name: 'name', required: true, max: 100 });
  str(b.password, { name: 'password', required: true, min: 8, max: 200 });
  oneOf(b.role, ['admin', 'editor', 'viewer'], 'role');
  const db = getDb();
  assert(!db.get('SELECT id FROM users WHERE email=?', [b.email.toLowerCase()]), 'email already exists', 409);
  const res = db.run('INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)', [b.email.toLowerCase(), b.name, hashPassword(b.password), b.role]);
  logAction(c, 'USER_CREATE', 'user', res.lastInsertRowid, { email: b.email, role: b.role });
  return c.json({ id: res.lastInsertRowid }, 201);
});
r.put('/users/:id', requireAuth('admin'), async (c) => {
  const id = Number(c.req.param('id')); const b = await body(c); const db = getDb();
  const u = db.get('SELECT * FROM users WHERE id=?', [id]); assert(u, 'user not found', 404);
  const role = b.role ? oneOf(b.role, ['admin', 'editor', 'viewer'], 'role') : u.role;
  const name = b.name ? str(b.name, { name: 'name', max: 100 }) : u.name;
  const isActive = b.is_active === undefined ? u.is_active : (b.is_active ? 1 : 0);
  let hash = u.password_hash;
  if (b.password) { str(b.password, { name: 'password', min: 8, max: 200 }); hash = hashPassword(b.password); }
  db.run("UPDATE users SET name=?, role=?, is_active=?, password_hash=?, updated_at=datetime('now') WHERE id=?", [name, role, isActive, hash, id]);
  logAction(c, 'USER_UPDATE', 'user', id, { role, is_active: isActive });
  return c.json({ ok: true });
});
r.delete('/users/:id', requireAuth('admin'), (c) => {
  const id = Number(c.req.param('id')); assert(id !== user(c).id, 'cannot delete yourself');
  getDb().run('DELETE FROM users WHERE id=?', [id]);
  logAction(c, 'USER_DELETE', 'user', id);
  return c.json({ ok: true });
});

r.get('/audit-logs', requireAuth('admin'), (c) => {
  const limit = Math.min(Number(c.req.query('limit') || 100), 500);
  return c.json(getDb().all('SELECT a.*, u.email FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.id DESC LIMIT ?', [limit]));
});

export default r;
