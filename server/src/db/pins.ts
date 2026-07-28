import crypto from 'crypto'
import { getDB } from './index.js'

export function getAllPins() {
  return getDB().prepare('SELECT * FROM map_pins ORDER BY created_at DESC').all()
}

export function getPinById(id: string) {
  return getDB().prepare('SELECT * FROM map_pins WHERE id = ?').get(id)
}

export function createPin(data: {
  label: string; type: string; lat: number; lng: number; description?: string; user_id?: string
}) {
  const db = getDB()
  const id = crypto.randomUUID()
  const now = Date.now()
  db.prepare(
    'INSERT INTO map_pins (id, label, type, lat, lng, description, user_id, synced, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)'
  ).run(id, data.label, data.type, data.lat, data.lng, data.description || null, data.user_id || null, now)
  return getPinById(id)!
}

export function deletePin(id: string) {
  getDB().prepare('DELETE FROM map_pins WHERE id = ?').run(id)
}

export function getUnsyncedPins() {
  return getDB().prepare("SELECT * FROM map_pins WHERE synced = 0").all()
}

export function markPinsSynced(ids: string[]) {
  if (!ids.length) return
  const db = getDB()
  db.prepare(`UPDATE map_pins SET synced = 1 WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids)
}

export function upsertPinBatch(pins: any[]) {
  const db = getDB()
  const insert = db.prepare(
    'INSERT OR IGNORE INTO map_pins (id, label, type, lat, lng, description, user_id, synced, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)'
  )
  const insertMany = db.transaction((items: any[]) => {
    for (const p of items) insert.run(p.id, p.label, p.type, p.lat, p.lng, p.description, p.user_id, p.created_at)
  })
  insertMany(pins)
}
