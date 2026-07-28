import { config } from '../config.js'
import { log } from '../logger.js'

let twilioClient: any
let twilioConfigured: boolean | null = null

async function initTwilio() {
  if (twilioConfigured !== null) return
  twilioConfigured = false
  if (!config.TWILIO_ACCOUNT_SID || !config.TWILIO_AUTH_TOKEN || !config.TWILIO_PHONE_NUMBER) {
    log.warn('Twilio not configured — SMS alerts will be mocked')
    return
  }
  try {
    const twilioMod = await import('twilio')
    twilioClient = twilioMod.default(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN)
    twilioConfigured = true
  } catch (e) {
    log.warn(`Failed to init Twilio client — SMS will be mocked: ${e}`)
  }
}

export async function sendSms(to: string, body: string): Promise<void> {
  await initTwilio()
  if (!twilioClient) {
    log.info(`[MOCK SMS] to: ${to} | body: ${body}`)
    return
  }
  try {
    await twilioClient.messages.create({ from: config.TWILIO_PHONE_NUMBER, to, body })
    log.info(`SMS sent to ${to}`)
  } catch (e) {
    log.error(`SMS to ${to} failed: ${e}`)
  }
}
