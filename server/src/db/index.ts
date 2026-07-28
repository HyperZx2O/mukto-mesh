import Database from 'better-sqlite3'
import path from 'path'
import { config } from '../config.js'
import { SCHEMA_SQL } from './schema.js'
import { seedDB } from './seed.js'

let db: Database.Database

export function getDB(): Database.Database {
  if (!db) {
    db = new Database(path.resolve(config.DB_PATH))
    db.pragma('journal_mode = WAL')
    db.pragma('foreign_keys = ON')
  }
  return db
}

export function initDB(): void {
  const db = getDB()
  db.exec(SCHEMA_SQL)
  seedDB(db)
  console.log('[DB] Initialised successfully')
}
