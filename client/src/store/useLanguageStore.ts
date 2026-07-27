import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '@/types'

interface LanguageState {
  lang: Language
  setLang: (lang: Language) => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'mukto-mesh-lang' }
  )
)
