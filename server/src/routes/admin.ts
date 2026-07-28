import { Hono } from 'hono'
import { config } from '../config.js'

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
  // TODO: Return active WS connection count from chat.ts
  return c.json({ data: { count: 0 }, error: null })
})

admin.post('/broadcast', async (c) => {
  const { message } = await c.req.json()
  // TODO: Broadcast to all WS clients
  console.log(`[BROADCAST] ${message}`)
  return c.json({ data: { ok: true }, error: null })
})

export default admin
