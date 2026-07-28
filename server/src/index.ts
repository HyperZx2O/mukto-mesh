import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { WebSocketServer } from 'ws'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { config } from './config.js'
import { log } from './logger.js'
import { initDB } from './db/index.js'
import { createWSHandler } from './ws/chat.js'
import path from 'path'
import fs from 'fs'

// Tiles are served from client/public/tiles/ relative to project root
// In production, Vite copies public/ to dist/, so check both locations
const PUBLIC_DIR = path.resolve(process.cwd(), '../client/public')
const DIST_DIR = path.resolve(process.cwd(), '../client/dist')

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

// Serve map tiles from client/public/tiles/ — PMTiles needs HTTP Range support
// Fall back to dist/ in production (Vite copies public/ to dist/ on build)
app.use('/tiles/*', async (c, next) => {
  await next()
  // Ensure PMTiles files get correct headers for HTTP Range requests
  if (c.req.path.endsWith('.pmtiles') && c.res.status === 200) {
    // Set proper content type if not already set
    if (!c.res.headers.get('Content-Type')) {
      c.res.headers.set('Content-Type', 'application/octet-stream')
    }
    c.res.headers.set('Accept-Ranges', 'bytes')
    c.res.headers.set('Cache-Control', 'public, max-age=86400')
  }
})
// Try public/ first (dev), fall back to dist/ (prod build)
app.use('/tiles/*', serveStatic({ root: PUBLIC_DIR }))
if (fs.existsSync(path.join(DIST_DIR, 'tiles'))) {
  app.use('/tiles/*', serveStatic({ root: DIST_DIR }))
}

// Serve uploaded photos
app.use('/uploads/*', serveStatic({ root: path.resolve(process.cwd()) }))

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

// Public node status endpoint (lightweight, no auth needed)
// Returns connection count and check-in summary for the Dashboard
import { getConnectionCount } from './ws/chat.js'
import { getAllCheckins } from './db/checkins.js'

app.get('/api/status', (c) => {
  const connectedUsers = getConnectionCount()
  const allCheckins = getAllCheckins() as Record<string, unknown>[]
  const totalCheckins = allCheckins.length
  const activeCheckins = allCheckins.filter((c: Record<string, unknown>) => c.status === 'active').length
  const unresponsiveCheckins = allCheckins.filter((c: Record<string, unknown>) => c.status === 'unresponsive').length

  return c.json({
    data: {
      connectedUsers,
      checkins: { total: totalCheckins, active: activeCheckins, unresponsive: unresponsiveCheckins },
      uptime: process.uptime(),
    },
    error: null,
  })
})

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

// Serve built client static files in production
if (config.NODE_ENV === 'production' || process.argv.includes('--serve-static')) {
  const CLIENT_DIST = path.resolve(process.cwd(), '../client/dist')
  app.use('/*', serveStatic({ root: CLIENT_DIST }))
  app.get('*', (c) => {
    // SPA fallback — serve index.html for all non-API routes
    if (!c.req.path.startsWith('/api/') && !c.req.path.startsWith('/ws')) {
      return c.html(fs.readFileSync(path.join(CLIENT_DIST, 'index.html'), 'utf-8'))
    }
    return c.json({ data: null, error: 'Not found' }, 404)
  })
} else {
  // 404 for API-only mode (development)
  app.notFound((c) =>
    c.json({ data: null, error: 'Not found' }, 404)
  )
}

// WebSocket — handle upgrade manually via ws library
const wss = new WebSocketServer({ noServer: true })
const wsHandler = createWSHandler()

wss.on('connection', (ws) => {
  wsHandler.onOpen(null, ws)
  ws.on('message', (data: Buffer) => wsHandler.onMessage({ data: String(data) }, ws))
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
