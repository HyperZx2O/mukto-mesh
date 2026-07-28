import crypto from 'crypto'
import { getDB } from './index.js'

export function getAllMissing() {
  const db = getDB()
  return db.prepare('SELECT * FROM missing_persons ORDER BY created_at DESC').all()
}

export function searchMissing(q: string) {
  const db = getDB()
  return db.prepare(
    'SELECT * FROM missing_persons WHERE name LIKE ? OR last_location LIKE ? ORDER BY created_at DESC'
  ).all(`%${q}%`, `%${q}%`)
}

export function createMissing(data: {
  name: string; age?: number; gender?: string; last_location: string
  description?: string; contact_name: string; contact_phone: string; photo_url?: string
}) {
  const db = getDB()
  const id = crypto.randomUUID()
  const now = Date.now()
  db.prepare(
    'INSERT INTO missing_persons (id, name, age, gender, last_location, description, contact_name, contact_phone, photo_url, status, synced, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, \'missing\', 0, ?)'
  ).run(id, data.name, data.age || null, data.gender || null, data.last_location, data.description || null, data.contact_name, data.contact_phone, data.photo_url || null, now)
  return getMissingById(id)!
}

export function getMissingById(id: string) {
  return getDB().prepare('SELECT * FROM missing_persons WHERE id = ?').get(id)
}

export function updateMissingStatus(id: string, status: string) {
  getDB().prepare('UPDATE missing_persons SET status = ? WHERE id = ?').run(status, id)
}

export function getUnsyncedMissing() {
  return getDB().prepare("SELECT * FROM missing_persons WHERE synced = 0").all()
}

export function markMissingSynced(ids: string[]) {
  if (!ids.length) return
  const db = getDB()
  db.prepare(`UPDATE missing_persons SET synced = 1 WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids)
}

export function upsertMissingBatch(entries: Record<string, unknown>[]) {
  const db = getDB()
  const insert = db.prepare(
    'INSERT OR IGNORE INTO missing_persons (id, name, age, gender, last_location, description, contact_name, contact_phone, photo_url, status, synced, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)'
  )
  const insertMany = db.transaction((items: Record<string, unknown>[]) => {
    for (const e of items) insert.run(e.id, e.name, e.age, e.gender, e.last_location, e.description, e.contact_name, e.contact_phone, e.photo_url, e.status, e.created_at)
  })
  insertMany(entries)
}
