function requireVar(key: string, fallback: string): string {
  const val = import.meta.env[key] || fallback
  if (!val) {
    console.error(`Missing required env var: ${key}`)
    throw new Error(`Missing required env var: ${key}`)
  }
  return val
}

export const API_URL = requireVar('VITE_API_URL', 'http://localhost:3000')
export const WS_URL = requireVar('VITE_WS_URL', 'ws://localhost:3000/ws')
