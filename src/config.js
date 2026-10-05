// Loads .env (without external dependency) and exposes typed config.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

function loadDotEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, 'utf8');
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
loadDotEnv();

const env = process.env;

export const config = {
  port: Number(env.PORT || 3000),
  host: env.HOST || '0.0.0.0',
  nodeEnv: env.NODE_ENV || 'development',
  isProd: (env.NODE_ENV || 'development') === 'production',
  sessionSecret: env.SESSION_SECRET || 'dev-insecure-session-secret-change-me-0123456789',
  db: {
    driver: env.DB_DRIVER || 'sqlite',
    file: path.resolve(ROOT, env.DB_FILE || './data/app.db'),
    url: env.DATABASE_URL || ''
  },
  ai: {
    provider: env.AI_PROVIDER || 'ollama',
    baseUrl: (env.OLLAMA_BASE_URL || 'http://localhost:12000/v1').replace(/\/+$/, ''),
    model: env.OLLAMA_MODEL || 'llama3.1:8b',
    apiKey: env.OLLAMA_API_KEY || 'ollama',
    timeoutMs: Number(env.AI_TIMEOUT_MS || 180000),
    // Optional cap for max_tokens per request (useful on slow CPU-only machines). 0 = no cap.
    maxTokensCap: Number(env.AI_MAX_TOKENS || 0),
    mode: env.AI_MODE || 'LOCAL_ONLY'
  },
  // Initial admin bootstrap. Used ONLY by the seed when the users table is empty. Never exposed to clients.
  // If ADMIN_PASSWORD is not set, a random password is generated once and printed to the server console only.
  admin: {
    email: (env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim(),
    password: env.ADMIN_PASSWORD || ''
  },
  // Fixed-password demo accounts (editor/viewer) are only created when explicitly enabled.
  seedDemoUsers: env.SEED_DEMO_USERS === 'true',
  uploadsDir: path.join(ROOT, 'public', 'uploads')
};

// Public (non-secret) view of the config for the admin UI. Never include secrets.
export function publicConfig() {
  return {
    nodeEnv: config.nodeEnv,
    ai: { provider: config.ai.provider, baseUrl: config.ai.baseUrl, model: config.ai.model, mode: config.ai.mode, timeoutMs: config.ai.timeoutMs, maxTokensCap: config.ai.maxTokensCap },
    db: { driver: config.db.driver }
  };
}
