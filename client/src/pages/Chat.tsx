import { useState, useRef, useEffect, useMemo } from 'react'
import { Send } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useChatStore } from '@/store/useChatStore'
import { useWs, sendMessage, sendSwitchChannel } from '@/lib/ws'
import { playCue } from '@/lib/uiSFX'
import type { Channel } from '@/types'
const CHANNELS: Channel[] = ['general', 'emergency', 'coordination', 'medical']
import ChannelTab from '@/components/Chat/ChannelTab'
import MessageBubble from '@/components/Chat/MessageBubble'

export default function Chat() {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const messages = useChatStore((s) => s.messages)
  const activeChannel = useChatStore((s) => s.activeChannel)
  const unread = useChatStore((s) => s.unread)
  const setChannel = useChatStore((s) => s.setChannel)
  const clearUnread = useChatStore((s) => s.clearUnread)
  const connectionStatus = useWs((s) => s.connectionStatus)

  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => messages.filter((m) => m.channel === activeChannel), [messages, activeChannel])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight
    }
  }, [filtered.length])

  const switchChannel = (ch: Channel) => {
    setChannel(ch)
    clearUnread(ch)
    sendSwitchChannel(ch)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    sendMessage(activeChannel, trimmed)
    playCue('send')
    setInput('')
  }

  const statusColor =
    connectionStatus === 'connected' ? 'bg-success' :
    connectionStatus === 'connecting' ? 'bg-warning' : 'bg-danger'

  const statusText =
    connectionStatus === 'connected' ? t('Connected', 'সংযুক্ত') :
    connectionStatus === 'connecting' ? t('Connecting...', 'সংযোগ হচ্ছে...') :
    connectionStatus === 'error' ? t('Connection lost', 'সংযোগ হারিয়ে গেছে') :
    t('Disconnected', 'সংযোগ বিচ্ছিন্ন')

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-caption text-text-muted uppercase tracking-wider">{statusText}</span>
      </div>

      <div className="flex gap-1 px-4 py-3 border-b border-border overflow-x-auto">
        {CHANNELS.map((ch) => (
          <ChannelTab
            key={ch}
            channel={ch}
            active={ch === activeChannel}
            unread={unread[ch]}
            onClick={() => switchChannel(ch)}
          />
        ))}
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted text-sm">
              {t('No messages yet.', 'এখনো কোনো বার্তা নেই।')}
            </p>
          </div>
        ) : (
          filtered.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 p-4 border-t border-border">
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="input-field"
          aria-label={t('Message', 'বার্তা')}
          placeholder={t('Type a message...', 'বার্তা লিখুন...')}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="btn-primary flex items-center gap-2"
        >
          <Send size={16} />
          {t('Send', 'পাঠান')}
        </button>
      </form>
    </div>
  )
}
