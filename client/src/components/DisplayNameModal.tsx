import { useState, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useLanguageStore } from '@/store/useLanguageStore'

export default function DisplayNameModal() {
  const displayName = useAuthStore((s) => s.displayName)
  if (displayName) return null
  return <DisplayNameForm />
}

function DisplayNameForm() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const setDisplayName = useAuthStore((s) => s.setDisplayName)
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)
  const formRef = useRef<HTMLFormElement>(null)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError(t('Name is required', 'নাম প্রয়োজনীয়')); return }
    setError('')
    setDisplayName(trimmed, crypto.randomUUID())
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !formRef.current) return
    const focusable = formRef.current.querySelectorAll<HTMLElement>('input, button')
    if (focusable.length < 2) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      role="dialog"
      aria-modal="true"
      aria-labelledby="display-name-title"
      onKeyDown={handleKeyDown}
    >
      <form
        ref={formRef}
        onSubmit={submit}
        className="bg-surface p-6 w-full max-w-sm mx-4 border border-border"
      >
        <h2 id="display-name-title" className="text-lg font-bold text-text-primary mb-4">
          {t('Enter your display name', 'আপনার নাম লিখুন')}
        </h2>
        <input
          autoFocus
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          className="w-full bg-background text-text-primary border border-border p-3 mb-1 outline-none focus:border-primary"
          placeholder={t('Your name', 'আপনার নাম')}
        />
        {error && <p className="text-xs text-danger mb-3">{error}</p>}
        <button
          type="submit"
          className="w-full bg-primary text-white font-bold uppercase tracking-wider py-3 min-h-[44px]"
        >
          {t('Save', 'সংরক্ষণ')}
        </button>
      </form>
    </div>
  )
}
