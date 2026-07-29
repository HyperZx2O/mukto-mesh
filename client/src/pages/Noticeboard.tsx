import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { api } from '@/lib/api'
import PostCard from '@/components/Noticeboard/PostCard'
import NewPostForm from '@/components/Noticeboard/NewPostForm'
import type { Post, ApiResponse } from '@/types'

export default function Noticeboard() {
  const lang = useLanguageStore((s) => s.lang)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const isOffline = useOfflineStatus()
  const queryClient = useQueryClient()
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const { data, isLoading, isError } = useQuery<ApiResponse<Post[]>>({
    queryKey: ['posts'],
    queryFn: () => api.get<Post[]>('/api/posts'),
  })

  const pinMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.patch(`/api/posts/${id}/pin`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const posts = useMemo(() => (data?.data ?? []).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.createdAt - a.createdAt
  }), [data?.data])

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display font-heading text-heading text-text-heading">
          {t('Noticeboard', 'নোটিশ বোর্ড')}
        </h1>
        {isOffline && <span className="text-xs text-text-muted">{t('Cached', 'ক্যাশে')}</span>}
        <NewPostForm />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface border border-border p-4 space-y-3 animate-pulse">
              <div className="h-4 bg-background w-32" />
              <div className="h-4 bg-background w-16" />
              <div className="h-4 bg-background w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="error-state">
          <p className="text-body text-danger">
            {t('Could not load posts.', 'পোস্ট লোড করা যায়নি।')}
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && posts.length === 0 && (
        <div className="empty-state">
          <p className="text-body text-text-muted">
            {t('No posts yet. Create one!', 'এখনো কোনো পোস্ট নেই। একটি তৈরি করুন!')}
          </p>
        </div>
      )}

      {/* Post list */}
      {posts.length > 0 && (
        <div className="space-y-6">
          {/* Pinned posts — full-width for emphasis */}
          {posts.filter(p => p.pinned).length > 0 && (
            <div className="space-y-3">
              <h2 className="section-head">{t('Pinned', 'পিন করা')}</h2>
              {posts.filter(p => p.pinned).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isAdmin={isAdmin}
                  onPin={(id) => pinMutation.mutate({ id })}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}
          {/* Regular posts — 2-col grid on desktop */}
          {posts.filter(p => !p.pinned).length > 0 && (
            <div className="space-y-3">
              {posts.filter(p => p.pinned).length > 0 && (
                <h2 className="section-head">{t('All Posts', 'সব পোস্ট')}</h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {posts.filter(p => !p.pinned).map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isAdmin={isAdmin}
                    onPin={(id) => pinMutation.mutate({ id })}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {pinMutation.isPending && (
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Loader2 size={14} className="animate-spin" />
          {t('Updating...', 'আপডেট হচ্ছে...')}
        </div>
      )}
    </div>
  )
}
