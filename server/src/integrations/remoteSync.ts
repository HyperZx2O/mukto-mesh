import { Hono } from 'hono'
import { config } from '../config.js'
import { log } from '../logger.js'
import { getUnsyncedMissing, markMissingSynced, upsertMissingBatch } from '../db/missing.js'
import { getUnsyncedPins, markPinsSynced, upsertPinBatch } from '../db/pins.js'

const SYNC_INTERVAL_MS = 5 * 60 * 1000

export async function syncToRemote(): Promise<void> {
  if (!config.REMOTE_SYNC_URL) {
    log.warn('Remote sync URL not configured — sync disabled')
    return
  }

  const unsyncedMissing = getUnsyncedMissing() as Record<string, unknown>[]
  const unsyncedPins = getUnsyncedPins() as Record<string, unknown>[]

  if (unsyncedMissing.length === 0 && unsyncedPins.length === 0) return

  const base = config.REMOTE_SYNC_URL.replace(/\/+$/, '')

  if (unsyncedMissing.length > 0) {
    try {
      const res = await fetch(`${base}/api/sync/missing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: unsyncedMissing }),
      })
      if (res.ok) {
        const ids = unsyncedMissing.map((e: Record<string, unknown>) => String(e.id))
        markMissingSynced(ids)
        log.info(`Synced ${ids.length} missing persons`)
      } else {
        log.warn(`Sync missing failed: ${res.status}`)
      }
    } catch (e) {
      log.warn(`Sync missing error: ${e}`)
    }
  }

  if (unsyncedPins.length > 0) {
    try {
      const res = await fetch(`${base}/api/sync/pins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pins: unsyncedPins }),
      })
      if (res.ok) {
        const ids = unsyncedPins.map((p: Record<string, unknown>) => String(p.id))
        markPinsSynced(ids)
        log.info(`Synced ${ids.length} map pins`)
      } else {
        log.warn(`Sync pins failed: ${res.status}`)
      }
    } catch (e) {
      log.warn(`Sync pins error: ${e}`)
    }
  }
}

const syncRouter = new Hono()

syncRouter.post('/missing', async (c) => {
  const { entries } = await c.req.json()
  if (!Array.isArray(entries)) {
    return c.json({ data: null, error: 'Invalid payload' }, 400)
  }
  upsertMissingBatch(entries)
  return c.json({ data: { synced: entries.length }, error: null })
})

syncRouter.post('/pins', async (c) => {
  const { pins } = await c.req.json()
  if (!Array.isArray(pins)) {
    return c.json({ data: null, error: 'Invalid payload' }, 400)
  }
  upsertPinBatch(pins)
  return c.json({ data: { synced: pins.length }, error: null })
})

export { syncRouter }

export function startSyncJob() {
  syncToRemote()
  setInterval(() => { try { syncToRemote() } catch (e) { log.error(`Sync tick failed: ${e}`) } }, SYNC_INTERVAL_MS)
  log.info('Remote sync job started (5 min interval)')
}
