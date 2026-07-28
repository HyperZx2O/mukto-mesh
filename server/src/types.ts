export type ApiResponse<T> = { data: T | null; error: string | null }

export enum WsEvent {
  JOIN = 'join',
  MESSAGE = 'message',
  SWITCH_CHANNEL = 'switch_channel',
  POST_CREATED = 'post_created',
  POST_PINNED = 'post_pinned',
  CHECKIN_FLAGGED = 'checkin_flagged',
  BROADCAST = 'broadcast',
}
