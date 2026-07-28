# API Contract — Mukto Mesh Frontend ↔ Backend

> This document confirms the agreed API contract between the frontend and backend.
> The authoritative source is the backend's SPEC.md §12. This is a frontend-side reference.

## Base URL

| Environment | Value |
|---|---|
| Development | `http://localhost:3000` |
| Production | Set via `VITE_API_URL` env var |

## REST Endpoints

### News

| Method | Path | Description |
|---|---|---|
| GET | `/api/news` | Fetch cached news articles |
| POST | `/api/news/refresh` | Trigger RSS refresh (requires internet) |

### Posts (Noticeboard)

| Method | Path | Description |
|---|---|---|
| GET | `/api/posts` | List all noticeboard posts |
| POST | `/api/posts` | Create a new post |
| PATCH | `/api/posts/:id/pin` | Toggle pin status (admin only) |
| DELETE | `/api/posts/:id` | Delete a post (admin only) |

### Missing Persons

| Method | Path | Description |
|---|---|---|
| GET | `/api/missing` | List all missing person reports |
| GET | `/api/missing/search?q=` | Search missing persons |
| POST | `/api/missing` | Submit a missing person report |

### Check-in

| Method | Path | Description |
|---|---|---|
| POST | `/api/checkin/register` | Register for check-in |
| POST | `/api/checkin/ping` | "I'm Safe" ping |

### Map Pins

| Method | Path | Description |
|---|---|---|
| GET | `/api/pins` | List all map pins |
| POST | `/api/pins` | Create a new map pin |

### Admin

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/login` | Admin password login |
| GET | `/api/admin/connections` | Active WebSocket connection count |
| POST | `/api/admin/broadcast` | Send emergency broadcast |

### Sync

| Method | Path | Description |
|---|---|---|
| POST | `/api/sync/missing` | Sync queued missing person reports |
| POST | `/api/sync/pins` | Sync queued map pins |

## WebSocket

| Field | Value |
|---|---|
| Endpoint | `ws://localhost:3000/ws` |
| Protocol | Native browser WebSocket (no library) |

### Incoming Events

| Type | Payload | Effect |
|---|---|---|
| `message` | `ChatMessage` | Add message to chat store |
| `post_created` | `Post` | Invalidate `['posts']` query |
| `post_pinned` | `{ postId, pinned }` | Invalidate `['posts']` query |
| `checkin_flagged` | `{ displayName }` | Show toast notification |
| `broadcast` | `{ content }` | Show full-screen emergency banner |

### Outgoing Events

| Event | Payload |
|---|---|
| `join` | `{ displayName, channel }` |
| `send_message` | `{ channel, content }` |
| `switch_channel` | `{ channel }` |

## Shared Types

| Type | Fields |
|---|---|
| `Channel` | `'general' | 'emergency' | 'coordination' | 'medical'` |
| `PostTag` | `'safety' | 'medical' | 'food' | 'legal' | 'news' | 'general'` |
| `MissingStatus` | `'missing' | 'found' | 'unverified'` |
| `CheckinStatus` | `'active' | 'unresponsive'` |
| `PinType` | `'shelter' | 'danger' | 'missing' | 'medical' | 'general'` |
| `NewsSource` | `'prothomalo' | 'dailystar' | 'bdnews24'` |

## Error Contract

All API responses follow the envelope:
```ts
interface ApiResponse<T> {
  data: T | null
  error: string | null
}
```

- Network failures return `{ data: null, error: "Network error — you may be offline" }`
- Server errors return the server's error message in the `error` field
- The frontend never throws on fetch — it always catches and returns the envelope

---

*Confirmed for Phase 0. Last updated: 2026-07-28.*
