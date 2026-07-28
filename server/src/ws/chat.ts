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
      let msg: any
      try { msg = JSON.parse(String(evt.data)) } catch { return }

      const client = findClient(ws)
      if (!client) return

      switch (msg.type) {
        case WsEvent.JOIN: {
          client.displayName = msg.displayName || 'Anonymous'
          client.channel = (CHANNELS.includes(msg.channel) ? msg.channel : 'general') as Channel

          const messages = getLastMessages(client.channel, 50)
          send(ws, { type: 'join_ack', channel: client.channel, messages })
          break
        }

        case WsEvent.MESSAGE: {
          if (!msg.content || !CHANNELS.includes(msg.channel)) return

          const { id, createdAt } = createMessage({
            user_id: client.id, display_name: client.displayName,
            channel: msg.channel, content: msg.content,
          })

          broadcastToChannel(msg.channel as Channel, {
            type: WsEvent.WS_MESSAGE, id, displayName: client.displayName,
            channel: msg.channel, content: msg.content, createdAt,
          })
          break
        }

        case WsEvent.SWITCH_CHANNEL: {
          if (!CHANNELS.includes(msg.channel)) return
          client.channel = msg.channel as Channel

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
