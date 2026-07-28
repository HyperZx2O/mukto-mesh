import { Hono } from 'hono'
import { getDB } from '../db/index.js'

const VALID_CHANNELS = ['general', 'emergency', 'coordination', 'medical']

const messages = new Hono()

messages.get('/', (c) => {
  const channel = c.req.query('channel')

  if (!channel || !VALID_CHANNELS.includes(channel)) {
    return c.json({ data: null, error: `Invalid channel. Must be one of: ${VALID_CHANNELS.join(', ')}` }, 400)
  }

  const db = getDB()
  const rows = db.prepare(
    'SELECT * FROM messages WHERE channel = ? ORDER BY created_at DESC LIMIT 100'
  ).all(channel)

  return c.json({ data: rows, error: null })
})

export default messages
