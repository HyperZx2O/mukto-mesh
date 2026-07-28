import { Hono } from 'hono'
import { getAllPosts, getPostById, createPost as dbCreatePost, setPinned, deletePost } from '../db/posts.js'
import { broadcastToAll } from '../ws/chat.js'
import { adminAuth } from '../middleware/adminAuth.js'
import { WsEvent } from '../types.js'

const VALID_TAGS = ['safety', 'medical', 'food', 'legal', 'news', 'general']

const posts = new Hono()

posts.get('/', (c) => {
  const rows = getAllPosts()
  return c.json({ data: rows, error: null })
})

posts.post('/', async (c) => {
  const body = await c.req.json()
  const { display_name, user_id, tag, content } = body

  if (!display_name || !tag || !content) {
    return c.json({ data: null, error: 'Missing required fields' }, 400)
  }

  if (!VALID_TAGS.includes(tag)) {
    return c.json({ data: null, error: `Invalid tag. Must be one of: ${VALID_TAGS.join(', ')}` }, 400)
  }

  const trimmed = content.trim()
  if (!trimmed) {
    return c.json({ data: null, error: 'content cannot be empty after trimming whitespace' }, 400)
  }

  const post = dbCreatePost({ display_name, user_id, tag, content: trimmed })
  broadcastToAll({ type: WsEvent.POST_CREATED, post })
  return c.json({ data: post, error: null }, 201)
})

posts.patch('/:id/pin', adminAuth, (c) => {
  const id = c.req.param('id')
  const post = getPostById(id) as any

  if (!post) return c.json({ data: null, error: 'Post not found' }, 404)

  const newPinned = post.pinned ? 0 : 1
  setPinned(id, newPinned)
  broadcastToAll({ type: WsEvent.POST_PINNED, id, pinned: !!newPinned })
  return c.json({ data: { id, pinned: !!newPinned }, error: null })
})

posts.delete('/:id', adminAuth, (c) => {
  const id = c.req.param('id')
  deletePost(id)
  return c.json({ data: { deleted: true }, error: null })
})

export default posts
