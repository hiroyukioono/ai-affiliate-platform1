import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { login, destroySession, requireAuth, hashPassword, verifyPassword, validatePasswordPolicy, PASSWORD_POLICY_TEXT, rotateSession, publicUser, clientIp } from '../lib/auth.js';
import { body, user, logAction } from '../lib/http.js';
import { str, oneOf, assert, rateLimit } from '../lib/security.js';
import { publicConfig } from '../config.js';

const r = new Hono();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const normEmail = (e) => String(e || '').trim().toLowerCase();
const GENERIC_AUTH_FAIL = '現在のパスワードが正しくありません';
const SUCCESS_MSG = '管理者アカウント情報を更新しました。';

r.post('/login', async (c) => {
  const b = await body(c);
  str(b.email, { name: 'email', required: true, max: 200 });
  str(b.password, { name: 'password', required: true, max: 200 });
  const out = login(c, b.email, b.password); // generic error message on any failure (no account enumeration)
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

r.get('/password-policy', (c) => c.json({ text: PASSWORD_POLICY_TEXT }));

// ---------------- Own account management (any authenticated user) ----------------
function maskEmail(email) {
  const [local = '', domain = ''] = String(email).split('@');
  const dot = domain.lastIndexOf('.');
  const tld = dot > 0 ? domain.slice(dot) : '';
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(4, local.length - 2))}@${domain.slice(0, 1)}${'*'.repeat(Math.max(4, domain.length - tld.length - 1))}${tld}`;
}

r.get('/account', requireAuth('viewer'), (c) => {
  const db = getDb();
  const u = db.get('SELECT id,email,name,role,must_change_password,password_changed_at,last_login_at,created_at FROM users WHERE id=?', [user(c).id]);
  return c.json({ ...publicUser(u), email_masked: maskEmail(u.email), password_changed_at: u.password_changed_at, last_login_at: u.last_login_at, created_at: u.created_at, password_policy: PASSWORD_POLICY_TEXT });
});

// Brute-force protection for credential changes: 8 attempts / 10 min per IP+user
function accountRateLimit(c) {
  const rl = rateLimit(getDb(), `account:${clientIp(c)}:${user(c).id}`, 8, 600);
  if (!rl.allowed) { const e = new Error(`試行回数が多すぎます。${rl.retryAfter}秒後に再試行してください`); e.status = 429; throw e; }
}

// Change e-mail (requires current password)
r.put('/account/email', requireAuth('viewer'), async (c) => {
  accountRateLimit(c);
  const b = await body(c); const db = getDb();
  const me = db.get('SELECT * FROM users WHERE id=?', [user(c).id]);
  const currentPassword = str(b.current_password, { name: 'current_password', required: true, max: 200 });
  const newEmail = normEmail(str(b.new_email, { name: 'new_email', required: true, min: 5, max: 200 }));
  assert(EMAIL_RE.test(newEmail) && !/[<>"'`\s]/.test(newEmail), 'メールアドレスの形式が正しくありません');
  assert(newEmail !== me.email, '現在と同じメールアドレスです');
  if (!verifyPassword(currentPassword, me.password_hash)) { logAction(c, 'ACCOUNT_EMAIL_CHANGE_FAILED', 'user', me.id); assert(false, GENERIC_AUTH_FAIL, 401); }
  assert(!db.get('SELECT id FROM users WHERE email=? AND id!=?', [newEmail, me.id]), 'このメールアドレスは使用できません', 409);
  db.run("UPDATE users SET email=?, updated_at=datetime('now') WHERE id=?", [newEmail, me.id]);
  logAction(c, 'ACCOUNT_EMAIL_CHANGED', 'user', me.id); // values intentionally not logged
  const sess = rotateSession(c, { id: me.id }, { revokeOthers: true });
  return c.json({ ok: true, message: SUCCESS_MSG, csrf: sess.csrf, user: publicUser(db.get('SELECT * FROM users WHERE id=?', [me.id])) });
});

// Change password (current password + confirmation + policy). Rotates session and revokes all other sessions.
r.put('/account/password', requireAuth('viewer'), async (c) => {
  accountRateLimit(c);
  const b = await body(c); const db = getDb();
  const me = db.get('SELECT * FROM users WHERE id=?', [user(c).id]);
  const currentPassword = str(b.current_password, { name: 'current_password', required: true, max: 200 });
  const newPassword = str(b.new_password, { name: 'new_password', required: true, max: 200 });
  const confirm = str(b.new_password_confirm, { name: 'new_password_confirm', required: true, max: 200 });
  assert(newPassword === confirm, '新しいパスワードと確認用パスワードが一致しません');
  const policy = validatePasswordPolicy(newPassword, { email: me.email });
  assert(policy.ok, 'パスワードポリシー: ' + policy.errors.join(' / '));
  if (!verifyPassword(currentPassword, me.password_hash)) { logAction(c, 'ACCOUNT_PASSWORD_CHANGE_FAILED', 'user', me.id); assert(false, GENERIC_AUTH_FAIL, 401); }
  assert(!verifyPassword(newPassword, me.password_hash), '新しいパスワードは現在のパスワードと異なるものにしてください');
  db.run("UPDATE users SET password_hash=?, must_change_password=0, password_changed_at=datetime('now'), updated_at=datetime('now') WHERE id=?", [hashPassword(newPassword), me.id]);
  logAction(c, 'ACCOUNT_PASSWORD_CHANGED', 'user', me.id);
  const sess = rotateSession(c, { id: me.id }, { revokeOthers: true });
  return c.json({ ok: true, message: SUCCESS_MSG, csrf: sess.csrf, user: publicUser(db.get('SELECT * FROM users WHERE id=?', [me.id])) });
});

// ---------------- User management (admin only) ----------------
r.get('/users', requireAuth('admin'), (c) => {
  return c.json(getDb().all('SELECT id,email,name,role,is_active,must_change_password,password_changed_at,last_login_at,created_at FROM users ORDER BY id'));
});
r.post('/users', requireAuth('admin'), async (c) => {
  const b = await body(c);
  const email = normEmail(str(b.email, { name: 'email', required: true, max: 200 })); assert(EMAIL_RE.test(email), 'メールアドレスの形式が正しくありません');
  str(b.name, { name: 'name', required: true, max: 100 });
  str(b.password, { name: 'password', required: true, max: 200 });
  const pol = validatePasswordPolicy(b.password, { email }); assert(pol.ok, 'パスワードポリシー: ' + pol.errors.join(' / '));
  oneOf(b.role, ['admin', 'editor', 'viewer'], 'role');
  const db = getDb();
  assert(!db.get('SELECT id FROM users WHERE email=?', [email]), 'このメールアドレスは使用できません', 409);
  // Users created by an admin must change the handed-over password on first login
  const res = db.run('INSERT INTO users(email,name,password_hash,role,must_change_password) VALUES(?,?,?,?,1)', [email, b.name, hashPassword(b.password), b.role]);
  logAction(c, 'USER_CREATE', 'user', res.lastInsertRowid, { role: b.role });
  return c.json({ id: res.lastInsertRowid }, 201);
});
r.put('/users/:id', requireAuth('admin'), async (c) => {
  const id = Number(c.req.param('id')); const b = await body(c); const db = getDb();
  const u = db.get('SELECT * FROM users WHERE id=?', [id]); assert(u, 'user not found', 404);
  const role = b.role ? oneOf(b.role, ['admin', 'editor', 'viewer'], 'role') : u.role;
  const name = b.name ? str(b.name, { name: 'name', max: 100 }) : u.name;
  const isActive = b.is_active === undefined ? u.is_active : (b.is_active ? 1 : 0);
  assert(!(id === user(c).id && (role !== 'admin' || !isActive)), '自分自身の権限降格・無効化はできません');
  let hash = u.password_hash, mustChange = u.must_change_password;
  if (b.password) {
    str(b.password, { name: 'password', max: 200 });
    const pol = validatePasswordPolicy(b.password, { email: u.email }); assert(pol.ok, 'パスワードポリシー: ' + pol.errors.join(' / '));
    hash = hashPassword(b.password); mustChange = 1;
    db.run('DELETE FROM sessions WHERE user_id=?', [id]); // admin reset: force re-login
  }
  db.run("UPDATE users SET name=?, role=?, is_active=?, password_hash=?, must_change_password=?, updated_at=datetime('now') WHERE id=?", [name, role, isActive, hash, mustChange, id]);
  logAction(c, 'USER_UPDATE', 'user', id, { role, is_active: isActive, password_reset: !!b.password });
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
