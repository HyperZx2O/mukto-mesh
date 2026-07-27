import { useLanguageStore } from '@/store/useLanguageStore'

interface Props {
  title: string
  titleBn: string
}

export default function PageStub({ title, titleBn }: Props) {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  return (
    <div className="p-4 space-y-6">
      {/* [STUB] — placeholder page for future phase */}
      <h1 className="text-2xl font-bold text-text-primary">{lang === 'bn' ? titleBn : title}</h1>
      <p className="text-text-muted">{t('Coming in a later phase.', 'পরবর্তী ধাপে আসছে।')}</p>

      {/* Loading skeleton */}
      <div className="animate-pulse space-y-3">
        <div className="h-4 bg-surface rounded w-3/4" />
        <div className="h-4 bg-surface rounded w-1/2" />
        <div className="h-4 bg-surface rounded w-5/6" />
      </div>

      {/* Error state */}
      <div className="border border-danger/30 bg-danger/10 p-4">
        <p className="text-sm text-danger">{t('Something went wrong.', 'কিছু ভুল হয়েছে।')}</p>
      </div>

      {/* Empty state */}
      <div className="text-center py-8">
        <p className="text-text-muted">{t('No data yet.', 'এখনও কোনো তথ্য নেই।')}</p>
      </div>
    </div>
  )
}
