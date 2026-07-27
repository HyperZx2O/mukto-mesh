import { useState, useEffect } from 'react'
import { useLanguageStore } from '@/store/useLanguageStore'

const STORAGE_KEY = 'mukto-mesh-install-dismissed'

export default function InstallPrompt() {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)
  const [deferred, setDeferred] = useState<Event | null>(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(STORAGE_KEY) === '1')

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!deferred || dismissed) return null

  const install = () => {
    const ev = deferred as unknown as { prompt: () => Promise<void> }
    ev.prompt().catch(() => {})
    setDeferred(null)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  const dismiss = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, '1')
  }

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-surface border border-border p-3 shadow-xl flex items-center justify-between gap-3">
        <p className="text-sm text-text-primary font-bold uppercase tracking-wider">
          {t('Install Mukto Mesh', 'মুক্ত মেশ ইনস্টল করুন')}
        </p>
        <div className="flex gap-2 shrink-0">
          <button onClick={install} className="px-4 py-2 bg-primary text-white text-xs font-bold uppercase tracking-wider min-h-[44px]">
            {t('Install', 'ইনস্টল')}
          </button>
          <button onClick={dismiss} className="px-4 py-2 bg-surface text-text-muted text-xs font-bold uppercase tracking-wider border border-border min-h-[44px]">
            {t('Dismiss', 'বাতিল')}
          </button>
        </div>
      </div>
    </div>
  )
}
