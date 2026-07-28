import { Hono } from 'hono'
import { getMessages } from '../db/messages.js'

const VALID_CHANNELS = ['general', 'emergency', 'coordination', 'medical']

const messages = new Hono()

messages.get('/', (c) => {
  const channel = c.req.query('channel')

  if (!channel || !VALID_CHANNELS.includes(channel)) {
    return c.json({ data: null, error: `Invalid channel. Must be one of: ${VALID_CHANNELS.join(', ')}` }, 400)
  }

  const rows = getMessages(channel, 100)
  return c.json({ data: rows, error: null })
})

export default messages
