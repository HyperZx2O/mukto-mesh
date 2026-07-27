import { create } from 'zustand'
import { WS_URL } from './config'
import { useAuthStore } from '@/store/useAuthStore'
import { useChatStore } from '@/store/useChatStore'
import type { QueryClient } from '@tanstack/react-query'

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface WsState {
  connectionStatus: ConnectionStatus
  broadcast: string | null
  dismissBroadcast: () => void
}

export const useWs = create<WsState>((set) => ({
  connectionStatus: 'disconnected',
  broadcast: null,
  dismissBroadcast: () => set({ broadcast: null }),
}))

let ws: WebSocket | null = null
let retries = 0
let timer: number | null = null
let qc: QueryClient | null = null

export function setQueryClient(queryClient: QueryClient) {
  qc = queryClient
}

function connect() {
  useWs.setState({ connectionStatus: 'connecting' })
  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    useWs.setState({ connectionStatus: 'connected' })
    retries = 0
    const { displayName } = useAuthStore.getState()
    ws?.send(JSON.stringify({ type: 'join', payload: { displayName } }))
  }

  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data)
      switch (msg.type) {
        case 'message':
          useChatStore.getState().addMessage(msg.payload)
          break
        case 'post_created':
        case 'post_pinned':
          qc?.invalidateQueries({ queryKey: ['posts'] })
          break
        case 'broadcast':
          useWs.setState({ broadcast: msg.payload?.message || msg.payload?.content || '' })
          break
      }
    } catch { /* skip malformed */ }
  }

  ws.onclose = () => {
    useWs.setState({ connectionStatus: 'disconnected' })
    if (retries < 5) {
      const delay = Math.pow(2, retries) * 1000
      retries++
      timer = window.setTimeout(connect, delay)
    } else {
      useWs.setState({ connectionStatus: 'error' })
    }
  }

  ws.onerror = () => {
    useWs.setState({ connectionStatus: 'error' })
  }
}

export function initWs() {
  connect()
}

export function closeWs() {
  ws?.close()
  if (timer !== null) clearTimeout(timer)
}

export function sendMessage(channel: string, content: string) {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'message', payload: { channel, content } }))
  }
}
