import { serve } from '@hono/node-server'
import { WebSocketServer } from 'ws'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from './config.js'
import { log } from './logger.js'
import { initDB } from './db/index.js'
import { createWSHandler } from './ws/chat.js'

// Routes
import posts from './routes/posts.js'
import missing from './routes/missing.js'
import checkin from './routes/checkin.js'
import news from './routes/news.js'
import pins from './routes/pins.js'
import sync from './routes/sync.js'
import admin from './routes/admin.js'
import messages from './routes/messages.js'

// Jobs
import { startCheckinMonitor } from './jobs/checkinMonitor.js'
import { startNewsFetcher } from './jobs/newsFetcher.js'
import { startSyncJob } from './integrations/remoteSync.js'

const app = new Hono()

// Request logging
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  log.info(`${c.req.method} ${c.req.path} ${c.res.status} ${ms}ms`)
})

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
app.route('/api/messages', messages)

// Start background jobs
startCheckinMonitor()
startNewsFetcher()
startSyncJob()

// Health check
app.get('/health', (c) =>
  c.json({ data: { status: 'ok', timestamp: new Date().toISOString() }, error: null })
)

app.onError((err, c) => {
  log.error(`${err.stack || err.message || err}`)
  return c.json({ data: null, error: 'Internal server error' }, 500)
})

// 404
app.notFound((c) =>
  c.json({ data: null, error: 'Not found' }, 404)
)

// WebSocket — handle upgrade manually via ws library
const wss = new WebSocketServer({ noServer: true })
const wsHandler = createWSHandler()

wss.on('connection', (ws) => {
  wsHandler.onOpen(null, ws)
  ws.on('message', (data) => wsHandler.onMessage({ data }, ws))
  ws.on('close', () => wsHandler.onClose(null, ws))
})

process.on('uncaughtException', (err) => log.error(`Uncaught exception: ${err}`))
process.on('unhandledRejection', (reason) => log.error(`Unhandled rejection: ${reason}`))

const server = serve({ fetch: app.fetch, port: config.PORT }, () => {
  log.info(`Server running on http://localhost:${config.PORT}`)
  log.info(`Share http://[your-local-ip]:${config.PORT} with your network`)
})

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req)
    })
  } else {
    socket.destroy()
  }
})
