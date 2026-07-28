import { useState } from 'react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useAuthStore } from '@/store/useAuthStore'
import { api } from '@/lib/api'

export default function AdminLogin() {
  const lang = useLanguageStore((s) => s.lang)
  const setAdmin = useAuthStore((s) => s.setAdmin)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    setPending(true)
    setError('')
    const res = await api.post<{ token: string }>('/admin/login', { password })
    if (res.data?.token) {
      setAdmin(res.data.token)
    } else {
      setError(t('Incorrect password', 'ভুল পাসওয়ার্ড'))
    }
    setPending(false)
  }

  return (
    <div className="max-w-sm mx-auto mt-12 space-y-6">
      <h1 className="text-2xl font-bold text-text-primary uppercase tracking-wider text-center">
        {t('Admin Login', 'অ্যাডমিন লগইন')}
      </h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-text-primary uppercase tracking-wider">
            {t('Password', 'পাসওয়ার্ড')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface border border-border text-text-primary p-3 text-sm outline-none focus:border-primary"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-primary text-white font-bold uppercase tracking-wider py-3 disabled:opacity-50 min-h-[44px]"
        >
          {pending ? t('Logging in...', 'লগইন হচ্ছে...') : t('Login', 'লগইন')}
        </button>

        {error && <p className="text-sm text-danger text-center">{error}</p>}
      </form>
    </div>
  )
}
