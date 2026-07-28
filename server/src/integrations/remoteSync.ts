import { config } from '../config.js'
import { log } from '../logger.js'
import { getDB } from '../db/index.js'

const SYNC_INTERVAL_MS = 5 * 60 * 1000

export async function syncToRemote(): Promise<void> {
  if (!config.REMOTE_SYNC_URL) {
    log.warn('Remote sync URL not configured — sync disabled')
    return
  }

  const db = getDB()
  const unsyncedMissing = db.prepare("SELECT * FROM missing_persons WHERE synced = 0").all() as any[]
  const unsyncedPins = db.prepare("SELECT * FROM map_pins WHERE synced = 0").all() as any[]

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
        const ids = unsyncedMissing.map((e: any) => e.id)
        db.prepare(`UPDATE missing_persons SET synced = 1 WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids)
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
        const ids = unsyncedPins.map((p: any) => p.id)
        db.prepare(`UPDATE map_pins SET synced = 1 WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids)
        log.info(`Synced ${ids.length} map pins`)
      } else {
        log.warn(`Sync pins failed: ${res.status}`)
      }
    } catch (e) {
      log.warn(`Sync pins error: ${e}`)
    }
  }
}

export function startSyncJob() {
  syncToRemote()
  setInterval(syncToRemote, SYNC_INTERVAL_MS)
  log.info('Remote sync job started (5 min interval)')
}
