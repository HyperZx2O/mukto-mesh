const API_URL = import.meta.env.VITE_API_URL || ''
import { useAuthStore } from '@/store/useAuthStore'
import type { ApiResponse } from '@/types'

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {}
    const token = useAuthStore.getState().adminToken
    if (token) headers['Authorization'] = `Bearer ${token}`
    if (!(options?.body instanceof FormData)) headers['Content-Type'] = 'application/json'

    const res = await fetch(`${API_URL}${path}`, { headers, ...options })
    if (res.status === 401) {
      useAuthStore.getState().logout()
    }
    return await res.json()
  } catch {
    return { data: null, error: 'Network error — you may be offline' }
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: object | FormData) =>
    request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: <T>(path: string, body: object) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    request<T>(path, { method: 'DELETE' }),
}
