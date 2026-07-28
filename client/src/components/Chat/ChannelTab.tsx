import { useLanguageStore } from '@/store/useLanguageStore'
import type { Channel } from '@/types'

const CHANNEL_LABELS: Record<Channel, { en: string; bn: string }> = {
  general: { en: 'General', bn: 'সাধারণ' },
  emergency: { en: 'Emergency', bn: 'জরুরি' },
  coordination: { en: 'Coordination', bn: 'সমন্বয়' },
  medical: { en: 'Medical', bn: 'চিকিৎসা' },
}

interface Props {
  channel: Channel
  active: boolean
  unread: number
  onClick: () => void
}

export default function ChannelTab({ channel, active, unread, onClick }: Props) {
  const lang = useLanguageStore((s) => s.lang)
  const label = CHANNEL_LABELS[channel]
  const isEmergency = channel === 'emergency'

  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider border min-h-[44px] shrink-0 ${
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-surface text-text-muted border-border hover:text-text-primary'
      } ${isEmergency ? 'border-l-2 border-l-danger' : ''}`}
    >
      {lang === 'bn' ? label.bn : label.en}
      {unread > 0 && (
        <span className="bg-danger text-white text-xs font-bold px-1.5 py-0.5 min-w-[20px] text-center">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </button>
  )
}
