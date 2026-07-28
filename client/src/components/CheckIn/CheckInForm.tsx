import { useState } from 'react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { CHECKIN_INTERVALS } from '@/lib/constants'
import { PHONE_REGEX } from '@/lib/utils'

interface Props {
  onRegistered: (id: string) => void
}

export default function CheckInForm({ onRegistered }: Props) {
  const lang = useLanguageStore((s) => s.lang)
  const displayName = useAuthStore((s) => s.displayName)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const [name, setName] = useState(displayName)
  const [phone, setPhone] = useState('')
  const [interval, setInterval] = useState<2 | 4 | 6 | 12>(2)
  const [nameError, setNameError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const mutation = useMutation({
    mutationFn: () => api.post<{ id: string }>('/checkin/register', {
      displayName: name, contactPhone: phone, intervalHours: interval,
    }),
    onSuccess: (res) => {
      if (res.data?.id) onRegistered(res.data.id)
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    let valid = true
    if (!name.trim()) { setNameError(t('Name is required', 'নাম প্রয়োজনীয়')); valid = false }
    if (!phone.trim() || !PHONE_REGEX.test(phone.trim())) {
      setPhoneError(t('Invalid phone number', 'অবৈধ ফোন নম্বর')); valid = false
    }
    if (!valid) return
    setNameError(''); setPhoneError('')
    mutation.mutate()
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-md">
      <div className="space-y-1">
        <label className="text-sm font-bold text-text-primary uppercase tracking-wider">
          {t('Display Name', 'প্রদর্শনের নাম')}
        </label>
        <input value={name} onChange={(e) => { setName(e.target.value); setNameError('') }} className="w-full bg-surface border border-border text-text-primary p-3 text-sm outline-none focus:border-primary" />
        {nameError && <p className="text-xs text-danger">{nameError}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-text-primary uppercase tracking-wider">
          {t('Contact Phone', 'যোগাযোগের ফোন')} <span className="text-danger">*</span>
        </label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+8801XXXXXXXXX" className="w-full bg-surface border border-border text-text-primary p-3 text-sm outline-none focus:border-primary" />
        {phoneError && <p className="text-xs text-danger">{phoneError}</p>}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-text-primary uppercase tracking-wider">
          {t('Check-in Interval', 'চেক-ইন ব্যবধান')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {CHECKIN_INTERVALS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setInterval(h)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider border min-h-[44px] ${
                interval === h
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-text-muted border-border'
              }`}
            >
              {h}{t('h', 'ঘ')}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-primary text-white font-bold uppercase tracking-wider py-3 disabled:opacity-50 min-h-[44px]"
      >
        {mutation.isPending ? t('Registering...', 'নিবন্ধন করা হচ্ছে...') : t('Register', 'নিবন্ধন')}
      </button>

      {mutation.isError && (
        <p className="text-sm text-danger">
          {t('Registration failed. Try again.', 'নিবন্ধন ব্যর্থ। আবার চেষ্টা করুন।')}
        </p>
      )}
    </form>
  )
}
