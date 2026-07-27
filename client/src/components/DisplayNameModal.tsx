import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useLanguageStore } from '@/store/useLanguageStore'

export default function DisplayNameModal() {
  const displayName = useAuthStore((s) => s.displayName)
  if (displayName) return null

  return <DisplayNameForm />
}

function DisplayNameForm() {
  const [name, setName] = useState('')
  const setDisplayName = useAuthStore((s) => s.setDisplayName)
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setDisplayName(trimmed, crypto.randomUUID())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form
        onSubmit={submit}
        className="bg-surface p-6 w-full max-w-sm mx-4 border border-border"
      >
        <h2 className="text-lg font-bold text-text-primary mb-4">
          {t('Enter your display name', 'আপনার নাম লিখুন')}
        </h2>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background text-text-primary border border-border p-3 mb-4 outline-none focus:border-primary"
          placeholder={t('Your name', 'আপনার নাম')}
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full bg-primary text-white font-bold uppercase tracking-wider py-3 disabled:opacity-50"
        >
          {t('Save', 'সংরক্ষণ')}
        </button>
      </form>
    </div>
  )
}
