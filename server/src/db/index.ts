import Database from 'better-sqlite3'
import crypto from 'crypto'
import path from 'path'
import { config } from '../config.js'
import { SCHEMA_SQL } from './schema.js'

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
  const count = db.prepare('SELECT COUNT(*) as n FROM posts').get() as { n: number }
  if (count.n <= 1) {
    if (count.n === 1) {
      db.prepare('DELETE FROM posts').run()
    }
    const insertPost = db.prepare(
      'INSERT INTO posts (id, user_id, display_name, tag, content, pinned, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    const now = Date.now()
    const day = 86400000
    const posts: [string, string, string, 0 | 1, number][] = [
      ['Mukto Mesh Admin', 'safety', '🚨 Mukto Mesh Network is live! All nodes are operational. Stay connected and report any issues in your area. Use the Check-In feature to mark yourself safe, and the Map to share shelter locations. Together we stay connected.', 1, now - day * 5],
      ['Dr. Rahman', 'medical', 'Free medical camp at Union Parishad complex tomorrow, 9 AM – 4 PM. General checkups, first aid, and emergency care available. Bring any medical records if possible.', 0, now - day * 4],
      ['Food Committee', 'food', 'Dry food and drinking water distribution at the local school at 3 PM today. Priority for families with children under 5 and elderly members. Bring your own bags if possible.', 0, now - day * 3],
      ['Weather Watch', 'safety', 'Heavy rainfall and gusty winds expected tonight through tomorrow morning. Secure loose outdoor items, charge your devices, and stay indoors after sunset.', 0, now - day * 2],
      ['Local Reporter', 'news', 'Main road to the town centre is partially flooded near the bridge. Use the alternate route via the eastern embankment. Boats are available at the market stand.', 0, now - day * 1],
      ['Fatima Begum', 'general', 'Thank you to everyone who joined the community cleanup drive yesterday! Special thanks to the youth volunteers. Let us keep this spirit alive. Next gathering: Saturday at the community hall.', 0, now - day * 0.5],
    ]
    for (const [name, tag, content, pinned, ts] of posts) {
      insertPost.run(crypto.randomUUID(), 'seed', name, tag, content, pinned, ts)
    }
    console.log('[DB] Seeded 6 mock posts')
  }
  const mpCount = db.prepare('SELECT COUNT(*) as n FROM missing_persons').get() as { n: number }
  if (mpCount.n === 0) {
    const insert = db.prepare(
      'INSERT INTO missing_persons (id, name, age, gender, last_location, description, contact_name, contact_phone, photo_url, status, synced, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    const now = Date.now()
    const people: [string, number, string, string, string, string, string][] = [
      ['Ayesha Khatun', 32, 'female', 'Mirpur, Dhaka', 'Last seen at Mirpur-10 bus stop wearing a green hijab and black abaya.', 'Farid Hossain', '+8801712345601'],
      ['Md. Kabir Hossain', 45, 'male', 'Sylhet City Center', 'Left for work at 8am and did not return. Wearing a blue lungi and white panjabi.', 'Jahanara Begum', '+8801712345602'],
      ['Fatima Noor', 8, 'female', 'Bashundhara R/A, Dhaka', 'Went out to play near the park at 4pm and did not return. Pink dress, black sandals.', 'Rafiqul Islam', '+8801712345603'],
      ['Abdur Rahman', 60, 'male', 'Chittagong Port Area', 'Last seen near New Market. Wearing a grey kurta and carrying a brown bag.', 'Sakina Begum', '+8801712345604'],
      ['Taslima Akhter', 27, 'female', 'Rajshahi University Campus', 'Disappeared after leaving the library around 9pm. Blue salwar kameez, glasses.', 'Mizanur Rahman', '+8801712345605'],
    ]
    for (const [name, age, gender, location, desc, contact, phone] of people) {
      insert.run(crypto.randomUUID(), name, age, gender, location, desc, contact, phone, null, 'missing', 1, now - Math.floor(Math.random() * 86400000 * 3))
    }
    console.log('[DB] Seeded 5 missing persons')
  }
  console.log('[DB] Initialised successfully')
}

