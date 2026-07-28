import { Context, Next } from 'hono'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export async function adminAuth(c: Context, next: Next) {
  const auth = c.req.header('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ data: null, error: 'Unauthorised' }, 401)
  }
  try {
    jwt.verify(auth.slice(7), config.ADMIN_PASSWORD)
  } catch {
    return c.json({ data: null, error: 'Unauthorised' }, 401)
  }
  await next()
}
