CREATE TABLE IF NOT EXISTS image_cache (
  id TEXT PRIMARY KEY,
  prompt_hash TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  theme TEXT,
  subject TEXT,
  difficulty TEXT,
  custom_prompt TEXT,
  provider TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_accessed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  access_count INTEGER NOT NULL DEFAULT 1,
  metadata TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_image_cache_prompt_hash
  ON image_cache(prompt_hash);

CREATE INDEX IF NOT EXISTS idx_image_cache_theme_subject
  ON image_cache(theme, subject, difficulty);

CREATE INDEX IF NOT EXISTS idx_image_cache_provider
  ON image_cache(provider);

CREATE INDEX IF NOT EXISTS idx_image_cache_created_at
  ON image_cache(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_image_cache_exact_match
  ON image_cache(prompt_hash, provider);
