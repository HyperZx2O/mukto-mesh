import { create } from 'zustand'

export type Channel = 'general' | 'emergency' | 'coordination' | 'medical'

export interface Message {
  id: string
  displayName: string
  channel: Channel
  content: string
  createdAt: number
}

interface ChatState {
  messages: Message[]
  activeChannel: Channel
  unread: Record<Channel, number>
  addMessage: (msg: Message) => void
  setChannel: (channel: Channel) => void
  clearUnread: (channel: Channel) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
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
