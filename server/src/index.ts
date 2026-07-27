import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
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
const PORT = Number(process.env.PORT) || 3000

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
app.get('/health', (c) => c.json({ status: 'ok', offline: true }))

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`[Mukto Mesh] Server running on http://localhost:${PORT}`)
  console.log(`[Mukto Mesh] Share http://[your-local-ip]:${PORT} with your network`)
})
