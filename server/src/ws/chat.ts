// WebSocket chat handler
// Wire into index.ts once Hono WS adapter is set up
// Reference: https://hono.dev/docs/helpers/websocket

// Channels
export const CHANNELS = ['general', 'emergency', 'coordination', 'medical'] as const
export type Channel = typeof CHANNELS[number]

// Connected clients map: ws -> { displayName, channel }
export const clients = new Map<any, { displayName: string; channel: Channel }>()

export function broadcast(channel: Channel, event: object) {
  const payload = JSON.stringify(event)
  clients.forEach((meta, ws) => {
    if (meta.channel === channel) {
      try { ws.send(payload) } catch {}
    }
  })
}

export function broadcastAll(event: object) {
  const payload = JSON.stringify(event)
  clients.forEach((_, ws) => {
    try { ws.send(payload) } catch {}
  })
}
