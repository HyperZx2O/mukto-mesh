import { Hono } from 'hono'
import { getDB } from '../db/index.js'
import { v4 as uuid } from 'uuid'
import { adminAuth } from '../middleware/adminAuth.js'

const VALID_PIN_TYPES = ['shelter', 'danger', 'missing', 'medical', 'general']

const pins = new Hono()

pins.get('/', (c) => {
  const db = getDB()
  const rows = db.prepare('SELECT * FROM map_pins ORDER BY created_at DESC').all()
  return c.json({ data: rows, error: null })
})

pins.post('/', async (c) => {
  const db = getDB()
  const { label, type, lat, lng, description, user_id } = await c.req.json()

  if (!label || !type || lat === undefined || lng === undefined) {
    return c.json({ data: null, error: 'Missing required fields' }, 400)
  }

  if (!VALID_PIN_TYPES.includes(type)) {
    return c.json({ data: null, error: `Invalid type. Must be one of: ${VALID_PIN_TYPES.join(', ')}` }, 400)
  }

  if (typeof lat !== 'number' || typeof lng !== 'number' || !isFinite(lat) || !isFinite(lng) ||
      lat < 20.3 || lat > 26.7 || lng < 88.0 || lng > 92.7) {
    return c.json({ data: null, error: 'Coordinates must be within Bangladesh (lat 20.3–26.7, lng 88.0–92.7)' }, 400)
  }

  const id = uuid()
  const now = Date.now()

  db.prepare(`
    INSERT INTO map_pins (id, label, type, lat, lng, description, user_id, synced, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, label, type, lat, lng, description || null, user_id || null, now)

  const pin = db.prepare('SELECT * FROM map_pins WHERE id = ?').get(id)
  return c.json({ data: pin, error: null }, 201)
})

pins.delete('/:id', adminAuth, (c) => {
  const db = getDB()
  const id = c.req.param('id')
  db.prepare('DELETE FROM map_pins WHERE id = ?').run(id)
  return c.json({ data: { deleted: true }, error: null })
})

export default pins
