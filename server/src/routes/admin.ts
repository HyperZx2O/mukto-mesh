import { Hono } from 'hono'
import { config } from '../config.js'
import { getConnectionCount, broadcastToAll } from '../ws/chat.js'

const admin = new Hono()

// TODO: Add JWT middleware for all admin routes

admin.post('/login', async (c) => {
  const { password } = await c.req.json()
  if (password !== config.ADMIN_PASSWORD) {
    return c.json({ data: null, error: 'Unauthorised' }, 401)
  }
  // TODO: Return JWT token
  return c.json({ data: { token: 'TODO_JWT' }, error: null })
})

admin.get('/connections', (c) => {
  return c.json({ data: { count: getConnectionCount() }, error: null })
})

admin.post('/broadcast', async (c) => {
  const { message } = await c.req.json()
  broadcastToAll({ type: 'broadcast', message, createdAt: Date.now() })
  return c.json({ data: { ok: true }, error: null })
})

export default admin
