import { Hono } from 'hono'
import { getAllMissing, searchMissing, createMissing, updateMissingStatus } from '../db/missing.js'
import { adminAuth } from '../middleware/adminAuth.js'

const missing = new Hono()

missing.get('/', (c) => {
  const rows = getAllMissing()
  return c.json({ data: rows, error: null })
})

missing.get('/search', (c) => {
  const q = c.req.query('q') || ''
  const rows = searchMissing(q)
  return c.json({ data: rows, error: null })
})

missing.post('/', async (c) => {
  const body = await c.req.json()
  const { name, age, gender, last_location, description, contact_name, contact_phone, photo_url } = body

  if (!name || !last_location || !contact_name || !contact_phone) {
    return c.json({ data: null, error: 'Missing required fields' }, 400)
  }

  const entry = createMissing({ name, age, gender, last_location, description, contact_name, contact_phone, photo_url })
  return c.json({ data: entry, error: null }, 201)
})

missing.patch('/:id/status', adminAuth, async (c) => {
  const id = c.req.param('id')
  const { status } = await c.req.json()

  if (!['missing', 'found', 'unverified'].includes(status)) {
    return c.json({ data: null, error: 'Invalid status' }, 400)
  }

  updateMissingStatus(id, status)
  return c.json({ data: { id, status }, error: null })
})

export default missing
