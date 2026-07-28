import { Hono } from 'hono'
import { getAllNews } from '../db/news.js'
import { fetchNews } from '../jobs/newsFetcher.js'

const news = new Hono()

news.get('/', (c) => {
  const rows = getAllNews()
  return c.json({ data: rows, error: null })
})

news.post('/refresh', async (c) => {
  try {
    await fetchNews()
    return c.json({ data: { ok: true }, error: null })
  } catch (e) {
    return c.json({ data: null, error: 'Failed to fetch news' }, 500)
  }
})

export default news
