import { Hono } from 'hono';
import fs from 'node:fs';
import path from 'node:path';
import { getDb } from '../db/index.js';
import { requireAuth } from '../lib/auth.js';
import { user, logAction, notFound, body } from '../lib/http.js';
import { assert, randomToken, str } from '../lib/security.js';
import { config } from '../config.js';

const r = new Hono();
r.use('*', requireAuth('viewer'));

const ALLOWED = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/avif': 'avif' };
const MAX_BYTES = 8 * 1024 * 1024;

function imageSize(buf, mime) {
  try {
    if (mime === 'image/png' && buf.length > 24) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (mime === 'image/gif' && buf.length > 10) return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    if (mime === 'image/jpeg') {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
  } catch {}
  return { width: null, height: null };
}

r.get('/', (c) => {
  const siteId = c.req.query('siteId');
  const db = getDb();
  return c.json(siteId ? db.all('SELECT * FROM media_assets WHERE site_id=? OR site_id IS NULL ORDER BY id DESC', [siteId]) : db.all('SELECT * FROM media_assets ORDER BY id DESC'));
});

// multipart upload: field "file", optional "siteId", "alt"
r.post('/upload', requireAuth('editor'), async (c) => {
  const form = await c.req.parseBody();
  const file = form.file;
  assert(file && typeof file === 'object' && 'arrayBuffer' in file, 'file field required');
  const mime = file.type || 'application/octet-stream';
  const ext = ALLOWED[mime]; assert(ext, `unsupported file type: ${mime}`);
  assert(file.size <= MAX_BYTES, 'file too large (max 8MB)');
  const buf = Buffer.from(await file.arrayBuffer());
  // SVG: strip scripts to prevent stored XSS
  let data = buf;
  if (mime === 'image/svg+xml') data = Buffer.from(buf.toString('utf8').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/gi, ''), 'utf8');
  const filename = `${Date.now().toString(36)}-${randomToken(6)}.${ext}`;
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(config.uploadsDir, filename), data);
  const { width, height } = imageSize(buf, mime);
  const db = getDb();
  const siteId = form.siteId ? Number(form.siteId) : null;
  const res = db.run('INSERT INTO media_assets(site_id,filename,original_name,mime_type,size_bytes,width,height,alt_text,url,uploaded_by) VALUES(?,?,?,?,?,?,?,?,?,?)',
    [siteId, filename, String(file.name || filename).slice(0, 200), mime, data.length, width, height, form.alt ? String(form.alt).slice(0, 300) : null, `/uploads/${filename}`, user(c).id]);
  logAction(c, 'MEDIA_UPLOAD', 'media_asset', res.lastInsertRowid, { filename, mime, size: data.length });
  return c.json(db.get('SELECT * FROM media_assets WHERE id=?', [res.lastInsertRowid]), 201);
});

r.put('/:id', requireAuth('editor'), async (c) => {
  const b = await body(c); const db = getDb(); const id = Number(c.req.param('id'));
  const m = db.get('SELECT * FROM media_assets WHERE id=?', [id]); if (!m) return notFound(c, 'Media');
  db.run('UPDATE media_assets SET alt_text=?, site_id=? WHERE id=?', [b.alt_text !== undefined ? str(b.alt_text, { max: 300 }) : m.alt_text, b.site_id !== undefined ? (b.site_id || null) : m.site_id, id]);
  return c.json(db.get('SELECT * FROM media_assets WHERE id=?', [id]));
});

r.delete('/:id', requireAuth('editor'), (c) => {
  const db = getDb(); const id = Number(c.req.param('id'));
  const m = db.get('SELECT * FROM media_assets WHERE id=?', [id]); if (!m) return notFound(c, 'Media');
  try { fs.unlinkSync(path.join(config.uploadsDir, path.basename(m.filename))); } catch {}
  db.run('DELETE FROM media_assets WHERE id=?', [id]);
  logAction(c, 'MEDIA_DELETE', 'media_asset', id);
  return c.json({ ok: true });
});

export default r;
