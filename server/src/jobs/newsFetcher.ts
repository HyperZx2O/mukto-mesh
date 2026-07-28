import Parser from 'rss-parser'
import { log } from '../logger.js'
import { upsertArticle } from '../db/news.js'

const parser = new Parser()

const SOURCES = [
  { name: 'prothomalo', url: 'https://www.prothomalo.com/feed/' },
  { name: 'dailystar', url: 'https://www.thedailystar.net/rss.xml' },
  { name: 'bdnews24', url: 'https://bdnews24.com/?feed=rss2' },
]

const FETCH_INTERVAL_MS = 30 * 60 * 1000

export async function fetchNews() {
  for (const source of SOURCES) {
    try {
      const feed = await parser.parseURL(source.url)
      for (const item of feed.items.slice(0, 20)) {
        if (!item.link || !item.title) continue
        upsertArticle({
          title: item.title, source: source.name, url: item.link,
          content: item.contentSnippet || item.summary || null,
          published_at: item.pubDate ? new Date(item.pubDate).getTime() : null,
        })
      }
      log.info(`Fetched ${feed.items.length} articles from ${source.name}`)
    } catch (e) {
      log.warn(`Failed to fetch ${source.name}: ${e}`)
    }
  }
}

export function startNewsFetcher() {
  fetchNews()
  setInterval(() => { try { fetchNews() } catch (e) { log.error(`News fetcher tick failed: ${e}`) } }, FETCH_INTERVAL_MS)
  log.info('News fetcher started (30 min interval)')
}
