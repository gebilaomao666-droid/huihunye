-- 回魂夜 后端 (Cloudflare D1 / SQLite)
-- 字段名沿用 java-backend/sql/schema.sql, 前端契约不变

CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    name TEXT,
    started_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT,
    fear_score REAL,
    ending_type TEXT,
    choice_count INTEGER DEFAULT 0,
    death_count INTEGER DEFAULT 0,
    survive_time INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_fear ON sessions(fear_score);
CREATE INDEX IF NOT EXISTS idx_sessions_ending ON sessions(ending_type);

CREATE TABLE IF NOT EXISTS progress (
    session_id TEXT PRIMARY KEY,
    node_id TEXT NOT NULL,
    chapter TEXT,
    time_in_game TEXT,
    choice_path TEXT,
    ghost_opacity REAL DEFAULT 0.01,
    inventory TEXT,
    flags TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deaths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    node_id TEXT NOT NULL,
    death_name TEXT NOT NULL,
    death_desc TEXT,
    chapter TEXT,
    died_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_deaths_time ON deaths(died_at);

CREATE TABLE IF NOT EXISTS last_words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    content TEXT NOT NULL,
    ending_name TEXT,
    player_name TEXT DEFAULT '匿名',
    likes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS node_stats (
    node_id TEXT PRIMARY KEY,
    visits INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    passes INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    node_id TEXT,
    payload TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);

CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    question_index INTEGER NOT NULL,
    question_text TEXT,
    choice_index INTEGER NOT NULL,
    choice_text TEXT,
    node_id TEXT,
    chapter TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS player_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    achievement_code TEXT NOT NULL,
    session_id TEXT,
    unlocked_at TEXT DEFAULT (datetime('now')),
    UNIQUE(player_id, achievement_code)
);

-- 招魂码: 跨设备的收集进度(结局/死法/成就/周目), 不是账号, 没有密码
CREATE TABLE IF NOT EXISTS souls (
    code TEXT PRIMARY KEY,
    name TEXT,
    endings TEXT DEFAULT '[]',
    deaths_seen TEXT DEFAULT '[]',
    achievements TEXT DEFAULT '[]',
    death_count INTEGER DEFAULT 0,
    runs INTEGER DEFAULT 0,
    ng_plus INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);
