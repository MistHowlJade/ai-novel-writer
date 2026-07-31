import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'

let db: Database.Database | null = null

export function initDb(location?: string): void {
  if (db) return
  const file = location ?? path.join(app.getPath('userData'), 'novel-writer.db')
  db = new Database(file)
  db.pragma('journal_mode = WAL')
  db.exec(SCHEMA)
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY, title TEXT NOT NULL, synopsis TEXT DEFAULT '', genre TEXT DEFAULT '',
  target_words INTEGER DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS volumes (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY, volume_id TEXT NOT NULL REFERENCES volumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL, content TEXT DEFAULT '', word_count INTEGER DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0, status TEXT DEFAULT 'draft', updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS characters (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL, role TEXT DEFAULT '', appearance TEXT DEFAULT '',
  personality TEXT DEFAULT '', background TEXT DEFAULT '', relations TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL, name TEXT NOT NULL, description TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS ai_config (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  provider TEXT DEFAULT 'cloud', model TEXT DEFAULT 'deepseek-chat',
  api_key TEXT DEFAULT '', base_url TEXT DEFAULT ''
);
INSERT OR IGNORE INTO ai_config (id) VALUES (1);
`

export function getDb(): Database.Database {
  if (!db) throw new Error('db not initialized; call initDb() first')
  return db
}

export function closeDb(): void {
  db?.close()
  db = null
}
