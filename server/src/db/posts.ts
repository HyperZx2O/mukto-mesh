import crypto from 'crypto'
import { getDB } from './index.js'

export function getAllPosts() {
  const db = getDB()
  return db.prepare('SELECT * FROM posts ORDER BY pinned DESC, created_at DESC').all()
}

export function getPostById(id: string) {
  const db = getDB()
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(id)
}

export function createPost(data: { display_name: string; user_id?: string; tag: string; content: string }) {
  const db = getDB()
  const id = crypto.randomUUID()
  const now = Date.now()
  db.prepare(
    'INSERT INTO posts (id, user_id, display_name, tag, content, pinned, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)'
  ).run(id, data.user_id || 'anonymous', data.display_name, data.tag, data.content, now)
  return getPostById(id)!
}

export function setPinned(id: string, pinned: number) {
  getDB().prepare('UPDATE posts SET pinned = ? WHERE id = ?').run(pinned, id)
}

export function deletePost(id: string) {
  getDB().prepare('DELETE FROM posts WHERE id = ?').run(id)
}
