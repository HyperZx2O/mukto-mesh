import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useChatStore } from '@/store/useChatStore'
import { useWs } from '@/lib/ws'
import ChannelTab from '@/components/Chat/ChannelTab'
import MessageBubble from '@/components/Chat/MessageBubble'
import type { Channel } from '@/types'

const CHANNELS: Channel[] = ['general', 'emergency', 'coordination', 'medical']

export default function Chat() {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const messages = useChatStore((s) => s.messages)
  const activeChannel = useChatStore((s) => s.activeChannel)
  const unread = useChatStore((s) => s.unread)
  const setChannel = useChatStore((s) => s.setChannel)
  const clearUnread = useChatStore((s) => s.clearUnread)
  const { connectionStatus, sendMessage } = useWs()

  const [input, setInput] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const filtered = messages.filter((m) => m.channel === activeChannel)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [filtered.length])

  const switchChannel = (ch: Channel) => {
    setChannel(ch)
    clearUnread(ch)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    sendMessage(activeChannel, trimmed)
    setInput('')
  }

  const statusColor =
    connectionStatus === 'connected' ? 'bg-green-500' :
    connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'

  const statusText =
    connectionStatus === 'connected' ? t('Connected', 'সংযুক্ত') :
    connectionStatus === 'connecting' ? t('Connecting...', 'সংযোগ হচ্ছে...') :
    connectionStatus === 'error' ? t('Connection lost', 'সংযোগ হারিয়ে গেছে') :
    t('Disconnected', 'সংযোগ বিচ্ছিন্ন')

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border">
        <span className={`w-2 h-2 rounded-full ${statusColor}`} />
        <span className="text-xs text-text-muted uppercase tracking-wider">{statusText}</span>
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
          className="flex-1 bg-surface border border-border text-text-primary px-4 py-3 text-sm outline-none focus:border-primary min-h-[44px]"
          placeholder={t('Type a message...', 'বার্তা লিখুন...')}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider bg-primary text-white disabled:opacity-50 min-h-[44px]"
        >
          <Send size={16} />
          {t('Send', 'পাঠান')}
        </button>
      </form>
    </div>
  )
}
