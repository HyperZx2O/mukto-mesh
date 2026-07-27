import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { mdToHtml } from '@/lib/md'
import { cn } from '@/lib/utils'

import rightsEn from '@/content/rights.en.md?raw'
import rightsBn from '@/content/rights.bn.md?raw'
import firstaidEn from '@/content/firstaid.en.md?raw'
import firstaidBn from '@/content/firstaid.bn.md?raw'
import contactsEn from '@/content/contacts.en.md?raw'
import contactsBn from '@/content/contacts.bn.md?raw'
import checklistEn from '@/content/checklist.en.md?raw'
import checklistBn from '@/content/checklist.bn.md?raw'
import july2024En from '@/content/july2024.en.md?raw'
import july2024Bn from '@/content/july2024.bn.md?raw'

const content: Record<string, { en: string; bn: string }> = {
  rights: { en: rightsEn, bn: rightsBn },
  firstaid: { en: firstaidEn, bn: firstaidBn },
  contacts: { en: contactsEn, bn: contactsBn },
  checklist: { en: checklistEn, bn: checklistBn },
  july2024: { en: july2024En, bn: july2024Bn },
}

const sections = [
  { key: 'rights', titleEn: 'Your Rights', titleBn: 'আপনার অধিকার' },
  { key: 'firstaid', titleEn: 'First Aid', titleBn: 'প্রাথমিক চিকিৎসা' },
  { key: 'contacts', titleEn: 'Emergency Contacts', titleBn: 'জরুরি যোগাযোগ' },
  { key: 'checklist', titleEn: 'Crisis Checklist', titleBn: 'সংকট মোকাবিলার তালিকা' },
  { key: 'july2024', titleEn: 'July 2024 — What We Learned', titleBn: 'জুলাই ২০২৪ — আমরা যা শিখেছি' },
] as const

export default function KnowledgeBase() {
  const lang = useLanguageStore((s) => s.lang)
  const [active, setActive] = useState<string>('rights')
  const [query, setQuery] = useState('')

  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const filtered = useMemo(() => {
    if (!query.trim()) return sections
    const q = query.toLowerCase()
    return sections.filter((s) => {
      const title = lang === 'bn' ? s.titleBn : s.titleEn
      const raw = content[s.key][lang]
      return title.toLowerCase().includes(q) || raw.toLowerCase().includes(q)
    })
  }, [query, lang])

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-text-primary uppercase tracking-wider">
        {t('Knowledge Base', 'জ্ঞানভাণ্ডার')}
      </h1>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface border border-border text-text-primary pl-10 pr-4 py-3 text-sm outline-none focus:border-primary"
          placeholder={t('Search sections...', 'সেকশন অনুসন্ধান...')}
        />
      </div>

      {/* Section tabs */}
      <div className="flex flex-wrap gap-2">
        {filtered.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={cn(
              'px-4 py-2 text-sm font-bold uppercase tracking-wider border min-h-[44px]',
              active === s.key
                ? 'bg-primary text-white border-primary'
                : 'bg-surface text-text-muted border-border hover:text-text-primary'
            )}
          >
            {lang === 'bn' ? s.titleBn : s.titleEn}
          </button>
        ))}
      </div>

      {/* [STUB] loading state — not triggerable for bundled content */}
      <div className="hidden" />

      {/* Active section content */}
      {filtered.length === 0 ? (
        <p className="text-text-muted py-8 text-center">
          {t('No matching sections found.', 'কোনো মিল পাওয়া যায়নি।')}
        </p>
      ) : active && content[active] ? (
        // ponytail: trusted build-time content, safe for innerHTML
        <div
          className="max-w-none"
          dangerouslySetInnerHTML={{ __html: mdToHtml(content[active][lang]) }}
        />
      ) : null}

      {/* [STUB] error state — not triggerable for bundled content */}
      <div className="hidden" />
    </div>
  )
}
