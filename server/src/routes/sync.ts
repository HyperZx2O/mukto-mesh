import { Hono } from 'hono'
import { upsertMissingBatch } from '../db/missing.js'
import { upsertPinBatch } from '../db/pins.js'

const sync = new Hono()

sync.post('/missing', async (c) => {
  const { entries } = await c.req.json()
  if (!Array.isArray(entries)) {
    return c.json({ data: null, error: 'Invalid payload' }, 400)
  }
  upsertMissingBatch(entries)
  return c.json({ data: { synced: entries.length }, error: null })
})

sync.post('/pins', async (c) => {
  const { pins } = await c.req.json()
  if (!Array.isArray(pins)) {
    return c.json({ data: null, error: 'Invalid payload' }, 400)
  }
  upsertPinBatch(pins)
  return c.json({ data: { synced: pins.length }, error: null })
})

export default sync
