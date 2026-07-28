import { Hono } from 'hono'
import { registerCheckin, pingCheckin, getCheckinById, getAllCheckins } from '../db/checkins.js'
import { adminAuth } from '../middleware/adminAuth.js'

const VALID_INTERVALS = [2, 4, 6, 12]

const checkin = new Hono()

checkin.post('/register', async (c) => {
  const { display_name, contact_phone, interval_hours } = await c.req.json()

  if (!display_name || !contact_phone || !interval_hours) {
    return c.json({ data: null, error: 'Missing required fields' }, 400)
  }

  if (!VALID_INTERVALS.includes(interval_hours)) {
    return c.json({ data: null, error: `Invalid interval_hours. Must be one of: ${VALID_INTERVALS.join(', ')}` }, 400)
  }

  const id = registerCheckin({ display_name, contact_phone, interval_hours })
  return c.json({ data: { id }, error: null }, 201)
})

checkin.get('/lookup/:id', (c) => {
  const id = c.req.param('id')
  if (!id) return c.json({ data: null, error: 'Missing id param' }, 400)
  const row = getCheckinById(id) as Record<string, unknown> | undefined
  if (!row) return c.json({ data: null, error: 'Not found' }, 404)
  // Map snake_case to camelCase for client
  return c.json({
    data: {
      id: row.id,
      displayName: row.display_name,
      contactPhone: row.contact_phone,
      intervalHours: row.interval_hours,
      lastCheckinAt: row.last_checkin_at,
      status: row.status,
      createdAt: row.created_at,
    },
    error: null,
  })
})

checkin.post('/ping', async (c) => {
  const { id } = await c.req.json()
  if (!id) return c.json({ data: null, error: 'Missing id' }, 400)

  pingCheckin(id)
  return c.json({ data: { ok: true }, error: null })
})

checkin.get('/status', adminAuth, (c) => {
  const rows = getAllCheckins()
  return c.json({ data: rows, error: null })
})

export default checkin
