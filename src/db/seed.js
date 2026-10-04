import { getDb, initSchema, J } from './index.js';
import { MOBILE_PROMPTS, DESIGN_THEMES, RESPONSIVE_SETS, AFFILIATE_PROGRAMS } from './seedData.js';
import { hashPassword } from '../lib/security.js';
import { config } from '../config.js';

export function runSeed(db = getDb(), { log = console.log } = {}) {
  initSchema(db);
  const result = { users: 0, mobilePrompts: 0, designs: 0, responsiveSets: 0, programs: 0 };

  db.transaction(() => {
    // Admin user
    const existing = db.get('SELECT id FROM users WHERE email=?', [config.admin.email]);
    if (!existing) {
      db.run('INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)',
        [config.admin.email, 'Administrator', hashPassword(config.admin.password), 'admin']);
      result.users++;
    }
    // Secondary editor + viewer accounts for RBAC testing
    for (const u of [
      { email: 'editor@example.com', name: 'Editor', pw: 'Editor1234!', role: 'editor' },
      { email: 'viewer@example.com', name: 'Viewer', pw: 'Viewer1234!', role: 'viewer' }
    ]) {
      if (!db.get('SELECT id FROM users WHERE email=?', [u.email])) {
        db.run('INSERT INTO users(email,name,password_hash,role) VALUES(?,?,?,?)', [u.email, u.name, hashPassword(u.pw), u.role]);
        result.users++;
      }
    }

    for (const p of MOBILE_PROMPTS) {
      if (db.get('SELECT id FROM mobile_design_prompts WHERE name=? AND is_system=1', [p.name])) continue;
      const r = db.run('INSERT INTO mobile_design_prompts(name,description,prompt,rules,status,is_system) VALUES(?,?,?,?,?,1)',
        [p.name, p.description, p.prompt, J(p.rules), 'ACTIVE']);
      db.run('INSERT INTO mobile_prompt_versions(prompt_id,version,name,description,prompt,rules,note) VALUES(?,?,?,?,?,?,?)',
        [r.lastInsertRowid, 1, p.name, p.description, p.prompt, J(p.rules), 'Initial seed']);
      result.mobilePrompts++;
    }

    for (const t of DESIGN_THEMES) {
      if (db.get('SELECT id FROM design_themes WHERE name=? AND is_system=1', [t.name])) continue;
      const r = db.run('INSERT INTO design_themes(name,description,category,tokens,css,is_system) VALUES(?,?,?,?,?,1)',
        [t.name, t.description, t.category, J(t.tokens), t.css]);
      db.run('INSERT INTO design_versions(design_theme_id,version,tokens,css,note) VALUES(?,?,?,?,?)', [r.lastInsertRowid, 1, J(t.tokens), t.css, 'Initial seed']);
      result.designs++;
    }

    for (const s of RESPONSIVE_SETS) {
      if (db.get('SELECT id FROM responsive_design_sets WHERE name=? AND is_system=1', [s.name])) continue;
      db.run('INSERT INTO responsive_design_sets(name,description,desktop_config,tablet_config,mobile_config,breakpoints,is_system) VALUES(?,?,?,?,?,?,1)',
        [s.name, s.description, J(s.desktop_config), J(s.tablet_config), J(s.mobile_config), J(s.breakpoints)]);
      result.responsiveSets++;
    }

    for (const p of AFFILIATE_PROGRAMS) {
      if (db.get('SELECT id FROM affiliate_programs WHERE name=?', [p.name])) continue;
      db.run('INSERT INTO affiliate_programs(name,provider,website,notes) VALUES(?,?,?,?)', [p.name, p.provider, p.website, p.notes]);
      result.programs++;
    }
  });
  log('[seed] done', result);
  return result;
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.js')) {
  runSeed();
}
