CREATE TABLE IF NOT EXISTS analytics_event_records (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'screen_view')),
  occurred_at TEXT NOT NULL,
  beijing_date TEXT NOT NULL,
  hostname TEXT NOT NULL,
  site_region TEXT NOT NULL CHECK (site_region IN ('global', 'hk', 'local')),
  source TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer_host TEXT,
  screen_name TEXT,
  song_id TEXT,
  session_id TEXT NOT NULL,
  daily_visitor_hash TEXT NOT NULL,
  ip_address TEXT,
  country TEXT,
  region TEXT,
  device_type TEXT NOT NULL CHECK (
    device_type IN ('mobile', 'tablet', 'desktop', 'bot', 'unknown')
  ),
  is_bot INTEGER NOT NULL DEFAULT 0 CHECK (is_bot IN (0, 1))
);

CREATE INDEX IF NOT EXISTS analytics_event_records_occurred_at
  ON analytics_event_records(occurred_at);
CREATE INDEX IF NOT EXISTS analytics_event_records_beijing_date
  ON analytics_event_records(beijing_date);
CREATE INDEX IF NOT EXISTS analytics_event_records_event_type
  ON analytics_event_records(event_type);
CREATE INDEX IF NOT EXISTS analytics_event_records_daily_visitor
  ON analytics_event_records(beijing_date, daily_visitor_hash);
CREATE INDEX IF NOT EXISTS analytics_event_records_session
  ON analytics_event_records(beijing_date, session_id);
CREATE INDEX IF NOT EXISTS analytics_event_records_source
  ON analytics_event_records(beijing_date, source);
CREATE INDEX IF NOT EXISTS analytics_event_records_screen
  ON analytics_event_records(beijing_date, screen_name);
CREATE INDEX IF NOT EXISTS analytics_event_records_site_region
  ON analytics_event_records(beijing_date, site_region);
CREATE INDEX IF NOT EXISTS analytics_event_records_device
  ON analytics_event_records(beijing_date, device_type);
CREATE INDEX IF NOT EXISTS analytics_event_records_ip
  ON analytics_event_records(ip_address);

