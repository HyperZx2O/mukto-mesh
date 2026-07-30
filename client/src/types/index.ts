export type Channel = 'general' | 'emergency' | 'coordination' | 'medical'
export type PostTag = 'safety' | 'medical' | 'food' | 'legal' | 'news' | 'general'
export type MissingStatus = 'missing' | 'found' | 'unverified'
export type CheckinStatus = 'active' | 'unresponsive'
export type PinType = 'shelter' | 'danger' | 'missing' | 'medical' | 'general'
export type NewsSource = 'prothomalo' | 'dailystar' | 'bdnews24'
export type Language = 'en' | 'bn'

export interface ChatMessage {
  id: string
  displayName: string
  channel: Channel
  content: string
  createdAt: number
}

export interface Post {
  id: string
  userId: string
  displayName: string
  tag: PostTag
  content: string
  pinned: boolean
  createdAt: number
}

export interface MissingPerson {
  id: string
  name: string
  age: number | null
  gender: string | null
  lastLocation: string
  description: string | null
  contactName: string
  contactPhone: string
  photoUrl: string | null
  status: MissingStatus
  synced: boolean
  createdAt: number
}

export interface Checkin {
  id: string
  displayName: string
  contactPhone: string
  intervalHours: 2 | 4 | 6 | 12
  lastCheckinAt: number
  status: CheckinStatus
  createdAt: number
}

export interface NewsArticle {
  id: string
  title: string
  source: NewsSource
  url: string
  content: string | null
  publishedAt: number | null
  fetchedAt: number
}

export interface MapPin {
  id: string
  label: string
  type: PinType
  lat: number
  lng: number
  description: string | null
  userId: string | null
  synced: boolean
  createdAt: number
}

export interface ConnectedUser {
  id: string
  displayName: string
  channel: Channel
  connectedAt: number
}

export interface NodeStatus {
  connectedUsers: number
  checkins: {
    total: number
    active: number
    unresponsive: number
  }
  uptime: number
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}


