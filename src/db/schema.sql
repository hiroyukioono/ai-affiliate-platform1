-- AI Affiliate Platform schema (SQLite dialect; PostgreSQL-compatible types where possible)
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor', -- admin | editor | viewer
  is_active INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  csrf_token TEXT NOT NULL,
  ip TEXT,
  user_agent TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  ad_title TEXT,                      -- original advertiser title (e.g. "XServer VPS")
  theme_summary TEXT,                 -- AI theme analysis (JSON)
  target_audience TEXT,
  seo_keywords TEXT,                  -- JSON array
  design_theme_id INTEGER REFERENCES design_themes(id) ON DELETE SET NULL,
  mobile_prompt_id INTEGER REFERENCES mobile_design_prompts(id) ON DELETE SET NULL,
  responsive_set_id INTEGER REFERENCES responsive_design_sets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | published | archived
  published_version_id INTEGER,
  settings TEXT NOT NULL DEFAULT '{}',  -- JSON (site-wide SEO/OGP etc.)
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'page', -- home | page | article | category
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  seo_title TEXT,
  meta_description TEXT,
  canonical_url TEXT,
  robots TEXT DEFAULT 'index,follow',
  og_image TEXT,
  structured_data TEXT,              -- JSON-LD
  status TEXT NOT NULL DEFAULT 'draft', -- draft | published
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(site_id, slug)
);

CREATE TABLE IF NOT EXISTS site_sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Section',
  sort_order INTEGER NOT NULL DEFAULT 0,
  desktop_config TEXT NOT NULL DEFAULT '{}',
  tablet_config TEXT NOT NULL DEFAULT '{}',
  mobile_config TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS site_components (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
  section_id INTEGER REFERENCES site_sections(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- heading,text,image,button,cta,affiliate_ad,product,comparison_table,ranking,article,faq,search,banner,spacer,divider,html,video
  props TEXT NOT NULL DEFAULT '{}',
  desktop_config TEXT NOT NULL DEFAULT '{}',
  tablet_config TEXT NOT NULL DEFAULT '{}',
  mobile_config TEXT NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  sort_order_tablet INTEGER,
  sort_order_mobile INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_components_page ON site_components(page_id, sort_order);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(site_id, slug)
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  page_id INTEGER REFERENCES site_pages(id) ON DELETE SET NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  outline TEXT,          -- JSON headings
  body_html TEXT,
  seo_title TEXT,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_at TEXT,     -- content calendar
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(site_id, slug)
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  features TEXT,  -- JSON
  image_url TEXT,
  affiliate_link_id INTEGER REFERENCES affiliate_links(id) ON DELETE SET NULL,
  rating REAL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS design_themes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  tokens TEXT NOT NULL DEFAULT '{}',   -- JSON design tokens (colors, fonts, radius, spacing)
  css TEXT NOT NULL DEFAULT '',        -- compiled custom CSS
  is_system INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  current_version INTEGER NOT NULL DEFAULT 1,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS design_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  design_theme_id INTEGER NOT NULL REFERENCES design_themes(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  tokens TEXT NOT NULL,
  css TEXT NOT NULL,
  note TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mobile_design_prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,              -- instruction text sent to AI for mobile optimization
  rules TEXT NOT NULL DEFAULT '{}',  -- JSON rule set (min font size, tap target etc.)
  status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | INACTIVE
  current_version INTEGER NOT NULL DEFAULT 1,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mobile_prompt_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_id INTEGER NOT NULL REFERENCES mobile_design_prompts(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  rules TEXT NOT NULL,
  note TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mobile_design_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  font_size TEXT DEFAULT '1rem',
  line_height TEXT DEFAULT '1.7',
  margin TEXT DEFAULT '0',
  padding TEXT DEFAULT '1rem',
  width TEXT DEFAULT '100%',
  height TEXT DEFAULT 'auto',
  display TEXT DEFAULT 'block',
  position TEXT DEFAULT 'static',
  image_size TEXT DEFAULT '100%',
  button_size TEXT DEFAULT '48px',
  cta_width TEXT DEFAULT '100%',
  card_layout TEXT DEFAULT 'stack',
  table_layout TEXT DEFAULT 'scroll',   -- scroll | card
  navigation TEXT DEFAULT 'hamburger',
  visibility TEXT DEFAULT '{}',          -- JSON
  extra TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(site_id)
);

CREATE TABLE IF NOT EXISTS responsive_design_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  desktop_config TEXT NOT NULL DEFAULT '{}',
  tablet_config TEXT NOT NULL DEFAULT '{}',
  mobile_config TEXT NOT NULL DEFAULT '{}',
  breakpoints TEXT NOT NULL DEFAULT '{"tablet":1024,"mobile":767}',
  is_system INTEGER NOT NULL DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER REFERENCES sites(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  url TEXT NOT NULL,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS affiliate_programs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,          -- e.g. A8.net
  provider TEXT,
  website TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER REFERENCES affiliate_programs(id) ON DELETE SET NULL,
  site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,            -- original affiliate URL (never modified)
  label TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS affiliate_ads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  program_id INTEGER REFERENCES affiliate_programs(id) ON DELETE SET NULL,
  site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  ad_type TEXT NOT NULL DEFAULT 'html', -- html | banner | text
  original_code TEXT NOT NULL,          -- IMMUTABLE original ad code
  original_code_hash TEXT NOT NULL,     -- SHA-256 of original_code for tamper check
  width INTEGER,
  height INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  page_id INTEGER REFERENCES site_pages(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- pageview | cta_view | cta_click | scroll | web_vital
  device TEXT NOT NULL DEFAULT 'desktop', -- desktop | tablet | mobile
  viewport_width INTEGER,
  variant_id INTEGER REFERENCES experiment_variants(id) ON DELETE SET NULL,
  component_id INTEGER,
  value REAL,
  meta TEXT DEFAULT '{}',
  referrer TEXT,
  path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_site_time ON analytics_events(site_id, created_at);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(site_id, event_type);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  page_id INTEGER REFERENCES site_pages(id) ON DELETE SET NULL,
  ad_id INTEGER REFERENCES affiliate_ads(id) ON DELETE SET NULL,
  link_id INTEGER REFERENCES affiliate_links(id) ON DELETE SET NULL,
  component_id INTEGER,
  session_id TEXT,
  device TEXT NOT NULL DEFAULT 'desktop',
  variant_id INTEGER REFERENCES experiment_variants(id) ON DELETE SET NULL,
  click_token TEXT UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_clicks_site_time ON affiliate_clicks(site_id, created_at);

CREATE TABLE IF NOT EXISTS conversions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  page_id INTEGER REFERENCES site_pages(id) ON DELETE SET NULL,
  ad_id INTEGER REFERENCES affiliate_ads(id) ON DELETE SET NULL,
  click_id INTEGER REFERENCES affiliate_clicks(id) ON DELETE SET NULL,
  device TEXT NOT NULL DEFAULT 'desktop',
  variant_id INTEGER REFERENCES experiment_variants(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  amount REAL DEFAULT 0,
  note TEXT,
  occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS revenues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  ad_id INTEGER REFERENCES affiliate_ads(id) ON DELETE SET NULL,
  conversion_id INTEGER REFERENCES conversions(id) ON DELETE SET NULL,
  device TEXT NOT NULL DEFAULT 'desktop',
  variant_id INTEGER REFERENCES experiment_variants(id) ON DELETE SET NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'JPY',
  occurred_at TEXT NOT NULL DEFAULT (datetime('now')),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_analysis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
  page_id INTEGER REFERENCES site_pages(id) ON DELETE SET NULL,
  analysis_type TEXT NOT NULL, -- access|click|conversion|revenue|seo|cta|ad_placement|ab_test|mobile|theme|post_change|...
  input_summary TEXT,          -- filtered data sent to AI (JSON)
  result TEXT NOT NULL,        -- JSON { data_used, reasoning, possible_causes, suggestions, uncertainty }
  model TEXT,
  provider TEXT,
  duration_ms INTEGER,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ai_recommendations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER REFERENCES sites(id) ON DELETE CASCADE,
  page_id INTEGER REFERENCES site_pages(id) ON DELETE SET NULL,
  analysis_id INTEGER REFERENCES ai_analysis(id) ON DELETE SET NULL,
  category TEXT NOT NULL, -- SEO|CONTENT|CTA|DESIGN|MOBILE|AFFILIATE|INTERNAL_LINK|CONVERSION|REVENUE
  title TEXT NOT NULL,
  description TEXT,
  rationale TEXT,
  uncertainty TEXT,
  proposed_changes TEXT NOT NULL DEFAULT '[]', -- JSON array of {target, componentId, field, from, to}
  priority TEXT DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected | hold | applied
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TEXT,
  review_note TEXT,
  applied_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS experiments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  page_id INTEGER REFERENCES site_pages(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  hypothesis TEXT,
  status TEXT NOT NULL DEFAULT 'draft', -- draft | running | paused | completed
  min_sample_size INTEGER NOT NULL DEFAULT 100,
  started_at TEXT,
  ended_at TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS experiment_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  experiment_id INTEGER NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- A | B
  description TEXT,
  weight INTEGER NOT NULL DEFAULT 50,
  overrides TEXT NOT NULL DEFAULT '{}', -- JSON component overrides
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS improvement_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  page_id INTEGER REFERENCES site_pages(id) ON DELETE SET NULL,
  recommendation_id INTEGER REFERENCES ai_recommendations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  before_snapshot TEXT,   -- JSON
  change_summary TEXT,    -- JSON
  after_snapshot TEXT,    -- JSON
  before_metrics TEXT,    -- JSON
  after_metrics TEXT,     -- JSON (filled later)
  ai_post_analysis_id INTEGER REFERENCES ai_analysis(id) ON DELETE SET NULL,
  applied_by INTEGER REFERENCES users(id),
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS builder_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  page_id INTEGER REFERENCES site_pages(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  snapshot TEXT NOT NULL,      -- JSON: full page+components
  kind TEXT NOT NULL DEFAULT 'manual', -- manual | autosave | publish | rollback | ai_apply
  note TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bversions_page ON builder_versions(page_id, version);

CREATE TABLE IF NOT EXISTS builder_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  before_state TEXT,
  after_state TEXT,
  position INTEGER NOT NULL,  -- undo stack position
  is_undone INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_bhistory_page ON builder_history(page_id, position);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity TEXT,
  entity_id INTEGER,
  detail TEXT,
  ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  window_start INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
