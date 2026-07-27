import { getDB } from '../db/index.js'
import { broadcastAll } from '../ws/chat.js'

const CHECK_INTERVAL_MS = 60 * 1000 // check every minute

export function startCheckinMonitor() {
  setInterval(() => {
    const db = getDB()
    const now = Date.now()

    const active = db.prepare(`
      SELECT * FROM checkins WHERE status = 'active'
    `).all() as any[]

    for (const entry of active) {
      const deadlineMs = entry.last_checkin_at + entry.interval_hours * 60 * 60 * 1000
      if (now > deadlineMs) {
        db.prepare(`UPDATE checkins SET status = 'unresponsive' WHERE id = ?`).run(entry.id)

        console.warn(`[CHECK-IN] ${entry.display_name} is unresponsive`)

        // Broadcast to all WS clients
        broadcastAll({
          type: 'checkin_flagged',
          displayName: entry.display_name,
        })

        // TODO: Send SMS via Twilio if configured
      }
    }
  }, CHECK_INTERVAL_MS)

  console.log('[CHECK-IN] Monitor started')
}
