import { memo } from 'react'
import type { ChatMessage } from '@/types'

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
  message: ChatMessage
}

export default memo(function MessageBubble({ message }: Props) {
  const isEmergency = message.channel === 'emergency'

  return (
    <div className={`p-3 border-b border-border ${isEmergency ? 'border-l-4 border-l-danger' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-bold text-text-primary">{message.displayName}</span>
        <span className="text-xs text-text-muted">{timeAgo(message.createdAt)}</span>
      </div>
      <p className="text-sm text-text-muted">{message.content}</p>
    </div>
  )
})

export { timeAgo }
