import { Hono } from 'hono'
import { getDB } from '../db/index.js'

const sync = new Hono()

// Remote server receives synced data from local nodes
sync.post('/missing', async (c) => {
  const db = getDB()
  const { entries } = await c.req.json()

  if (!Array.isArray(entries)) {
    return c.json({ data: null, error: 'Invalid payload' }, 400)
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO missing_persons
    (id, name, age, gender, last_location, description, contact_name, contact_phone, photo_url, status, synced, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `)

  const insertMany = db.transaction((entries: any[]) => {
    for (const e of entries) {
      insert.run(e.id, e.name, e.age, e.gender, e.last_location, e.description, e.contact_name, e.contact_phone, e.photo_url, e.status, e.created_at)
    }
  })

  insertMany(entries)
  return c.json({ data: { synced: entries.length }, error: null })
})

sync.post('/pins', async (c) => {
  const db = getDB()
  const { pins } = await c.req.json()

  if (!Array.isArray(pins)) {
    return c.json({ data: null, error: 'Invalid payload' }, 400)
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO map_pins (id, label, type, lat, lng, description, user_id, synced, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
  `)

  const insertMany = db.transaction((pins: any[]) => {
    for (const p of pins) {
      insert.run(p.id, p.label, p.type, p.lat, p.lng, p.description, p.user_id, p.created_at)
    }
  })

  insertMany(pins)
  return c.json({ data: { synced: pins.length }, error: null })
})

export default sync
