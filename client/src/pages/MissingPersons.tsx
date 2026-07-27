import { useState, useRef, useEffect } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { MissingPerson, ApiResponse } from '@/types'
import MissingPersonForm from '@/components/MissingPersons/MissingPersonForm'

export default function MissingPersons() {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)
  const [tab, setTab] = useState<'search' | 'submit'>('search')
  const [search, setSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [debounced, setDebounced] = useState('')

  useEffect(() => {
    debounceRef.current = setTimeout(() => setDebounced(search), 300)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  const { data, isLoading, isError } = useQuery<ApiResponse<MissingPerson[]>>({
    queryKey: ['missing', debounced],
    queryFn: () => api.get<MissingPerson[]>(`/missing${debounced ? `?q=${debounced}` : ''}`),
  })

  const results = data?.data ?? []

  const tabs = [
    { id: 'search' as const, label: t('Search', 'অনুসন্ধান'), Icon: Search },
    { id: 'submit' as const, label: t('Submit Report', 'রিপোর্ট জমা দিন'), Icon: UserPlus },
  ]

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      missing: 'bg-danger/20 text-danger',
      found: 'bg-success/20 text-success',
      unverified: 'bg-warning/20 text-warning',
    }
    const labels: Record<string, string> = {
      missing: t('Missing', 'নিখোঁজ'),
      found: t('Found', 'পাওয়া গেছে'),
      unverified: t('Unverified', 'অযাচাইকৃত'),
    }
    return (
      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 ${colors[status] ?? ''}`}>
        {labels[status] ?? status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 bg-surface border border-border p-1 w-fit">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider min-h-[44px] ${
              tab === id ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'search' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search by name or location...', 'নাম বা অবস্থান দ্বারা অনুসন্ধান...')}
              className="w-full bg-surface border border-border text-text-primary pl-10 pr-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface border border-border p-4 animate-pulse space-y-2">
                  <div className="h-5 bg-border w-48" />
                  <div className="h-4 bg-border w-64" />
                  <div className="h-4 bg-border w-32" />
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="border border-danger/30 bg-danger/10 p-4">
              <p className="text-sm text-danger">
                {t('Could not load reports.', 'রিপোর্ট লোড করা যায়নি।')}
              </p>
            </div>
          )}

          {!isLoading && !isError && results.length === 0 && (
            <div className="bg-surface border border-border p-6 text-center">
              <p className="text-sm text-text-muted">
                {debounced
                  ? t('No results found.', 'কোনো ফলাফল পাওয়া যায়নি।')
                  : t('No missing person reports yet.', 'এখনো কোনো নিখোঁজ রিপোর্ট নেই।')}
              </p>
            </div>
          )}

          {results.map((person) => (
            <div key={person.id} className="bg-surface border border-border p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-text-primary">{person.name}</h3>
                {statusBadge(person.status)}
              </div>
              <p className="text-sm text-text-muted">
                {person.lastLocation}
                {person.age != null && ` · ${person.age} ${t('yrs', 'বছর')}`}
              </p>
              {person.description && (
                <p className="text-sm text-text-secondary">{person.description}</p>
              )}
              <div className="text-xs text-text-muted pt-1">
                {t('Contact', 'যোগাযোগ')}: {person.contactName} · {person.contactPhone}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'submit' && <MissingPersonForm />}
    </div>
  )
}
