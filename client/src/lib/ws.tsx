import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react'
import { WS_URL } from './config'
import { useAuthStore } from '@/store/useAuthStore'
import { useChatStore } from '@/store/useChatStore'
import { useQueryClient } from '@tanstack/react-query'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface WsContextValue {
  connectionStatus: ConnectionStatus
  sendMessage: (channel: string, content: string) => void
  broadcast: string | null
  dismissBroadcast: () => void
}

const WsContext = createContext<WsContextValue>({
  connectionStatus: 'disconnected',
  sendMessage: () => {},
  broadcast: null,
  dismissBroadcast: () => {},
})

export function WsProvider({ children }: { children: ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [broadcast, setBroadcast] = useState<string | null>(null)
  const ws = useRef<WebSocket | null>(null)
  const retries = useRef(0)
  const timerRef = useRef<number | null>(null)
  const queryClient = useQueryClient()

  const connect = useCallback(() => {
    setConnectionStatus('connecting')
    ws.current = new WebSocket(WS_URL)

    ws.current.onopen = () => {
      setConnectionStatus('connected')
      retries.current = 0
      const { displayName } = useAuthStore.getState()
      ws.current?.send(JSON.stringify({ type: 'join', payload: { displayName } }))
    }

    ws.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        switch (msg.type) {
          case 'message':
            useChatStore.getState().addMessage(msg.payload)
            break
          case 'post_created':
          case 'post_pinned':
            queryClient.invalidateQueries({ queryKey: ['posts'] })
            break
          case 'checkin_flagged':
            break
          case 'broadcast':
            setBroadcast(msg.payload?.message || msg.payload?.content || '')
            break
        }
      } catch { /* skip malformed */ }
    }

    ws.current.onclose = () => {
      setConnectionStatus('disconnected')
      if (retries.current < 5) {
        const delay = Math.pow(2, retries.current) * 1000
        retries.current++
        timerRef.current = window.setTimeout(connect, delay)
      } else {
        setConnectionStatus('error')
      }
    }

    ws.current.onerror = () => {
      setConnectionStatus('error')
    }
  }, [queryClient])

  useEffect(() => {
    connect()
    return () => {
      ws.current?.close()
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [connect])

  const sendMessage = useCallback((channel: string, content: string) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: 'message', payload: { channel, content } }))
    }
  }, [])

  const dismissBroadcast = useCallback(() => setBroadcast(null), [])

  return (
    <WsContext.Provider value={{ connectionStatus, sendMessage, broadcast, dismissBroadcast }}>
      {children}
      {broadcast && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="bg-surface border-2 border-danger p-8 max-w-lg mx-4 text-center">
            <h2 className="text-xl font-bold uppercase tracking-wider text-danger mb-4">
              Emergency Broadcast
            </h2>
            <p className="text-text-primary mb-6">{broadcast}</p>
            <button
              onClick={dismissBroadcast}
              className="px-6 py-3 border border-text-primary text-text-primary font-bold uppercase tracking-wider hover:bg-surface min-h-[44px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </WsContext.Provider>
  )
}

export const useWs = () => useContext(WsContext)
