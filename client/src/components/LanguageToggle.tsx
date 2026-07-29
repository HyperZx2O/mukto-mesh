import { useLanguageStore } from '@/store/useLanguageStore'
import { playCue } from '@/lib/uiSFX'

export default function LanguageToggle() {
  const lang = useLanguageStore((s) => s.lang)
  const setLang = useLanguageStore((s) => s.setLang)

  const handleSetLang = (l: 'en' | 'bn') => {
    playCue(l === 'bn' ? 'toggle-on' : 'toggle-off')
    setLang(l)
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handleSetLang('en')}
        className={`px-3 py-1 text-caption font-bold uppercase tracking-wider ${
          lang === 'en' ? 'bg-primary text-white' : 'btn-ghost'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => handleSetLang('bn')}
        className={`px-3 py-1 text-caption font-bold uppercase tracking-wider ${
          lang === 'bn' ? 'bg-primary text-white' : 'btn-ghost'
        }`}
      >
        বাং
      </button>
    </div>
  )
}
