import crypto from 'crypto'
import { getDB } from './index.js'

export function getMessages(channel: string, limit = 100) {
  return getDB().prepare(
    'SELECT * FROM messages WHERE channel = ? ORDER BY created_at DESC LIMIT ?'
  ).all(channel, limit)
}

export function createMessage(data: {
  user_id: string; display_name: string; channel: string; content: string
}) {
  const db = getDB()
  const id = crypto.randomUUID()
  const now = Date.now()
  db.prepare(
    'INSERT INTO messages (id, user_id, display_name, channel, content, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, data.user_id, data.display_name, data.channel, data.content, now)
  return { id, createdAt: now }
}

export function getLastMessages(channel: string, limit = 50) {
  const db = getDB()
  const rows = db.prepare(
    'SELECT * FROM messages WHERE channel = ? ORDER BY created_at DESC LIMIT ?'
  ).all(channel, limit)
  return (rows as any[]).reverse()
}
