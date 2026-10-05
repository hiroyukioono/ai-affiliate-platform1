import { serve } from '@hono/node-server';
import { config } from './config.js';
import { getDb, initSchema } from './db/index.js';
import { runSeed } from './db/seed.js';
import { createApp } from './app.js';
import { getProvider } from './ai/provider.js';

// Ensure schema + seed data exist (idempotent)
const db = getDb();
initSchema(db);
const userCount = db.get('SELECT COUNT(*) n FROM users').n;
if (userCount === 0) runSeed(db);
else runSeed(db, { log: () => {} }); // idempotent: adds missing system records only

// purge expired sessions on boot
db.run("DELETE FROM sessions WHERE expires_at < datetime('now')");

const app = createApp();
serve({ fetch: app.fetch, port: config.port, hostname: config.host }, (info) => {
  console.log(`\n  AI Affiliate Platform`);
  console.log(`  ------------------------------------------`);
  console.log(`  Admin UI : http://localhost:${info.port}/admin/`);
  console.log(`  API      : http://localhost:${info.port}/api/health`);
  console.log(`  DB       : ${config.db.driver} (${config.db.file})`);
  console.log(`  AI       : ${config.ai.provider} ${config.ai.model} @ ${config.ai.baseUrl} [${config.ai.mode}]`);
  console.log(`  Login    : http://localhost:${info.port}/admin/  (管理者アカウントで)\n`);
  getProvider().healthCheck().then(h => {
    console.log(`  Ollama   : ${h.status}${h.errors.length ? ' - ' + h.errors.join(' | ') : ''}${h.hint ? '\n             hint: ' + h.hint : ''}\n`);
  }).catch(() => {});
});
