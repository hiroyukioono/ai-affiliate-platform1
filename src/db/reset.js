import fs from 'node:fs';
import { config } from '../config.js';
for (const suffix of ['', '-wal', '-shm']) { try { fs.unlinkSync(config.db.file + suffix); } catch {} }
console.log('[db:reset] removed', config.db.file);
const { runSeed } = await import('./seed.js');
runSeed();
