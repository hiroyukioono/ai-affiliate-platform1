import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { sessionMiddleware } from './lib/auth.js';
import { errorHandler } from './lib/http.js';
import { getDb } from './db/index.js';
import { rateLimit } from './lib/security.js';
import { config } from './config.js';

import authRoutes from './routes/auth.js';
import siteRoutes from './routes/sites.js';
import builderRoutes from './routes/builder.js';
import designRoutes from './routes/designs.js';
import mobilePromptRoutes from './routes/mobilePrompts.js';
import responsiveRoutes from './routes/responsive.js';
import mediaRoutes from './routes/media.js';
import affiliateRoutes from './routes/affiliate.js';
import articleRoutes from './routes/articles.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';
import previewRoutes from './routes/preview.js';
import publicRoutes from './routes/public.js';

export function createApp({ quiet = false } = {}) {
  const app = new Hono();
  if (!quiet) app.use('*', logger());
  app.onError(errorHandler);

  // Security headers. CSP for admin allows CDN assets; public sites allow inline (ad code) but restrict framing.
  app.use('/admin/*', secureHeaders({ contentSecurityPolicy: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.tailwindcss.com', 'https://cdn.jsdelivr.net'], styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'], imgSrc: ["'self'", 'data:', 'blob:', 'https:'], fontSrc: ["'self'", 'https://cdn.jsdelivr.net'], connectSrc: ["'self'"], frameSrc: ["'self'"], frameAncestors: ["'self'"] } }));
  app.use('/api/*', secureHeaders({ crossOriginResourcePolicy: 'same-origin' }));
  app.use('/s/*', secureHeaders({ contentSecurityPolicy: false, xFrameOptions: 'SAMEORIGIN' }));

  // Global API rate limit (per IP)
  app.use('/api/*', async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || 'local';
    const rl = rateLimit(getDb(), `api:${ip}`, 600, 60);
    if (!rl.allowed) return c.json({ error: 'RATE_LIMITED', message: `リクエストが多すぎます。${rl.retryAfter}秒後に再試行してください` }, 429);
    await next();
  });

  app.use('*', sessionMiddleware());

  app.get('/api/health', (c) => {
    const db = getDb();
    const t = db.get("SELECT COUNT(*) n FROM sqlite_master WHERE type='table'");
    return c.json({ ok: true, time: new Date().toISOString(), db: { driver: db.driver, tables: t.n }, ai: { provider: config.ai.provider, model: config.ai.model, mode: config.ai.mode } });
  });

  app.route('/api/auth', authRoutes);
  app.route('/api/sites', siteRoutes);
  app.route('/api/builder', builderRoutes);
  app.route('/api/designs', designRoutes);
  app.route('/api/mobile-prompts', mobilePromptRoutes);
  app.route('/api/responsive', responsiveRoutes);
  app.route('/api/media', mediaRoutes);
  app.route('/api/affiliate', affiliateRoutes);
  app.route('/api/articles', articleRoutes);
  app.route('/api/analytics', analyticsRoutes);
  app.route('/api/ai', aiRoutes);
  app.route('/api/preview', previewRoutes);
  app.route('/', publicRoutes);

  // Static: uploads and admin SPA
  app.use('/uploads/*', serveStatic({ root: './public' }));
  app.use('/admin/assets/*', serveStatic({ root: './public' }));
  app.get('/favicon.ico', (c) => c.redirect('/favicon.svg'));
  app.use('/favicon.svg', serveStatic({ root: './public' }));
  app.get('/admin', (c) => c.redirect('/admin/'));
  app.get('/admin/*', serveStatic({ path: './public/admin/index.html' }));
  app.get('/', (c) => c.redirect('/admin/'));
  app.notFound((c) => c.req.path.startsWith('/api/') ? c.json({ error: 'NOT_FOUND', message: `${c.req.method} ${c.req.path} not found` }, 404) : c.html('<!DOCTYPE html><meta charset="UTF-8"><title>404</title><h1>404 Not Found</h1><a href="/admin/">管理画面へ</a>', 404));
  return app;
}
