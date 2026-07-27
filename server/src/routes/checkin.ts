import { Hono } from 'hono'
import { getDB } from '../db/index.js'
import { v4 as uuid } from 'uuid'

const checkin = new Hono()

checkin.post('/register', async (c) => {
  const db = getDB()
  const { display_name, contact_phone, interval_hours } = await c.req.json()

  if (!display_name || !contact_phone || !interval_hours) {
    return c.json({ data: null, error: 'Missing required fields' }, 400)
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

checkin.get('/status', (c) => {
  // TODO: admin auth middleware
  const db = getDB()
  const rows = db.prepare('SELECT * FROM checkins ORDER BY created_at DESC').all()
  return c.json({ data: rows, error: null })
})

export default checkin
