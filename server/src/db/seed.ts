import crypto from 'crypto'
import type Database from 'better-sqlite3'

export function seedDB(db: Database.Database): void {
  const count = db.prepare('SELECT COUNT(*) as n FROM posts').get() as { n: number }
  if (count.n > 0) return

  db.prepare(
    'INSERT INTO posts (id, user_id, display_name, tag, content, pinned, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(crypto.randomUUID(), 'system', 'System', 'general', 'Mukto Mesh node is running. Stay safe.', 1, Date.now())

  console.log('[DB] Seeded default post')
}
