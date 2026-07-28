import { useLanguageStore } from '@/store/useLanguageStore'

export default function LanguageToggle() {
  const lang = useLanguageStore((s) => s.lang)
  const setLang = useLanguageStore((s) => s.setLang)

  return (
    <div className="flex gap-1">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 text-caption font-bold uppercase tracking-wider ${
          lang === 'en' ? 'bg-primary text-white' : 'btn-ghost'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('bn')}
        className={`px-3 py-1 text-caption font-bold uppercase tracking-wider ${
          lang === 'bn' ? 'bg-primary text-white' : 'btn-ghost'
        }`}
      >
        বাং
      </button>
    </div>
  )
}
