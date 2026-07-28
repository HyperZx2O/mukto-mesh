import crypto from 'crypto'
import { getDB } from './index.js'

export function getAllNews() {
  return getDB().prepare('SELECT * FROM news_articles ORDER BY fetched_at DESC LIMIT 50').all()
}

export function upsertArticle(article: {
  title: string; source: string; url: string; content?: string | null; published_at?: number | null
}) {
  const db = getDB()
  const now = Date.now()
  db.prepare(
    'INSERT OR IGNORE INTO news_articles (id, title, source, url, content, published_at, fetched_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(crypto.randomUUID(), article.title, article.source, article.url, article.content || null, article.published_at || null, now)
}
