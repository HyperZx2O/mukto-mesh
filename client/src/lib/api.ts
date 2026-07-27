import { API_URL } from './config'
import { useAuthStore } from '@/store/useAuthStore'
import type { ApiResponse } from '@/types'

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    const token = useAuthStore.getState().adminToken
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${API_URL}${path}`, { headers, ...options })
    return await res.json()
  } catch {
    return { data: null, error: 'Network error — you may be offline' }
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: object) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: object) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
