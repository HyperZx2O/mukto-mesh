import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/utils'
import type { NewsArticle, NewsSource, ApiResponse } from '@/types'

function sourceBadgeClass(source: NewsSource): string {
  return source === 'prothomalo'
    ? 'bg-primary text-white'
    : 'bg-surface text-text-muted'
}

function sourceLabel(source: NewsSource): string {
  if (source === 'prothomalo') return 'Prothom Alo'
  if (source === 'dailystar') return 'Daily Star'
  return 'bdnews24'
}

export default function News() {
  const lang = useLanguageStore((s) => s.lang)
  const isOffline = useOfflineStatus()
  const queryClient = useQueryClient()
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const { data, isLoading, isError } = useQuery<ApiResponse<NewsArticle[]>>({
    queryKey: ['news'],
    queryFn: () => api.get<NewsArticle[]>('/api/news'),
  })

  const refresh = useMutation({
    mutationFn: () => api.post<{ message: string }>('/api/news/refresh', {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['news'] }),
  })

  const articles = data?.data ?? []
  const lastFetched = articles.length > 0
    ? Math.max(...articles.map((a) => a.fetchedAt))
    : null

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display font-heading text-heading text-text-heading">
          {t('News', 'সংবাদ')}
        </h1>
        <button
          onClick={() => refresh.mutate()}
          disabled={isOffline || refresh.isPending}
          className="btn-ghost flex items-center gap-2"
        >
          <RefreshCw size={16} className={refresh.isPending ? 'animate-spin' : ''} />
          {isOffline ? t('Offline', 'অফলাইন') : t('Refresh', 'রিফ্রেশ')}
        </button>
      </div>

      {isOffline && (
        <p className="text-body text-text-muted">{t('Offline — cannot refresh', 'অফলাইন — রিফ্রেশ করা যাবে না')}</p>
      )}

      {lastFetched && (
        <p className="text-caption text-text-muted">
          {isOffline && <span className="mr-1">{t('[Cached]', '[ক্যাশে]')}</span>}
          {t('Last fetched', 'সর্বশেষ')}: {timeAgo(lastFetched)}
        </p>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-surface border border-border p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-background w-24" />
              <div className="h-5 bg-background w-3/4" />
              <div className="h-4 bg-background w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="error-state">
          <p className="text-body text-danger">
            {t('Could not load news. Using cached version if available.', 'সংবাদ লোড করা যায়নি। সম্ভব হলে ক্যাশে করা সংস্করণ দেখানো হচ্ছে।')}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && articles.length === 0 && (
        <div className="empty-state">
          <p className="text-body text-text-muted">
            {t('No news cached yet. Connect to the internet and refresh.', 'কোনো সংবাদ ক্যাশে নেই। ইন্টারনেটে সংযুক্ত হয়ে রিফ্রেশ করুন।')}
          </p>
        </div>
      )}

      {/* Article cards */}
      {articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-surface border border-border p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-0.5 font-bold uppercase tracking-wider ${sourceBadgeClass(article.source)}`}>
                  {sourceLabel(article.source)}
                </span>
                {article.publishedAt && (
                  <span className="text-text-muted">{timeAgo(article.publishedAt)}</span>
                )}
              </div>
              <h3 className="font-bold text-text-primary">{article.title}</h3>
              {article.content && (
                <p className="text-sm text-text-muted line-clamp-2">{article.content}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
