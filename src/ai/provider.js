// AI provider abstraction. OllamaProvider talks to Ollama's OpenAI-compatible endpoint.
// Swap providers by changing AI_PROVIDER env and registering a new class in createProvider().
import { config } from '../config.js';

export class AIProvider {
  constructor(opts) { this.opts = opts; }
  get name() { return 'abstract'; }
  async chat(_messages, _options) { throw new Error('not implemented'); }
  async listModels() { throw new Error('not implemented'); }
  async healthCheck() { throw new Error('not implemented'); }
}

export class OllamaProvider extends AIProvider {
  constructor({ baseUrl, model, apiKey, timeoutMs, maxTokensCap }) {
    super();
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.model = model;
    this.apiKey = apiKey || 'ollama'; // Ollama ignores it; placeholder only
    this.timeoutMs = timeoutMs || 180000;
    this.maxTokensCap = Number(maxTokensCap) || 0;
    // Native Ollama root (strip /v1) for /api/tags when needed
    this.nativeBase = this.baseUrl.replace(/\/v1$/, '');
  }
  get name() { return 'ollama'; }

  async _fetch(url, init = {}, timeoutMs = this.timeoutMs) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      return await fetch(url, { ...init, signal: ctrl.signal, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}`, ...(init.headers || {}) } });
    } finally { clearTimeout(t); }
  }

  async listModels() {
    const res = await this._fetch(`${this.baseUrl}/models`, { method: 'GET' }, 10000);
    if (!res.ok) throw new Error(`models endpoint HTTP ${res.status}`);
    const json = await res.json();
    return (json.data || []).map(m => m.id);
  }

  async chat(messages, { temperature = 0.4, maxTokens = 2048, json = false, model } = {}) {
    const effectiveMax = this.maxTokensCap ? Math.min(maxTokens, this.maxTokensCap) : maxTokens;
    const body = { model: model || this.model, messages, temperature, max_tokens: effectiveMax, stream: false };
    if (json) body.response_format = { type: 'json_object' };
    const started = Date.now();
    const res = await this._fetch(`${this.baseUrl}/chat/completions`, { method: 'POST', body: JSON.stringify(body) });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Ollama chat HTTP ${res.status}: ${txt.slice(0, 300)}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    return { content, model: data.model || body.model, usage: data.usage || null, durationMs: Date.now() - started };
  }

  async healthCheck() {
    const out = { status: 'ERROR', baseUrl: this.baseUrl, model: this.model, provider: this.name, checks: {}, errors: [], hint: '' };
    // 1. server reachable
    try {
      const models = await this.listModels();
      out.checks.server = true;
      out.checks.models = models;
      out.checks.modelAvailable = models.some(m => m === this.model || m.split(':')[0] === this.model.split(':')[0] && (m === this.model || m.startsWith(this.model)));
      if (!out.checks.modelAvailable) {
        out.errors.push(`モデル "${this.model}" が見つかりません。利用可能: ${models.join(', ') || '(なし)'}`);
        out.hint = `ターミナルで次を実行してください: ollama pull ${this.model}`;
      }
    } catch (e) {
      out.checks.server = false;
      out.errors.push(classifyError(e, this.baseUrl));
      out.hint = `Ollamaが起動しているか確認してください。例: set OLLAMA_HOST=0.0.0.0:12000 && ollama serve  (URL: ${this.baseUrl})`;
      return out;
    }
    // 2. test prompt
    if (out.checks.modelAvailable) {
      try {
        const r = await this.chat([{ role: 'user', content: 'Reply with exactly the word: OK' }], { temperature: 0, maxTokens: 5 });
        out.checks.testPrompt = true;
        out.checks.testResponse = r.content.trim().slice(0, 50);
        out.checks.durationMs = r.durationMs;
        out.status = 'CONNECTED';
      } catch (e) {
        out.checks.testPrompt = false;
        out.errors.push(classifyError(e, this.baseUrl));
      }
    }
    return out;
  }
}

function classifyError(e, baseUrl) {
  const msg = String(e?.message || e);
  const cause = e?.cause?.code || '';
  if (e?.name === 'AbortError' || /abort/i.test(msg)) return `タイムアウト: ${baseUrl} からの応答がありません`;
  if (cause === 'ECONNREFUSED' || /ECONNREFUSED/.test(msg)) return `接続拒否 (ECONNREFUSED): ${baseUrl} でOllamaが起動していません`;
  if (cause === 'ENOTFOUND' || /ENOTFOUND/.test(msg)) return `ホストが見つかりません: URLが間違っている可能性があります (${baseUrl})`;
  if (/HTTP 404/.test(msg)) return `404: モデルまたはエンドポイントが存在しません (${msg})`;
  return `エラー: ${msg}`;
}

let providerInstance = null;
export function createProvider(overrides = {}) {
  const a = { ...config.ai, ...overrides };
  if (a.provider === 'ollama') return new OllamaProvider(a);
  throw new Error(`Unknown AI_PROVIDER: ${a.provider}`);
}
export function getProvider() { if (!providerInstance) providerInstance = createProvider(); return providerInstance; }
export function setProvider(p) { providerInstance = p; }
