import { Hono } from 'hono'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { getConnectionCount, broadcastToAll } from '../ws/chat.js'
import { adminAuth } from '../middleware/adminAuth.js'
import { WsEvent } from '../ws/chat.js'
import { deleteAllMessages } from '../db/messages.js'

const admin = new Hono()

admin.post('/login', async (c) => {
  const { password } = await c.req.json()
  if (password !== config.ADMIN_PASSWORD) {
    return c.json({ data: null, error: 'Unauthorised' }, 401)
  }
  const token = jwt.sign({ role: 'admin' }, config.ADMIN_PASSWORD, { expiresIn: '24h' })
  return c.json({ data: { token }, error: null })
})

admin.get('/connections', adminAuth, (c) => {
  return c.json({ data: { count: getConnectionCount() }, error: null })
})

admin.post('/broadcast', adminAuth, async (c) => {
  const { message } = await c.req.json()
  broadcastToAll({ type: WsEvent.BROADCAST, message, createdAt: Date.now() })
  return c.json({ data: { ok: true }, error: null })
})

admin.delete('/messages', adminAuth, async (c) => {
  deleteAllMessages()
  broadcastToAll({ type: WsEvent.MESSAGES_CLEARED, clearedAt: Date.now() })
  return c.json({ data: { ok: true }, error: null })
})

export default admin
