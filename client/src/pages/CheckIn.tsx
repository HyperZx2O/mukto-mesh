import { useState, useEffect } from 'react'
import { useLanguageStore } from '@/store/useLanguageStore'
import CheckInForm from '@/components/CheckIn/CheckInForm'
import CheckInStatus from '@/components/CheckIn/CheckInStatus'

const STORAGE_KEY = 'mukto-mesh-checkin-id'

export default function CheckIn() {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)
  const [checkinId, setCheckinId] = useState<string | null>(null)

  useEffect(() => {
    setCheckinId(localStorage.getItem(STORAGE_KEY))
  }, [])

  const handleRegistered = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id)
    setCheckinId(id)
  }

  const handleCancel = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCheckinId(null)
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-muted">
        {t(
          'Register for periodic check-ins so your safety can be monitored.',
          'পর্যায়ক্রমিক চেক-ইনের জন্য নিবন্ধন করুন যাতে আপনার নিরাপত্তা পর্যবেক্ষণ করা যায়।',
        )}
      </p>

      {checkinId ? (
        <div className="space-y-4">
          <CheckInStatus checkinId={checkinId} />
          <button
            onClick={handleCancel}
            className="text-sm text-text-muted underline hover:text-text-primary"
          >
            {t('Cancel & re-register', 'বাতিল ও পুনরায় নিবন্ধন')}
          </button>
        </div>
      ) : (
        <CheckInForm onRegistered={handleRegistered} />
      )}
    </div>
  )
}
