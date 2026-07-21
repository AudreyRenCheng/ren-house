CREATE TABLE analytics_visits (
  id TEXT PRIMARY KEY,
  country TEXT,
  region TEXT,
  source TEXT NOT NULL,
  visited_at TEXT NOT NULL
);

CREATE INDEX analytics_visits_visited_at ON analytics_visits(visited_at);
CREATE INDEX analytics_visits_region ON analytics_visits(region);
CREATE INDEX analytics_visits_source ON analytics_visits(source);
