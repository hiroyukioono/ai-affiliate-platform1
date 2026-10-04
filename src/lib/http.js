import { getDb } from '../db/index.js';
import { audit, clientIp } from './auth.js';

export async function body(c) {
  try { return await c.req.json(); } catch { return {}; }
}
export function user(c) { return c.get('session')?.user; }
export function logAction(c, action, entity, entityId, detail) {
  audit(getDb(), user(c)?.id || null, action, entity, entityId, detail, clientIp(c));
}
export function notFound(c, what = 'Resource') { return c.json({ error: 'NOT_FOUND', message: `${what} not found` }, 404); }

export function errorHandler(err, c) {
  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err);
  return c.json({ error: status >= 500 ? 'INTERNAL' : 'BAD_REQUEST', message: err.message }, status);
}
