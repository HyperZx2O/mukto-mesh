import { Hono } from 'hono'
import { getDB } from '../db/index.js'
import { v4 as uuid } from 'uuid'

const VALID_TAGS = ['safety', 'medical', 'food', 'legal', 'news', 'general']

const posts = new Hono()

posts.get('/', (c) => {
  const db = getDB()
  const rows = db.prepare(`
    SELECT * FROM posts ORDER BY pinned DESC, created_at DESC
  `).all()
  return c.json({ data: rows, error: null })
})

posts.post('/', async (c) => {
  const db = getDB()
  const body = await c.req.json()
  const { display_name, user_id, tag, content } = body

  if (!display_name || !tag || !content) {
    return c.json({ data: null, error: 'Missing required fields' }, 400)
  }

  if (!VALID_TAGS.includes(tag)) {
    return c.json({ data: null, error: `Invalid tag. Must be one of: ${VALID_TAGS.join(', ')}` }, 400)
  }

  const id = uuid()
  const now = Date.now()

  db.prepare(`
    INSERT INTO posts (id, user_id, display_name, tag, content, pinned, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(id, user_id || 'anonymous', display_name, tag, content, now)

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id)
  return c.json({ data: post, error: null }, 201)
})

posts.patch('/:id/pin', (c) => {
  // TODO: admin auth middleware
  const db = getDB()
  const id = c.req.param('id')
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as any

  if (!post) return c.json({ data: null, error: 'Post not found' }, 404)

  db.prepare('UPDATE posts SET pinned = ? WHERE id = ?').run(post.pinned ? 0 : 1, id)
  return c.json({ data: { id, pinned: !post.pinned }, error: null })
})

posts.delete('/:id', (c) => {
  // TODO: admin auth middleware
  const db = getDB()
  const id = c.req.param('id')
  db.prepare('DELETE FROM posts WHERE id = ?').run(id)
  return c.json({ data: { deleted: true }, error: null })
})

export default posts
