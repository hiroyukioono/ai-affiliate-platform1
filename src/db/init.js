import { getDb, initSchema } from './index.js';
const db = getDb();
initSchema(db);
const tables = db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log('[db:init] tables:', tables.map(t => t.name).join(', '));
