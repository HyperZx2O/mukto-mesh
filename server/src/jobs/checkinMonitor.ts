import { getActiveCheckins, flagUnresponsive } from '../db/checkins.js'
import { createPost } from '../db/posts.js'
import { broadcastToAll } from '../ws/chat.js'
import { log } from '../logger.js'
import { sendSms } from '../integrations/twilio.js'
import { WsEvent } from '../types.js'

const CHECK_INTERVAL_MS = 60 * 1000

export function startCheckinMonitor() {
  setInterval(() => {
    try {
      const now = Date.now()
      const active = getActiveCheckins() as Record<string, unknown>[]

      for (const entry of active) {
        const deadlineMs = Number(entry.last_checkin_at) + Number(entry.interval_hours) * 60 * 60 * 1000
        if (now > deadlineMs) {
          flagUnresponsive(String(entry.id))

          const displayName = String(entry.display_name)
          log.warn(`Check-in flagged: ${displayName} is unresponsive`)

          createPost({
            display_name: 'System',
            user_id: 'system',
            tag: 'safety',
            content: `User ${displayName} has not checked in and is unresponsive. Last check-in: ${new Date(Number(entry.last_checkin_at)).toLocaleString()}.`,
          })

          broadcastToAll({
            type: WsEvent.CHECKIN_FLAGGED,
            displayName,
          })

          sendSms(String(entry.contact_phone),
            `Alert: ${displayName} has not checked in and is unresponsive. Last check-in: ${new Date(Number(entry.last_checkin_at)).toLocaleString()}.`)
        }
      }
    } catch (e) {
      log.error(`Check-in monitor tick failed: ${e}`)
    }
  }, CHECK_INTERVAL_MS)

  log.info('Check-in monitor started')
}
