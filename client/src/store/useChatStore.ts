import { create } from 'zustand'
import type { Channel, ChatMessage } from '@/types'

interface ChatState {
  messages: ChatMessage[]
  activeChannel: Channel
  unread: Record<Channel, number>
  addMessage: (msg: ChatMessage) => void
  setChannel: (channel: Channel) => void
  clearUnread: (channel: Channel) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  activeChannel: 'general',
  unread: { general: 0, emergency: 0, coordination: 0, medical: 0 },

  addMessage: (msg) => {
    set((s) => ({
      messages: [...s.messages, msg],
      unread: msg.channel !== s.activeChannel
        ? { ...s.unread, [msg.channel]: s.unread[msg.channel] + 1 }
        : s.unread,
    }))
  },

  setChannel: (channel) => set({ activeChannel: channel }),

  clearUnread: (channel) => set((s) => ({
    unread: { ...s.unread, [channel]: 0 }
  })),
}))
