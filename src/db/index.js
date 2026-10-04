// Database abstraction. SQLite (node:sqlite, built into Node 22+) for development.
// For production you can implement a PostgresAdapter with the same interface:
//   all(sql, params) / get(sql, params) / run(sql, params) -> {lastInsertRowid, changes} / exec(sql) / transaction(fn)
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config, ROOT } from '../config.js';

class SqliteAdapter {
  constructor(file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.db = new DatabaseSync(file);
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.db.exec('PRAGMA busy_timeout = 5000;');
    this.driver = 'sqlite';
  }
  exec(sql) { this.db.exec(sql); }
  all(sql, params = []) { return this.db.prepare(sql).all(...params).map(r => ({ ...r })); }
  get(sql, params = []) { const r = this.db.prepare(sql).get(...params); return r ? { ...r } : undefined; }
  run(sql, params = []) {
    const r = this.db.prepare(sql).run(...params);
    return { lastInsertRowid: Number(r.lastInsertRowid), changes: Number(r.changes) };
  }
  transaction(fn) {
    // Nested transactions use SAVEPOINTs so helpers can be composed safely.
    this._depth = (this._depth || 0);
    if (this._depth > 0) {
      const sp = `sp_${this._depth}`; this.db.exec(`SAVEPOINT ${sp}`); this._depth++;
      try { const out = fn(this); this.db.exec(`RELEASE SAVEPOINT ${sp}`); return out; }
      catch (e) { this.db.exec(`ROLLBACK TO SAVEPOINT ${sp}`); this.db.exec(`RELEASE SAVEPOINT ${sp}`); throw e; }
      finally { this._depth--; }
    }
    this.db.exec('BEGIN'); this._depth = 1;
    try { const out = fn(this); this.db.exec('COMMIT'); return out; }
    catch (e) { this.db.exec('ROLLBACK'); throw e; }
    finally { this._depth = 0; }
  }
  close() { this.db.close(); }
}

let instance = null;

export function getDb() {
  if (instance) return instance;
  if (config.db.driver === 'sqlite') {
    instance = new SqliteAdapter(config.db.file);
  } else if (config.db.driver === 'postgres') {
    throw new Error('PostgreSQL adapter: install "pg" and implement PostgresAdapter in src/db/postgres.js (same interface as SqliteAdapter). DATABASE_URL=' + (config.db.url ? '[set]' : '[missing]'));
  } else {
    throw new Error('Unknown DB_DRIVER: ' + config.db.driver);
  }
  return instance;
}

export function initSchema(db = getDb()) {
  const schema = fs.readFileSync(path.join(ROOT, 'src', 'db', 'schema.sql'), 'utf8');
  db.exec(schema);
  return db;
}

export function openTestDb() {
  // in-memory db for unit tests
  const a = new SqliteAdapter(':memory:');
  const schema = fs.readFileSync(path.join(ROOT, 'src', 'db', 'schema.sql'), 'utf8');
  a.exec(schema);
  return a;
}

export function setDbInstance(adapter) { instance = adapter; }

export const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
export const J = (v) => JSON.stringify(v ?? null);
export const P = (s, fallback = null) => { if (s == null) return fallback; try { return JSON.parse(s); } catch { return fallback; } };
