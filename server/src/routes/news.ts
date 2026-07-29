import { Hono } from 'hono'
import { getAllNews } from '../db/news.js'
import { fetchNews } from '../jobs/newsFetcher.js'

const news = new Hono()

news.get('/', (c) => {
  const rows = getAllNews() as Record<string, unknown>[]
  return c.json({
    data: rows.map((r) => ({
      id: r.id,
      title: r.title,
      source: r.source,
      url: r.url,
      content: r.content,
      publishedAt: r.published_at,
      fetchedAt: r.fetched_at,
    })),
    error: null,
  })
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
