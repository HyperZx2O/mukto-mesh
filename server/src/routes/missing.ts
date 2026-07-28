import { Hono } from 'hono'
import { getDB } from '../db/index.js'
import { v4 as uuid } from 'uuid'
import { adminAuth } from '../middleware/adminAuth.js'

const missing = new Hono()

missing.get('/', (c) => {
  const db = getDB()
  const rows = db.prepare('SELECT * FROM missing_persons ORDER BY created_at DESC').all()
  return c.json({ data: rows, error: null })
})

missing.get('/search', (c) => {
  const db = getDB()
  const q = c.req.query('q') || ''
  const rows = db.prepare(`
    SELECT * FROM missing_persons
    WHERE name LIKE ? OR last_location LIKE ?
    ORDER BY created_at DESC
  `).all(`%${q}%`, `%${q}%`)
  return c.json({ data: rows, error: null })
})

missing.post('/', async (c) => {
  const db = getDB()
  const body = await c.req.json()
  const { name, age, gender, last_location, description, contact_name, contact_phone, photo_url } = body

  if (!name || !last_location || !contact_name || !contact_phone) {
    return c.json({ data: null, error: 'Missing required fields' }, 400)
  }

  const id = uuid()
  const now = Date.now()

  db.prepare(`
    INSERT INTO missing_persons
    (id, name, age, gender, last_location, description, contact_name, contact_phone, photo_url, status, synced, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'missing', 0, ?)
  `).run(id, name, age || null, gender || null, last_location, description || null, contact_name, contact_phone, photo_url || null, now)

  const entry = db.prepare('SELECT * FROM missing_persons WHERE id = ?').get(id)
  return c.json({ data: entry, error: null }, 201)
})

missing.patch('/:id/status', adminAuth, async (c) => {
  const db = getDB()
  const id = c.req.param('id')
  const { status } = await c.req.json()

  if (!['missing', 'found', 'unverified'].includes(status)) {
    return c.json({ data: null, error: 'Invalid status' }, 400)
  }

  db.prepare('UPDATE missing_persons SET status = ? WHERE id = ?').run(status, id)
  return c.json({ data: { id, status }, error: null })
})

export default missing
