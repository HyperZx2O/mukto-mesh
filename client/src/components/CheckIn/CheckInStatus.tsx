import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useToast } from '@/components/Toast'
import type { Checkin, ApiResponse } from '@/types'

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

interface Props {
  checkinId: string
}

export default function CheckInStatus({ checkinId }: Props) {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const { data, isLoading, isError } = useQuery<ApiResponse<Checkin>>({
    queryKey: ['checkin', checkinId],
    queryFn: () => api.get<Checkin>(`/checkin/${checkinId}`),
    refetchInterval: 30_000,
  })

  const toast = useToast()

  const pingMutation = useMutation({
    mutationFn: () => api.post(`/checkin/ping`, { id: checkinId }),
    onSuccess: () => { setNow(Date.now()); toast.toast(t("I'm Safe ping sent", 'আমি নিরাপদ পিং পাঠানো হয়েছে')) },
  })

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-6 bg-surface w-48" />
        <div className="h-12 bg-surface w-32" />
        <div className="h-10 bg-surface w-40" />
      </div>
    )
  }

  if (isError || !data?.data) {
    return (
      <div className="border border-danger/30 bg-danger/10 p-4">
        <p className="text-sm text-danger">
          {t('Could not load check-in status.', 'চেক-ইন স্ট্যাটাস লোড করা যায়নি।')}
        </p>
      </div>
    )
  }

  const checkin = data.data
  const deadline = checkin.lastCheckinAt + checkin.intervalHours * 3_600_000
  const remaining = Math.max(0, deadline - now)
  const isUnresponsive = checkin.status === 'unresponsive'
  const deadlineDate = new Date(deadline)

  return (
    <div className="space-y-6 max-w-md">
      {isUnresponsive && (
        <div className="border border-danger bg-danger/10 p-4">
          <p className="text-sm font-bold text-danger uppercase tracking-wider">
            {t('You have been flagged as unresponsive', 'আপনাকে অনুত্তরিত হিসাবে চিহ্নিত করা হয়েছে')}
          </p>
        </div>
      )}

      <div className="bg-surface border border-border p-6 space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 text-text-muted">
          <Shield size={16} />
          <span className="text-sm">{t('You are registered.', 'আপনি নিবন্ধিত।')}</span>
        </div>

        <p className="text-sm text-text-muted">
          {t("Tap 'I'm Safe' before", "এখানে ক্লিক করুন 'আমি নিরাপদ' এর আগে")}
        </p>

        <p className="text-3xl font-bold text-text-primary tabular-nums tracking-tight">
          {formatCountdown(remaining)}
        </p>

        <p className="text-xs text-text-muted">
          {t('Deadline', 'সময়সীমা')}: {deadlineDate.toLocaleTimeString()}
        </p>

        <button
          onClick={() => pingMutation.mutate()}
          disabled={pingMutation.isPending}
          className="w-full bg-primary text-white font-bold uppercase tracking-wider py-3 disabled:opacity-50 min-h-[44px]"
        >
          {pingMutation.isPending ? t('Sending...', 'পাঠানো হচ্ছে...') : t("I'm Safe", 'আমি নিরাপদ')}
        </button>
      </div>
    </div>
  )
}
