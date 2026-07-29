import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface SoundState {
  enabled: boolean
  toggle: () => void
  setEnabled: (v: boolean) => void
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      enabled: true,
      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setEnabled: (v) => set({ enabled: v }),
    }),
    { name: 'mukto-mesh-sound' }
  )
)
