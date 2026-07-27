import { useEffect, useRef, useCallback } from 'react'
import { WS_URL } from '@/lib/config'
const MAX_RETRIES = 5

export function useWebSocket(onMessage: (data: any) => void) {
  const ws = useRef<WebSocket | null>(null)
  const retries = useRef(0)

  const connect = useCallback(() => {
    ws.current = new WebSocket(WS_URL)

    ws.current.onmessage = (e) => {
      try {
        onMessage(JSON.parse(e.data))
      } catch { /* malformed JSON — skip */ }
    }

    ws.current.onclose = () => {
      if (retries.current < MAX_RETRIES) {
        const delay = Math.pow(2, retries.current) * 1000
        retries.current++
        setTimeout(connect, delay)
      }
    }

    ws.current.onopen = () => {
      retries.current = 0
    }
  }, [onMessage])

  useEffect(() => {
    connect()
    return () => ws.current?.close()
  }, [connect])

  const send = useCallback((data: object) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data))
    }
  }, [])

  return { send }
}
