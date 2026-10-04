import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { getDb, now } from '../db/index.js';
import { randomToken, hashPassword, verifyPassword, rateLimit } from './security.js';
import { config } from '../config.js';

const SESSION_COOKIE = 'aap_sid';
const SESSION_TTL_SEC = 60 * 60 * 12; // 12h

export const ROLE_RANK = { viewer: 1, editor: 2, admin: 3 };

export function audit(db, userId, action, entity = null, entityId = null, detail = null, ip = null) {
  db.run('INSERT INTO audit_logs(user_id,action,entity,entity_id,detail,ip) VALUES(?,?,?,?,?,?)',
    [userId, action, entity, entityId, detail ? (typeof detail === 'string' ? detail : JSON.stringify(detail)) : null, ip]);
}

export function clientIp(c) {
  return c.req.header('x-forwarded-for')?.split(',')[0].trim() || c.req.header('x-real-ip') || c.env?.incoming?.socket?.remoteAddress || 'local';
}

export function createSession(c, user) {
  const db = getDb();
  const sid = randomToken(32);
  const csrf = randomToken(24);
  const expires = new Date(Date.now() + SESSION_TTL_SEC * 1000).toISOString().replace('T', ' ').slice(0, 19);
  db.run('INSERT INTO sessions(id,user_id,csrf_token,ip,user_agent,expires_at) VALUES(?,?,?,?,?,?)',
    [sid, user.id, csrf, clientIp(c), (c.req.header('user-agent') || '').slice(0, 300), expires]);
  db.run('UPDATE users SET last_login_at=? WHERE id=?', [now(), user.id]);
  setCookie(c, SESSION_COOKIE, sid, { httpOnly: true, sameSite: 'Lax', secure: config.isProd, path: '/', maxAge: SESSION_TTL_SEC });
  return { sid, csrf };
}

export function destroySession(c) {
  const sid = getCookie(c, SESSION_COOKIE);
  if (sid) getDb().run('DELETE FROM sessions WHERE id=?', [sid]);
  deleteCookie(c, SESSION_COOKIE, { path: '/' });
}

export function loadSession(c) {
  const sid = getCookie(c, SESSION_COOKIE);
  if (!sid) return null;
  const db = getDb();
  const row = db.get(`SELECT s.id as sid, s.csrf_token, s.expires_at, u.id, u.email, u.name, u.role, u.is_active
                      FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=?`, [sid]);
  if (!row) return null;
  if (row.expires_at < now() || !row.is_active) { db.run('DELETE FROM sessions WHERE id=?', [sid]); return null; }
  return { sid: row.sid, csrf: row.csrf_token, user: { id: row.id, email: row.email, name: row.name, role: row.role } };
}

// Middleware: attach session to context
export function sessionMiddleware() {
  return async (c, next) => {
    c.set('session', loadSession(c));
    await next();
  };
}

// Middleware: require auth (and optional minimum role). Also enforces CSRF for mutating requests.
export function requireAuth(minRole = 'viewer') {
  return async (c, next) => {
    const s = c.get('session');
    if (!s) return c.json({ error: 'UNAUTHORIZED', message: 'ログインが必要です' }, 401);
    if (ROLE_RANK[s.user.role] < ROLE_RANK[minRole]) {
      audit(getDb(), s.user.id, 'FORBIDDEN', 'route', null, { path: c.req.path, method: c.req.method, needed: minRole }, clientIp(c));
      return c.json({ error: 'FORBIDDEN', message: `この操作には ${minRole} 以上の権限が必要です` }, 403);
    }
    if (!['GET', 'HEAD', 'OPTIONS'].includes(c.req.method)) {
      const token = c.req.header('x-csrf-token');
      if (!token || token !== s.csrf) return c.json({ error: 'CSRF', message: 'CSRFトークンが無効です' }, 403);
    }
    await next();
  };
}

export function login(c, email, password) {
  const db = getDb();
  const ip = clientIp(c);
  const rl = rateLimit(db, `login:${ip}`, 10, 300);
  if (!rl.allowed) { const e = new Error(`ログイン試行回数が多すぎます。${rl.retryAfter}秒後に再試行してください`); e.status = 429; throw e; }
  const user = db.get('SELECT * FROM users WHERE email=?', [String(email || '').toLowerCase().trim()]);
  if (!user || !user.is_active || !verifyPassword(String(password || ''), user.password_hash)) {
    audit(db, user?.id || null, 'LOGIN_FAILED', 'user', user?.id || null, { email: String(email || '').slice(0, 100) }, ip);
    const e = new Error('メールアドレスまたはパスワードが正しくありません'); e.status = 401; throw e;
  }
  const sess = createSession(c, user);
  audit(db, user.id, 'LOGIN', 'user', user.id, null, ip);
  return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, csrf: sess.csrf };
}

export { hashPassword, verifyPassword };
