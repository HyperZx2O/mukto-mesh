import { timeAgo } from '@/lib/utils'
import type { ChatMessage } from '@/types'

interface Props {
  message: ChatMessage
}

export default function MessageBubble({ message }: Props) {
  const isEmergency = message.channel === 'emergency'

  return (
    <div className={`p-3 border-b border-border ${isEmergency ? 'bg-danger-muted' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-bold text-text-primary">{message.displayName}</span>
        <span className="text-xs text-text-muted">{timeAgo(message.createdAt)}</span>
      </div>
      <p className="text-sm text-text-muted">{message.content}</p>
    </div>
  )
}
