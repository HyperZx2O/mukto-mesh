import { Hono } from 'hono'
import { registerCheckin, pingCheckin, getAllCheckins } from '../db/checkins.js'
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
