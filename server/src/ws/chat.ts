import crypto from 'crypto'
import { createMessage, getLastMessages } from '../db/messages.js'
import { WsEvent } from '../types.js'

export const CHANNELS = ['general', 'emergency', 'coordination', 'medical'] as const
export type Channel = (typeof CHANNELS)[number]

interface WsClient {
  id: string
  ws: { send(data: string): void; close(): void }
  displayName: string
  channel: Channel
  connectedAt: number
}

const clients = new Map<string, WsClient>()

function send(ws: WsClient['ws'], event: object) {
  try { ws.send(JSON.stringify(event)) } catch { removeClient(ws) }
}

function removeClient(ws: WsClient['ws']) {
  for (const [id, c] of clients) {
    if (c.ws === ws) { clients.delete(id); break }
  }
}

export function getConnectionCount(): number {
  return clients.size
}

export function broadcastToChannel(channel: Channel, event: object) {
  for (const c of clients.values()) {
    if (c.channel === channel) send(c.ws, event)
  }
}

export function broadcastToAll(event: object) {
  for (const c of clients.values()) send(c.ws, event)
}

export function createWSHandler() {
  return {
    onOpen(_evt: unknown, ws: WsClient['ws']) {
      const id = crypto.randomUUID()
      clients.set(id, { id, ws, displayName: '', channel: 'general', connectedAt: Date.now() })
      console.log(`[WS] Client connected (${clients.size} total)`)
    },

    onMessage(evt: { data: string | Buffer }, ws: WsClient['ws']) {
      let parsed: Record<string, unknown>
      try { parsed = JSON.parse(String(evt.data)) as Record<string, unknown> } catch { return }

      const client = findClient(ws)
      if (!client) return

      const msgType = String(parsed.type || '')

      switch (msgType) {
        case WsEvent.JOIN: {
          client.displayName = String(parsed.displayName || 'Anonymous')
          const ch = String(parsed.channel || 'general')
          client.channel = (CHANNELS.includes(ch as Channel) ? ch : 'general') as Channel

          const messages = getLastMessages(client.channel, 50)
          send(ws, { type: 'join_ack', channel: client.channel, messages })
          break
        }

        case WsEvent.MESSAGE: {
          const channel = String(parsed.channel || '')
          const content = String(parsed.content || '')
          if (!content || !CHANNELS.includes(channel as Channel)) return

          const { id, createdAt } = createMessage({
            user_id: client.id, display_name: client.displayName,
            channel, content,
          })

          broadcastToChannel(channel as Channel, {
            type: WsEvent.MESSAGE, id, displayName: client.displayName,
            channel, content, createdAt,
          })
          break
        }

        case WsEvent.SWITCH_CHANNEL: {
          const ch = String(parsed.channel || '')
          if (!CHANNELS.includes(ch as Channel)) return
          client.channel = ch as Channel

          const messages = getLastMessages(client.channel, 50)
          send(ws, { type: 'join_ack', channel: client.channel, messages })
          break
        }
      }
    },

    onClose(_evt: unknown, ws: WsClient['ws']) {
      removeClient(ws)
      console.log(`[WS] Client disconnected (${clients.size} total)`)
    },
  }
}

function findClient(ws: WsClient['ws']): WsClient | undefined {
  for (const c of clients.values()) {
    if (c.ws === ws) return c
  }
}
