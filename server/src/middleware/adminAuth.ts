import { Context, Next } from 'hono'

export async function adminAuth(c: Context, next: Next) {
  const auth = c.req.header('Authorization')
  if (!auth || !auth.startsWith('Bearer ')) {
    return c.json({ data: null, error: 'Unauthorised' }, 401)
  }
  // TODO: Validate JWT
  await next()
}
