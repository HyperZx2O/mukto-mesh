import type { Channel, PinType } from '@/types'

export const CHANNELS: Channel[] = ['general', 'emergency', 'coordination', 'medical']
export const CHECKIN_INTERVALS = [2, 4, 6, 12] as const
export const PIN_TYPES: PinType[] = ['shelter', 'danger', 'missing', 'medical', 'general']
