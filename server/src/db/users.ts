import crypto from 'crypto'
import { getDB } from './index.js'

export function upsertUser(id: string, displayName: string) {
  const db = getDB()
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  if (existing) return existing
  db.prepare('INSERT INTO users (id, display_name, created_at) VALUES (?, ?, ?)').run(id, displayName, Date.now())
}
