import { Pin, Trash2 } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import type { Post, PostTag } from '@/types'

function tagBadgeClass(tag: PostTag): string {
  switch (tag) {
    case 'safety': return 'bg-red-600 text-white'
    case 'medical': return 'bg-amber-600 text-white'
    case 'food': return 'bg-green-600 text-white'
    case 'legal': return 'bg-blue-600 text-white'
    case 'news': return 'bg-purple-600 text-white'
    default: return 'bg-surface text-text-muted'
  }
}

const TAG_LABELS: Record<PostTag, { en: string; bn: string }> = {
  safety: { en: 'Safety', bn: 'নিরাপত্তা' },
  medical: { en: 'Medical', bn: 'চিকিৎসা' },
  food: { en: 'Food', bn: 'খাদ্য' },
  legal: { en: 'Legal', bn: 'আইনি' },
  news: { en: 'News', bn: 'সংবাদ' },
  general: { en: 'General', bn: 'সাধারণ' },
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

interface Props {
  post: Post
  isAdmin: boolean
  onPin: (id: string, pinned: boolean) => void
  onDelete: (id: string) => void
}

export default function PostCard({ post, isAdmin, onPin, onDelete }: Props) {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  return (
    <div className={`bg-surface border p-4 space-y-2 ${post.pinned ? 'border-primary' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {post.pinned && <Pin size={14} className="text-primary shrink-0" />}
          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 ${tagBadgeClass(post.tag)}`}>
            {lang === 'bn' ? TAG_LABELS[post.tag].bn : TAG_LABELS[post.tag].en}
          </span>
          <span className="text-xs text-text-muted">{timeAgo(post.createdAt)}</span>
        </div>
        {isAdmin && (
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => onPin(post.id, !post.pinned)}
              className="p-2 text-text-muted hover:text-text-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={post.pinned ? t('Unpin', 'আনপিন') : t('Pin', 'পিন')}
            >
              <Pin size={16} />
            </button>
            <button
              onClick={() => onDelete(post.id)}
              className="p-2 text-text-muted hover:text-danger min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={t('Delete', 'মুছুন')}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span className="font-bold text-text-primary">{post.displayName}</span>
      </div>
      <p className="text-sm text-text-muted whitespace-pre-wrap">{post.content}</p>
    </div>
  )
}
