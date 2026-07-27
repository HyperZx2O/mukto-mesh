import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
    queryFn: () => api.get<Post[]>('/posts'),
  })

  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      api.patch(`/posts/${id}`, { pinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const posts = (data?.data ?? []).sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return b.createdAt - a.createdAt
  })

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-primary uppercase tracking-wider">
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
        <div className="border border-danger/30 bg-danger/10 p-4">
          <p className="text-sm text-danger">
            {t('Could not load posts.', 'পোস্ট লোড করা যায়নি।')}
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted">
            {t('No posts yet. Create one!', 'এখনো কোনো পোস্ট নেই। একটি তৈরি করুন!')}
          </p>
        </div>
      )}

      {/* Post list */}
      {posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isAdmin={isAdmin}
              onPin={(id, pinned) => pinMutation.mutate({ id, pinned })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
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
