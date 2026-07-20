PRAGMA foreign_keys = ON;

CREATE TABLE songs (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  original_title TEXT NOT NULL DEFAULT '',
  title_zh TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  language TEXT CHECK (language IN ('zh','en','mixed')),
  completed_at TEXT,
  summary_zh TEXT NOT NULL DEFAULT '',
  summary_en TEXT NOT NULL DEFAULT '',
  lyrics_original TEXT NOT NULL DEFAULT '',
  lyrics_zh TEXT NOT NULL DEFAULT '',
  lyrics_en TEXT NOT NULL DEFAULT '',
  cover_key TEXT,
  audio_key TEXT,
  shelf_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','hidden')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT
);
CREATE INDEX songs_public_order ON songs(status, shelf_order);

CREATE TABLE extras (
  id TEXT PRIMARY KEY,
  song_id TEXT NOT NULL REFERENCES songs(id) ON DELETE RESTRICT,
  type TEXT NOT NULL CHECK (type IN ('image','audio','video','text')),
  file_key TEXT,
  title_zh TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  caption_zh TEXT NOT NULL DEFAULT '',
  caption_en TEXT NOT NULL DEFAULT '',
  recorded_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','hidden')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX extras_song_order ON extras(song_id, status, sort_order);

CREATE TABLE analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  song_id TEXT REFERENCES songs(id) ON DELETE SET NULL,
  extra_id TEXT REFERENCES extras(id) ON DELETE SET NULL,
  session_hash TEXT,
  screen_name TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX analytics_event_time ON analytics_events(event_type, created_at);
