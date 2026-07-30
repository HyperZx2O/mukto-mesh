import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

interface AuthState {
  displayName: string
  userId: string
  isAdmin: boolean
  adminToken: string | null
  setDisplayName: (name: string, id: string) => void
  setAdmin: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      displayName: '',
      userId: '',
      isAdmin: false,
      adminToken: null,
      setDisplayName: (name, id) => set({ displayName: name, userId: id }),
      setAdmin: (token) => set({ isAdmin: true, adminToken: token }),
      logout: () => set({ isAdmin: false, adminToken: null }),
    }),
    {
      name: 'mukto-mesh-auth',
      onRehydrateStorage: () => (state) => {
        if (state?.adminToken && isTokenExpired(state.adminToken)) {
          state.logout()
        }
      },
    }
  )
)
