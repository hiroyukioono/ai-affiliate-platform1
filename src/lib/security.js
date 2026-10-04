// Security helpers: password hashing (scrypt), tokens, HTML escaping, sanitization, rate limiting.
import crypto from 'node:crypto';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const [, salt, hash] = stored.split('$');
  const calc = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  const a = Buffer.from(hash, 'hex');
  return a.length === calc.length && crypto.timingSafeEqual(a, calc);
}

export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
export const sha256 = (s) => crypto.createHash('sha256').update(s, 'utf8').digest('hex');

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
export const escapeAttr = escapeHtml;

// Sanitize rich HTML (article bodies, custom HTML block). Removes scripts/event handlers/javascript: urls.
// Affiliate ad code is NOT passed through this (stored verbatim and rendered in isolated container).
export function sanitizeHtml(html) {
  let out = String(html ?? '');
  out = out.replace(/<\s*(script|iframe|object|embed|style|link|meta|base|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  out = out.replace(/<\s*(script|iframe|object|embed|style|link|meta|base)[^>]*\/?>/gi, '');
  out = out.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  out = out.replace(/(href|src|action)\s*=\s*(["']?)\s*javascript:[^"'>\s]*/gi, '$1=$2#');
  out = out.replace(/(href|src)\s*=\s*(["']?)\s*data:text\/html[^"'>\s]*/gi, '$1=$2#');
  return out;
}

export function safeUrl(u) {
  const s = String(u ?? '').trim();
  if (!s) return '#';
  if (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(s)) return s;
  return '#';
}

// URL-safe slug: ASCII letters/digits/hyphen only. Non-ASCII (e.g. Japanese) is dropped;
// if nothing remains, a short hash of the original keeps slugs stable and unique.
export function slugify(s) {
  const src = String(s || '').normalize('NFKC').trim();
  let base = src.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
  if (/[^\x00-\x7f]/.test(src) && base.length < 3) base = `${base ? base + '-' : 'p-'}${sha256(src).slice(0, 8)}`;
  if (!base) return 'item-' + Date.now().toString(36);
  return base;
}

// Simple fixed-window rate limiter backed by DB table (works across restarts).
export function rateLimit(db, key, limit, windowSec) {
  const nowSec = Math.floor(Date.now() / 1000);
  const row = db.get('SELECT count, window_start FROM rate_limits WHERE key=?', [key]);
  if (!row || nowSec - row.window_start >= windowSec) {
    db.run('INSERT INTO rate_limits(key,count,window_start) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET count=1, window_start=excluded.window_start', [key, 1, nowSec]);
    return { allowed: true, remaining: limit - 1 };
  }
  if (row.count >= limit) return { allowed: false, remaining: 0, retryAfter: windowSec - (nowSec - row.window_start) };
  db.run('UPDATE rate_limits SET count=count+1 WHERE key=?', [key]);
  return { allowed: true, remaining: limit - row.count - 1 };
}

// Validation helpers
export function assert(cond, message, status = 400) {
  if (!cond) { const e = new Error(message); e.status = status; throw e; }
}
export function str(v, { min = 0, max = 10000, name = 'value', required = false } = {}) {
  if (v === undefined || v === null || v === '') { assert(!required, `${name} is required`); return v == null ? v : ''; }
  assert(typeof v === 'string', `${name} must be a string`);
  assert(v.length >= min && v.length <= max, `${name} length must be ${min}-${max}`);
  return v;
}
export function int(v, { min = -2147483648, max = 2147483647, name = 'value', required = false } = {}) {
  if (v === undefined || v === null || v === '') { assert(!required, `${name} is required`); return undefined; }
  const n = Number(v);
  assert(Number.isInteger(n) && n >= min && n <= max, `${name} must be an integer ${min}-${max}`);
  return n;
}
export function oneOf(v, list, name = 'value') { assert(list.includes(v), `${name} must be one of ${list.join(', ')}`); return v; }

// Filter sensitive data before sending to AI
const SENSITIVE_KEY = /(password|passwd|pwd|secret|token|api[_-]?key|apikey|authorization|cookie|session|credential|private[_-]?key|email|phone|tel|address|ssn|credit|card|password_hash|ip)/i;
const SENSITIVE_VAL = [
  /sk-[A-Za-z0-9]{10,}/g,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  /\b\d{2,4}-\d{2,4}-\d{3,4}\b/g,
  /Bearer\s+[A-Za-z0-9\-_.]+/gi,
  /\b(?:\d{1,3}\.){3}\d{1,3}\b/g
];
export function filterForAI(data, depth = 0) {
  if (depth > 8) return '[depth]';
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') {
    let s = data;
    for (const re of SENSITIVE_VAL) s = s.replace(re, '[REDACTED]');
    return s;
  }
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(d => filterForAI(d, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (SENSITIVE_KEY.test(k)) continue;
    out[k] = filterForAI(v, depth + 1);
  }
  return out;
}
