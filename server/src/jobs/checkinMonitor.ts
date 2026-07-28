import crypto from 'crypto'
import { getDB } from '../db/index.js'
import { broadcastAll } from '../ws/chat.js'
import { log } from '../logger.js'

const CHECK_INTERVAL_MS = 60 * 1000

export function startCheckinMonitor() {
  setInterval(() => {
    try {
      const db = getDB()
      const now = Date.now()
      const active = db.prepare("SELECT * FROM checkins WHERE status = 'active'").all() as any[]

      for (const entry of active) {
        const deadlineMs = entry.last_checkin_at + entry.interval_hours * 60 * 60 * 1000
        if (now > deadlineMs) {
          db.prepare("UPDATE checkins SET status = 'unresponsive' WHERE id = ?").run(entry.id)

          log.warn(`Check-in flagged: ${entry.display_name} is unresponsive`)

          db.prepare(
            'INSERT INTO posts (id, user_id, display_name, tag, content, pinned, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)'
          ).run(crypto.randomUUID(), 'system', 'System', 'safety',
            `User ${entry.display_name} has not checked in and is unresponsive. Last check-in: ${new Date(entry.last_checkin_at).toLocaleString()}.`,
            Date.now())

          broadcastAll({
            type: 'checkin_flagged',
            displayName: entry.display_name,
          })
        }
      }
    } catch (e) {
      log.error(`Check-in monitor tick failed: ${e}`)
    }
  }, CHECK_INTERVAL_MS)

  log.info('Check-in monitor started')
}
