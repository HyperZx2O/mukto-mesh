import type { Channel, PostTag, PinType, NewsSource } from '@/types'

export const CHANNELS: Channel[] = ['general', 'emergency', 'coordination', 'medical']
export const POST_TAGS: PostTag[] = ['safety', 'medical', 'food', 'legal', 'news', 'general']
export const CHECKIN_INTERVALS = [2, 4, 6, 12] as const
export const PIN_TYPES: PinType[] = ['shelter', 'danger', 'missing', 'medical', 'general']
export const NEWS_SOURCES: NewsSource[] = ['prothomalo', 'dailystar', 'bdnews24']
