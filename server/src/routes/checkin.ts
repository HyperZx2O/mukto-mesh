import { Hono } from 'hono'
import { getDB } from '../db/index.js'
import { v4 as uuid } from 'uuid'
import { adminAuth } from '../middleware/adminAuth.js'

const VALID_INTERVALS = [2, 4, 6, 12]

const checkin = new Hono()

checkin.post('/register', async (c) => {
  const db = getDB()
  const { display_name, contact_phone, interval_hours } = await c.req.json()

  if (!display_name || !contact_phone || !interval_hours) {
    return c.json({ data: null, error: 'Missing required fields' }, 400)
  }

  if (!VALID_INTERVALS.includes(interval_hours)) {
    return c.json({ data: null, error: `Invalid interval_hours. Must be one of: ${VALID_INTERVALS.join(', ')}` }, 400)
  }

  const id = uuid()
  const now = Date.now()

  db.prepare(`
    INSERT INTO checkins (id, display_name, contact_phone, interval_hours, last_checkin_at, status, created_at)
    VALUES (?, ?, ?, ?, ?, 'active', ?)
  `).run(id, display_name, contact_phone, interval_hours, now, now)

  return c.json({ data: { id }, error: null }, 201)
})

checkin.post('/ping', async (c) => {
  const db = getDB()
  const { id } = await c.req.json()

  if (!id) return c.json({ data: null, error: 'Missing id' }, 400)

  db.prepare(`
    UPDATE checkins SET last_checkin_at = ?, status = 'active' WHERE id = ?
  `).run(Date.now(), id)

  return c.json({ data: { ok: true }, error: null })
})

checkin.get('/status', adminAuth, (c) => {
  const db = getDB()
  const rows = db.prepare('SELECT * FROM checkins ORDER BY created_at DESC').all()
  return c.json({ data: rows, error: null })
})

export default checkin
