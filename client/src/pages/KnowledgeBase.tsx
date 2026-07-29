import { useState, useMemo, useEffect } from 'react'
import { Search, ChevronUp, BookOpen, Shield, Heart, Phone, ClipboardCheck, Clock, Info, Compass, Wifi } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { mdToHtml, extractHeadings } from '@/lib/md'
import { cn } from '@/lib/utils'

import aboutEn from '@/content/about.en.md?raw'
import aboutBn from '@/content/about.bn.md?raw'
import quickstartEn from '@/content/quickstart.en.md?raw'
import quickstartBn from '@/content/quickstart.bn.md?raw'
import runningNodeEn from '@/content/running-node.en.md?raw'
import runningNodeBn from '@/content/running-node.bn.md?raw'
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
  about: { en: aboutEn, bn: aboutBn },
  quickstart: { en: quickstartEn, bn: quickstartBn },
  'running-node': { en: runningNodeEn, bn: runningNodeBn },
  rights: { en: rightsEn, bn: rightsBn },
  firstaid: { en: firstaidEn, bn: firstaidBn },
  contacts: { en: contactsEn, bn: contactsBn },
  checklist: { en: checklistEn, bn: checklistBn },
  july2024: { en: july2024En, bn: july2024Bn },
}

const sections = [
  { key: 'about', titleEn: 'About Mukto Mesh', titleBn: 'মুক্তো মেশ পরিচিতি', descEn: 'What this app is and why it exists', descBn: 'এই অ্যাপ কী এবং কেন এটি তৈরি', Icon: Info },
  { key: 'quickstart', titleEn: 'Quick Start Guide', titleBn: 'দ্রুত শুরু', descEn: 'How to use every feature', descBn: 'প্রতিটি ফিচার ব্যবহারের পদ্ধতি', Icon: Compass },
  { key: 'running-node', titleEn: 'Running a Node', titleBn: 'নোড চালানো', descEn: 'For the person hosting the network', descBn: 'যিনি নেটওয়ার্ক হোস্ট করছেন', Icon: Wifi },
  { key: 'rights', titleEn: 'Know Your Rights', titleBn: 'আপনার অধিকার', descEn: 'Legal rights during crisis', descBn: 'সংকটে আপনার আইনি অধিকার', Icon: Shield },
  { key: 'firstaid', titleEn: 'First Aid', titleBn: 'প্রাথমিক চিকিৎসা', descEn: 'Crisis-specific medical guidance', descBn: 'সংকটকালীন চিকিৎসা নির্দেশিকা', Icon: Heart },
  { key: 'contacts', titleEn: 'Emergency Contacts', titleBn: 'জরুরি যোগাযোগ', descEn: 'Verified helplines & hotlines', descBn: 'যাচাইকৃত হটলাইন ও জরুরি নম্বর', Icon: Phone },
  { key: 'checklist', titleEn: 'Crisis Checklist', titleBn: 'সংকট মোকাবিলার তালিকা', descEn: 'Step-by-step preparedness guide', descBn: 'ধাপে ধাপে প্রস্তুতি নির্দেশিকা', Icon: ClipboardCheck },
  { key: 'july2024', titleEn: 'July 2024 — What We Learned', titleBn: 'জুলাই ২০২৪ — আমরা যা শিখেছি', descEn: 'History & lessons from the shutdown', descBn: 'শাটডাউনের ইতিহাস ও শিক্ষা', Icon: Clock },
] as const

function ReadingTime({ text }: { text: string }) {
  const wordsPerMinute = 200
  const words = text.split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute))
  return (
    <span className="text-caption text-text-dim">{minutes} min read</span>
  )
}

function TableOfContents({ headings, lang }: { headings: { level: number; text: string; id: string }[]; lang: string }) {
  if (headings.length <= 1) return null

  return (
    <nav className="hidden lg:block sticky top-20 w-56 shrink-0 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <h4 className="text-caption font-bold uppercase tracking-widest text-text-dim mb-3">
        {lang === 'bn' ? 'বিষয়সূচী' : 'On this page'}
      </h4>
      <ul className="space-y-1.5 border-l-2 border-border pl-3">
        {headings.map((h, i) => (
          <li key={i}>
            <a
              href={`#${h.id}`}
              className={cn(
                'block text-caption text-text-muted hover:text-primary-text transition-colors leading-snug py-0.5',
                h.level === 2 ? 'font-medium' : 'pl-3'
              )}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              {h.text.replace(/\*\*/g, '').replace(/\*/g, '')}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-20 right-4 z-30 w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary-hover transition-all duration-fast hover:scale-105"
      aria-label="Back to top"
    >
      <ChevronUp size={18} />
    </button>
  )
}

export default function KnowledgeBase() {
  const lang = useLanguageStore((s) => s.lang)
  const [active, setActive] = useState<string>('about')
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

  const activeContent = active && content[active] ? content[active][lang] : ''
  const headings = useMemo(() => extractHeadings(activeContent), [activeContent])
  const renderedHtml = useMemo(() => mdToHtml(activeContent), [activeContent])

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      <BackToTop />

      {/* Header */}
      <div className="space-y-1">
        <h1 className="font-display font-heading text-display text-text-heading">
          {t('Knowledge Base', 'জ্ঞানভাণ্ডার')}
        </h1>
        <p className="text-body text-text-muted">
          {t(
            'Everything you need to know to stay safe during a crisis or internet shutdown.',
            'ইন্টারনেট শাটডাউন বা সংকটের সময় নিরাপদ থাকার জন্য আপনার যা জানা দরকার।'
          )}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input-field pl-10"
          aria-label={t('Search knowledge base', 'জ্ঞানভাণ্ডার অনুসন্ধান')}
          placeholder={t('Search sections or content...', 'সেকশন বা কন্টেন্ট অনুসন্ধান...')}
        />
      </div>

      {/* Section cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3">
        {filtered.map((s) => {
          const Icon = s.Icon
          const isActive = active === s.key
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={cn(
                'text-left p-3 sm:p-4 border transition-colors duration-fast min-h-[80px] sm:min-h-[90px]',
                isActive
                  ? 'bg-primary-muted border-primary'
                  : 'bg-surface border-border hover:border-primary/30 hover:bg-surface-hover'
              )}
            >
              <div className="min-w-0">
                <p className={cn(
                  'flex items-center gap-1.5 text-small sm:text-body font-bold tracking-wide truncate',
                  isActive ? 'text-primary-text' : 'text-text-primary'
                )}>
                  <Icon size={14} className={cn(
                    'shrink-0',
                    isActive ? 'text-primary-text' : 'text-text-dim'
                  )} />
                  {lang === 'bn' ? s.titleBn : s.titleEn}
                </p>
                <p className="text-caption text-text-dim truncate mt-0.5">
                  {lang === 'bn' ? s.descBn : s.descEn}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div className="empty-state py-12">
          <Search size={32} className="mx-auto mb-4 text-text-dim" />
          <p className="text-body text-text-muted">
            {t('No matching sections found.', 'কোনো মিল পাওয়া যায়নি।')}
          </p>
        </div>
      )}

      {/* Active content area with TOC sidebar */}
      {filtered.length > 0 && activeContent && (
        <div className="flex gap-6 sm:gap-8">
          {/* Main content */}
          <article className="flex-1 min-w-0 bg-surface border border-border p-4 sm:p-6">
            {/* Content meta */}
            <div className="flex items-center gap-3 text-caption text-text-dim mb-4 pb-4 border-b border-border">
              <BookOpen size={14} />
              <ReadingTime text={activeContent} />
              {headings.length > 1 && (
                <>
                  <span className="text-border">·</span>
                  <span>{headings.length} {t('sections', 'অনুচ্ছেদ')}</span>
                </>
              )}
            </div>

            {/* Rendered markdown */}
            <div
              className="prose-custom max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </article>

          {/* Table of Contents sidebar */}
          <TableOfContents headings={headings} lang={lang} />
        </div>
      )}
    </div>
  )
}
