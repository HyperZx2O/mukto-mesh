import { Hono } from 'hono'
import { getAllMissing, searchMissing, createMissing, updateMissingStatus } from '../db/missing.js'
import { adminAuth } from '../middleware/adminAuth.js'
import path from 'path'
import fs from 'fs'

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads')

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
  const contentType = c.req.header('content-type') || ''
  let body: Record<string, unknown>
  let photoUrl: string | null = null

  if (contentType.includes('multipart/form-data')) {
    const form = await c.req.parseBody()
    body = {
      name: form.name,
      age: form.age ? Number(form.age) : undefined,
      gender: form.gender || undefined,
      last_location: form.last_location,
      description: form.description || undefined,
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
    }
    const photo = form.photo
    if (photo instanceof File) {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
      const ext = path.extname(photo.name) || '.jpg'
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
      const buffer = Buffer.from(await photo.arrayBuffer())
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer)
      photoUrl = `/uploads/${filename}`
    }
  } else {
    body = await c.req.json() as Record<string, unknown>
    photoUrl = String(body.photo_url || '' ) || null
  }

  const name = String(body.name || '')
  const age = body.age ? Number(body.age) : undefined
  const gender = body.gender ? String(body.gender) : undefined
  const last_location = String(body.last_location || '')
  const description = body.description ? String(body.description) : undefined
  const contact_name = String(body.contact_name || '')
  const contact_phone = String(body.contact_phone || '')

  if (!name || !last_location || !contact_name || !contact_phone) {
    return c.json({ data: null, error: 'Missing required fields' }, 400)
  }

  const entry = createMissing({
    name, age: age ? Number(age) : undefined, gender: gender || undefined,
    last_location, description: description || undefined,
    contact_name, contact_phone, photo_url: photoUrl || undefined,
  })
  return c.json({ data: entry, error: null }, 201)
})

missing.patch('/:id/status', adminAuth, async (c) => {
  const id = c.req.param('id')!
  const { status } = await c.req.json()

  if (!['missing', 'found', 'unverified'].includes(status)) {
    return c.json({ data: null, error: 'Invalid status' }, 400)
  }

  updateMissingStatus(id, status)
  return c.json({ data: { id, status }, error: null })
})

export default missing
