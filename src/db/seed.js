import { getDb, initSchema, J } from './index.js';
import { MOBILE_PROMPTS, DESIGN_THEMES, RESPONSIVE_SETS, AFFILIATE_PROGRAMS } from './seedData.js';
import { hashPassword, randomToken } from '../lib/security.js';
import { config } from '../config.js';

// Generates a strong random bootstrap password (upper/lower/digit/symbol guaranteed).
function generateBootstrapPassword() {
  const sets = ['ABCDEFGHJKLMNPQRSTUVWXYZ', 'abcdefghijkmnpqrstuvwxyz', '23456789', '!@#$%&*-_+='];
  const all = sets.join('');
  const bytes = randomToken(32);
  let pw = sets.map((s, i) => s[parseInt(bytes.slice(i * 2, i * 2 + 2), 16) % s.length]).join('');
  for (let i = 4; i < 20; i++) pw += all[parseInt(bytes.slice(i * 2 + 8, i * 2 + 10), 16) % all.length];
  return pw.split('').sort(() => (parseInt(randomToken(1), 16) & 1) ? 1 : -1).join('');
}

export function runSeed(db = getDb(), { log = console.log } = {}) {
  initSchema(db);
  const result = { users: 0, mobilePrompts: 0, designs: 0, responsiveSets: 0, programs: 0, bootstrapPasswordGenerated: false };
  let generatedPassword = null;

  db.transaction(() => {
    // Bootstrap admin: created ONLY when no user exists at all (so a deleted/renamed env admin is never re-created).
    const anyUser = db.get('SELECT id FROM users LIMIT 1');
    if (!anyUser) {
      let pw = config.admin.password;
      if (!pw) { pw = generateBootstrapPassword(); generatedPassword = pw; result.bootstrapPasswordGenerated = true; }
      db.run('INSERT INTO users(email,name,password_hash,role,must_change_password) VALUES(?,?,?,?,1)',
        [config.admin.email, 'Administrator', hashPassword(pw), 'admin']);
      result.users++;
    }
    // Demo editor/viewer accounts: opt-in only (SEED_DEMO_USERS=true). Passwords are random and printed once.
    if (config.seedDemoUsers) {
      for (const u of [{ email: 'editor@example.com', name: 'Editor', role: 'editor' }, { email: 'viewer@example.com', name: 'Viewer', role: 'viewer' }]) {
        if (db.get('SELECT id FROM users WHERE email=?', [u.email])) continue;
        const pw = generateBootstrapPassword();
        db.run('INSERT INTO users(email,name,password_hash,role,must_change_password) VALUES(?,?,?,?,1)', [u.email, u.name, hashPassword(pw), u.role]);
        result.users++; result.demoUsers = result.demoUsers || []; result.demoUsers.push({ email: u.email, password: pw });
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

  // Report (never logs a password that came from .env; a generated one is shown exactly once, server console only).
  const { demoUsers, ...summary } = result;
  log('[seed] done', summary);
  if (generatedPassword) {
    log('\n  ============================================================');
    log('  初期管理者アカウントを作成しました（ADMIN_PASSWORD 未設定のため自動生成）');
    log(`  Email   : ${config.admin.email}`);
    log(`  Password: ${generatedPassword}`);
    log('  この表示は一度だけです。ログイン後、必ず Settings > 管理者アカウント でパスワードを変更してください。');
    log('  ============================================================\n');
  }
  if (demoUsers?.length) { log('  デモアカウント (SEED_DEMO_USERS=true):'); for (const u of demoUsers) log(`    ${u.email} / ${u.password}`); }
  return result;
}

if (process.argv[1]?.endsWith('seed.js')) {
  runSeed();
}
