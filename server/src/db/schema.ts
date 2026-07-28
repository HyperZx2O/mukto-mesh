export const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    channel TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    tag TEXT NOT NULL,
    content TEXT NOT NULL,
    pinned INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

  CREATE TABLE IF NOT EXISTS checkins (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    interval_hours INTEGER NOT NULL,
    last_checkin_at INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS missing_persons (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    last_location TEXT NOT NULL,
    description TEXT,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    photo_url TEXT,
    status TEXT DEFAULT 'missing',
    synced INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_missing_status ON missing_persons(status);

  CREATE TABLE IF NOT EXISTS news_articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    content TEXT,
    published_at INTEGER,
    fetched_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_news_fetched_at ON news_articles(fetched_at);

  CREATE TABLE IF NOT EXISTS map_pins (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    type TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    description TEXT,
    user_id TEXT,
    synced INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL
  );
`
