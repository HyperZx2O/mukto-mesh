import Parser from 'rss-parser'
import { getDB } from '../db/index.js'
import { v4 as uuid } from 'uuid'
import { log } from '../logger.js'

const parser = new Parser()

const SOURCES = [
  { name: 'prothomalo', url: 'https://www.prothomalo.com/feed/' },
  { name: 'dailystar', url: 'https://www.thedailystar.net/rss.xml' },
  { name: 'bdnews24', url: 'https://bdnews24.com/?feed=rss2' },
]

const FETCH_INTERVAL_MS = 30 * 60 * 1000

export async function fetchNews() {
  const db = getDB()
  for (const source of SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)
      const insert = db.prepare(`
        INSERT OR IGNORE INTO news_articles (id, title, source, url, content, published_at, fetched_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      const now = Date.now()
      for (const item of feed.items.slice(0, 20)) {
        if (!item.link || !item.title) continue
        insert.run(
          uuid(), item.title, source.name, item.link,
          item.contentSnippet || item.summary || null,
          item.pubDate ? new Date(item.pubDate).getTime() : null, now,
        )
      }
      log.info(`Fetched ${feed.items.length} articles from ${source.name}`)
    } catch (e) {
      log.warn(`Failed to fetch ${source.name}: ${e}`)
    }
  }
}

export function startNewsFetcher() {
  fetchNews()
  setInterval(fetchNews, FETCH_INTERVAL_MS)
  log.info('News fetcher started (30 min interval)')
}
