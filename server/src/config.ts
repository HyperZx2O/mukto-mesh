import 'dotenv/config'

const missing: string[] = []

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
if (!ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD')

if (missing.length) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`)
}

if (ADMIN_PASSWORD === 'changeme') {
  console.warn('[CONFIG] WARN: ADMIN_PASSWORD is set to "changeme" — change it before production')
}

export const config = Object.freeze({
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  ADMIN_PASSWORD,
  DB_PATH: process.env.DB_PATH || './mukto_mesh.db',
  REMOTE_SYNC_URL: process.env.REMOTE_SYNC_URL || '',
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID || '',
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || '',
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER || '',
})
