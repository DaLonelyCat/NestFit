-- Cloudflare D1 Database Schema for NestFit

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- User custom workout schedules
CREATE TABLE IF NOT EXISTS user_schedules (
    user_id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL,
    schedule_data TEXT NOT NULL, -- JSON stringified array of extended day routines
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
