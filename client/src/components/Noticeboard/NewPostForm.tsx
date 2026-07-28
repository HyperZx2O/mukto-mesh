import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { PostTag } from '@/types'

const TAGS: PostTag[] = ['safety', 'medical', 'food', 'legal', 'news', 'general']
const TAG_LABELS: Record<PostTag, { en: string; bn: string }> = {
  safety: { en: 'Safety', bn: 'নিরাপত্তা' },
  medical: { en: 'Medical', bn: 'চিকিৎসা' },
  food: { en: 'Food', bn: 'খাদ্য' },
  legal: { en: 'Legal', bn: 'আইনি' },
  news: { en: 'News', bn: 'সংবাদ' },
  general: { en: 'General', bn: 'সাধারণ' },
}

export default function NewPostForm() {
  const lang = useLanguageStore((s) => s.lang)
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [tag, setTag] = useState<PostTag>('general')
  const [content, setContent] = useState('')
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const mutation = useMutation({
    mutationFn: () => api.post('/posts', { tag, content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      setContent('')
      setTag('general')
      setOpen(false)
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    mutation.mutate()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider border border-border bg-surface text-text-primary hover:text-text-primary min-h-[44px]"
      >
        <Plus size={16} />
        {t('New Post', 'নতুন পোস্ট')}
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="bg-surface border border-border p-4 space-y-3">
      <div className="flex gap-2 flex-wrap">
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border min-h-[44px] ${
              tag === t
                ? 'bg-primary text-white border-primary'
                : 'bg-background text-text-muted border-border'
            }`}
          >
            {lang === 'bn' ? TAG_LABELS[t].bn : TAG_LABELS[t].en}
          </button>
        ))}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full bg-background border border-border text-text-primary p-3 text-sm outline-none focus:border-primary resize-none"
        rows={3}
        placeholder={t('Write your post...', 'আপনার পোস্ট লিখুন...')}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!content.trim() || mutation.isPending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider bg-primary text-white disabled:opacity-50 min-h-[44px]"
        >
          {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
          {t('Post', 'পোস্ট')}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm font-bold uppercase tracking-wider border border-border text-text-muted hover:text-text-primary min-h-[44px]"
        >
          {t('Cancel', 'বাতিল')}
        </button>
      </div>
      {mutation.isError && (
        <p className="text-sm text-danger">
          {t('Failed to post. Try again.', 'পোস্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।')}
        </p>
      )}
    </form>
  )
}
