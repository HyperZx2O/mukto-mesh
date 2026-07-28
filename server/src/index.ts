import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { config } from './config.js'
import { log } from './logger.js'
import { initDB } from './db/index.js'

// Routes
import posts from './routes/posts.js'
import missing from './routes/missing.js'
import checkin from './routes/checkin.js'
import news from './routes/news.js'
import pins from './routes/pins.js'
import sync from './routes/sync.js'
import admin from './routes/admin.js'

// Jobs
import { startCheckinMonitor } from './jobs/checkinMonitor.js'
import { fetchNews } from './jobs/newsFetcher.js'

const app = new Hono()

// Middleware
app.use('*', logger())
app.use('*', cors())

// Init DB
initDB()

// Routes
app.route('/api/posts', posts)
app.route('/api/missing', missing)
app.route('/api/checkin', checkin)
app.route('/api/news', news)
app.route('/api/pins', pins)
app.route('/api/sync', sync)
app.route('/api/admin', admin)

// WebSocket — wired in chat.ts
// TODO: import and attach WS handler

// Start background jobs
startCheckinMonitor()
fetchNews()

// Health check
app.get('/health', (c) =>
  c.json({ data: { status: 'ok', timestamp: new Date().toISOString() }, error: null })
)

serve({ fetch: app.fetch, port: config.PORT }, () => {
  log.info(`Server running on http://localhost:${config.PORT}`)
  log.info(`Share http://[your-local-ip]:${config.PORT} with your network`)
})
