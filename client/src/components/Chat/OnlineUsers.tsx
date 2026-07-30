import { useMemo } from 'react'
import { useWs } from '@/lib/ws'
import { useLanguageStore } from '@/store/useLanguageStore'
import type { Channel } from '@/types'
import { Users, Wifi } from 'lucide-react'

const CHANNEL_COLORS: Record<Channel, string> = {
  general: 'bg-primary',
  emergency: 'bg-danger',
  coordination: 'bg-warning',
  medical: 'bg-success',
}

interface OnlineUsersProps {
  variant?: 'panel' | 'strip'
  channel?: Channel
}

export default function OnlineUsers({ variant = 'strip', channel }: OnlineUsersProps) {
  const lang = useLanguageStore((s) => s.lang)
  const onlineUsers = useWs((s) => s.onlineUsers)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const filtered = useMemo(() => {
    if (!channel) return onlineUsers
    return onlineUsers.filter((u) => u.channel === channel)
  }, [onlineUsers, channel])

  const grouped = useMemo(() => {
    const map: Record<string, typeof onlineUsers> = {}
    for (const u of onlineUsers) {
      if (!map[u.channel]) map[u.channel] = []
      map[u.channel].push(u)
    }
    return map
  }, [onlineUsers])

  if (variant === 'strip') {
    return (
      <div className="flex items-center gap-2 px-4 py-1.5 border-b border-border overflow-x-auto min-h-[2rem]">
        <Wifi size={12} className="text-primary-text shrink-0" />
        {filtered.length === 0 ? (
          <span className="text-caption text-text-muted">{t('No one else here', 'এখানে আর কেউ নেই')}</span>
        ) : (
          filtered.map((u) => (
            <span
              key={u.id}
              className="pill bg-surface text-caption text-text-muted border border-border shrink-0 uppercase tracking-wider"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${CHANNEL_COLORS[u.channel]}`} />
              {u.displayName}
            </span>
          ))
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users size={14} className="text-primary-text" />
        <h3 className="section-head text-small m-0">
          {t('Online', 'অনলাইন')}
          <span className="text-text-muted font-normal"> ({onlineUsers.length})</span>
        </h3>
      </div>
      {onlineUsers.length === 0 ? (
        <p className="text-caption text-text-muted italic">{t('No users connected', 'কোনো ব্যবহারকারী সংযুক্ত নেই')}</p>
      ) : (
        <div className="space-y-2">
          {(Object.entries(grouped) as [Channel, typeof onlineUsers][]).map(([ch, users]) => (
            <div key={ch}>
              <p className="text-caption text-text-dim uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${CHANNEL_COLORS[ch]}`} />
                {ch}
                <span className="text-text-muted">({users.length})</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {users.map((u) => (
                  <span
                    key={u.id}
                    className="pill bg-surface text-caption text-text-muted border border-border uppercase tracking-wider"
                  >
                    {u.displayName}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
