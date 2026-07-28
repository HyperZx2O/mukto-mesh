import crypto from 'crypto'
import { getDB } from './index.js'

export function registerCheckin(data: { display_name: string; contact_phone: string; interval_hours: number }) {
  const db = getDB()
  const id = crypto.randomUUID()
  const now = Date.now()
  db.prepare(
    'INSERT INTO checkins (id, display_name, contact_phone, interval_hours, last_checkin_at, status, created_at) VALUES (?, ?, ?, ?, ?, \'active\', ?)'
  ).run(id, data.display_name, data.contact_phone, data.interval_hours, now, now)
  return id
}

export function pingCheckin(id: string) {
  getDB().prepare("UPDATE checkins SET last_checkin_at = ?, status = 'active' WHERE id = ?").run(Date.now(), id)
}

export function getCheckinById(id: string) {
  return getDB().prepare('SELECT * FROM checkins WHERE id = ?').get(id)
}

export function getAllCheckins() {
  return getDB().prepare('SELECT * FROM checkins ORDER BY created_at DESC').all()
}

export function getActiveCheckins() {
  return getDB().prepare("SELECT * FROM checkins WHERE status = 'active'").all()
}

export function flagUnresponsive(id: string) {
  getDB().prepare("UPDATE checkins SET status = 'unresponsive' WHERE id = ?").run(id)
}
