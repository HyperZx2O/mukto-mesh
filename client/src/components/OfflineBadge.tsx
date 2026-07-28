import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { useLanguageStore } from '@/store/useLanguageStore'

export default function OfflineBadge() {
  const isOffline = useOfflineStatus()
  const lang = useLanguageStore((s) => s.lang)

  if (!isOffline) return null

  return (
    <div className="bg-primary text-white text-center text-caption py-2 px-4 font-bold uppercase tracking-wider">
      {lang === 'bn' ? 'অফলাইন মোড — সব ফিচার কাজ করে' : 'Offline mode — all features still work'}
    </div>
  )
}
