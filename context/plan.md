# Implementation Plan — Mukto Mesh Backend

> **How to use this file**
> Read this file completely before writing a single line of code. Re-read the current phase before starting it. Every acceptance criterion must pass before moving to the next phase. Do not skip ahead. Do not implement anything from a future phase early.

---

## Project Overview

| Field | Value |
|---|---|
| Project Name | Mukto Mesh — Backend |
| Project Type | Backend Service |
| Primary Language | TypeScript |
| Framework | Hono.js |
| Runtime | Node.js 22 LTS |
| Target Platform | Server (local laptop LAN node + Railway cloud) |
| Package Manager | npm |
| Status | In Progress |

---

## Global Rules

1. **Never implement a future phase early.** If Phase 3 needs a feature, wait until Phase 3.
2. **Never invent APIs or contracts** not defined in this plan. All WebSocket event names and REST shapes are fixed — the frontend depends on them.
3. **Keep every change scoped to the current phase.** One phase, one concern.
4. **Never introduce a new dependency without justification.** State why it's needed.
5. **Prefer the simplest correct implementation.** This is a 72-hour sprint.
6. **All DB access goes through `src/db/` only.** No raw SQL in routes or jobs.
7. **All API responses use the `{ data, error }` envelope.** No exceptions.
8. **All WebSocket event names must match the shared `WsEvent` enum exactly.** The frontend is coded against these names.
9. **Never expose DB internals in error responses.** Log internally, return a generic 500 message.
10. **All acceptance criteria must pass before moving to the next phase.**

---

## Architecture Decision Records

### ADR-1: Hono.js as the server framework
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** Need a TypeScript-first, lightweight server that handles both HTTP and WebSocket in a single process, with minimal setup overhead for a 72h sprint.
- **Decision:** Hono.js on Node.js 22 LTS.
- **Alternatives considered:** Express (no native WS, heavier), Fastify (more config), Bun (runtime instability risk).
- **Consequences:** WebSocket handling is built-in; the entire backend is one process serving REST, WS, static files, and PMTiles.

### ADR-2: SQLite via better-sqlite3
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** The node must run on a laptop with zero external dependencies. No Postgres, no Redis.
- **Decision:** Single SQLite file `mukto_mesh.db` via `better-sqlite3` (synchronous API).
- **Alternatives considered:** Postgres (requires external process), LowDB (no SQL), in-memory only (no persistence).
- **Consequences:** Synchronous DB calls are fine for the concurrency range (5–100 users). No connection pooling needed.

### ADR-3: Message persistence in SQLite (TBD-01 resolved)
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** Spec leaves message persistence as TBD. In-memory only means messages are lost on restart.
- **Decision:** Persist messages to SQLite. It's one extra table and the insert is trivial.
- **Alternatives considered:** In-memory only (simpler but poor UX during a crisis where a node restart wipes context).
- **Consequences:** Chat history survives server restarts. `GET /messages?channel=` endpoint needed.

### ADR-4: PMTiles served as a static file
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** TBD-02 — how to distribute the Bangladesh `.pmtiles` file.
- **Decision:** Commit `bangladesh.pmtiles` to `client/public/` and serve it as a Hono static asset. The frontend reads it directly via the PMTiles JS client. No server-side tile extraction logic needed.
- **Alternatives considered:** Download script on first run (requires internet at setup), Git LFS (extra tooling).
- **Consequences:** Repo is large (~200–400MB). Git LFS should be configured for the `.pmtiles` file.

### ADR-5: JWT for admin auth, display name for regular users
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** Spec calls for no user auth — just a display name — and a simple admin password.
- **Decision:** Regular users: display name in WS join payload and POST body (no token). Admin: POST `/api/admin/login` with password → JWT (24h), sent as `Authorization: Bearer` on admin routes.
- **Consequences:** No user account system to build. Admin middleware validates JWT on every admin route.

---

## Technology Stack

| Layer | Choice | Justification |
|---|---|---|
| Language | TypeScript (strict) | Type safety; consistent with frontend |
| Framework | Hono.js | TypeScript-first, built-in WS, lightweight |
| Runtime | Node.js 22 LTS | Stable, widely available |
| Database | SQLite via better-sqlite3 | Zero setup, single file, synchronous API |
| Auth | JWT (jsonwebtoken) for admin only | Simple, stateless, no user auth needed |
| Real-time | Hono built-in WebSocket | Same process as REST, no extra infra |
| RSS parsing | rss-parser | Lightweight, no transitive dependencies |
| SMS (optional) | Twilio SDK | Check-in alerts; mocked if env vars absent |
| Logging | console with timestamps (tsx dev) | Sufficient for sprint; Railway streams logs |
| Testing | Manual + curl | No automated tests in sprint (see Constraints) |

---

## Dependency Management

- **Package manager:** npm
- **Lock file committed:** Yes (`package-lock.json`)
- **Rule for adding dependencies:** Must be listed in this plan or explicitly justified in a commit message. No silent additions.
- **Known constraints:** No GPL dependencies. Must run on Node.js 22 LTS.

---

## Configuration & Environment

All secrets in `server/.env` (gitignored). `server/.env.example` committed and kept current.

Config module at `src/config.ts` loads and validates all vars at startup. App must fail fast with a named error if a required var is missing.

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3000` | HTTP/WS listen port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `ADMIN_PASSWORD` | Yes | — | Admin panel password. Startup warning if set to `changeme`. |
| `DB_PATH` | No | `./mukto_mesh.db` | Path to SQLite file |
| `REMOTE_SYNC_URL` | No | — | Railway URL for outbound sync. Feature disabled if absent. |
| `TWILIO_ACCOUNT_SID` | No | — | Twilio credentials. SMS mocked if any of the three are absent. |
| `TWILIO_AUTH_TOKEN` | No | — | |
| `TWILIO_PHONE_NUMBER` | No | — | |

---

## Shared Contract (Read Before Coding Anything)

These types are the contract with the frontend. **Do not change them without coordinating with the frontend developer.**

### REST response envelope
```ts
// Every REST endpoint returns this shape
type ApiResponse<T> = { data: T | null; error: string | null }
```

### WebSocket event enum
```ts
enum WsEvent {
  // Client → Server
  JOIN            = 'join',
  MESSAGE         = 'message',
  SWITCH_CHANNEL  = 'switch_channel',
  // Server → Client
  WS_MESSAGE      = 'message',        // same string, direction differs
  POST_CREATED    = 'post_created',
  POST_PINNED     = 'post_pinned',
  CHECKIN_FLAGGED = 'checkin_flagged',
  BROADCAST       = 'broadcast',
}
```

### Channel values
```ts
type Channel = 'general' | 'emergency' | 'coordination' | 'medical'
```

### Post tag values
```ts
type PostTag = 'safety' | 'medical' | 'food' | 'legal' | 'news' | 'general'
```

### Missing person status values
```ts
type MissingStatus = 'missing' | 'found' | 'unverified'
```

### Check-in status values
```ts
type CheckinStatus = 'active' | 'unresponsive'
```

### Map pin type values
```ts
type PinType = 'shelter' | 'danger' | 'missing' | 'medical' | 'general'
```

---

## Phase Checklist

- [ ] Phase 1: Scaffold & Config
- [ ] Phase 2: Database Schema & Seed
- [ ] Phase 3: REST Routes — Noticeboard & Missing Persons
- [ ] Phase 4: REST Routes — Check-in, News, Map Pins, Admin
- [ ] Phase 5: WebSocket — Chat Server
- [ ] Phase 6: Background Jobs — Check-in Monitor & RSS Fetcher
- [ ] Phase 7: External Integrations — Twilio & Remote Sync
- [ ] Phase 8: Security — Admin Auth & Input Validation
- [ ] Phase 9: Error Handling & Observability

---

## Phase 1 — Scaffold & Config

### Goals
Boot a Hono server that passes a health check. Nothing else.

### Folder structure to create
```
server/
├── src/
│   ├── config.ts          # Env var loader and validator
│   ├── logger.ts          # Timestamped console wrapper
│   ├── db/
│   │   ├── index.ts       # DB connection singleton (stub — no tables yet)
│   │   └── schema.ts      # SQL CREATE TABLE strings (stub)
│   ├── routes/            # Empty folder
│   ├── ws/                # Empty folder
│   ├── jobs/              # Empty folder
│   ├── middleware/        # Empty folder
│   └── index.ts           # Hono app entry point
├── .env.example
├── tsconfig.json
└── package.json
```

### Tasks

1. `npm init` and install **only** these Phase 1 dependencies:
   - `hono`, `@hono/node-server`
   - `better-sqlite3`, `@types/better-sqlite3`
   - `typescript`, `tsx`, `@types/node`
2. Configure `tsconfig.json`: `"strict": true`, `"module": "NodeNext"`, `"target": "ES2022"`, path alias `@/*` → `src/*`.
3. Implement `src/config.ts`:
   - Load all env vars from the table above using `process.env`.
   - Throw a named error listing any missing required vars.
   - Print a startup `WARN` if `ADMIN_PASSWORD === 'changeme'`.
   - Export a single frozen `config` object.
4. Implement `src/logger.ts`: `log.info(msg)`, `log.warn(msg)`, `log.error(msg)` — each prefixes `[ISO timestamp] [LEVEL]`.
5. Implement `src/index.ts`:
   - Create Hono app.
   - `GET /health` → `200 { data: { status: 'ok', timestamp: ISO }, error: null }`.
   - Serve on `config.PORT` via `@hono/node-server`.
   - Log `Server running on port X` at startup.
6. Add npm scripts: `"dev": "tsx watch src/index.ts"`, `"start": "tsx src/index.ts"`.
7. Commit `.env.example` with all variables documented. Add `.env` and `mukto_mesh.db` to `.gitignore`.

### Acceptance Criteria

- [ ] `npm install` completes with no errors.
- [ ] `npm run dev` boots without errors.
- [ ] `curl http://localhost:3000/health` returns `200 { data: { status: 'ok', ... }, error: null }`.
- [ ] Missing a required env var causes a clear named error at startup, not a runtime crash later.
- [ ] `ADMIN_PASSWORD=changeme` prints a startup warning.
- [ ] `.env` is gitignored; `.env.example` is committed.

### AI Agent Guidance

> Do not create any route files, DB tables, or business logic. The only endpoint that should exist after this phase is `/health`. If you find yourself writing a route for posts or chat, stop and move it to Phase 3.

---

## Phase 2 — Database Schema & Seed

### Goals
Define and create all SQLite tables. Implement a DB access module with typed query functions. Seed with minimal test data.

### Tasks

1. Install `better-sqlite3` (already in Phase 1) — no new deps needed.
2. Implement `src/db/index.ts`:
   - Open/create `config.DB_PATH` synchronously on import.
   - Run all `CREATE TABLE IF NOT EXISTS` statements from `schema.ts` on startup.
   - Export the `db` instance as a singleton.
   - Log `Database ready at [path]` on successful open.
3. Implement `src/db/schema.ts` — define all `CREATE TABLE IF NOT EXISTS` SQL strings for every table below. Apply indexes at creation time.

**Tables to create** (exact column names and types from SPEC.md §11):

```sql
-- users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- messages
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  channel TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- posts
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  tag TEXT NOT NULL,
  content TEXT NOT NULL,
  pinned INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);

-- checkins
CREATE TABLE IF NOT EXISTS checkins (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  interval_hours INTEGER NOT NULL,
  last_checkin_at INTEGER NOT NULL,
  status TEXT DEFAULT 'active',
  created_at INTEGER NOT NULL
);

-- missing_persons
CREATE TABLE IF NOT EXISTS missing_persons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  last_location TEXT NOT NULL,
  description TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  photo_url TEXT,
  status TEXT DEFAULT 'missing',
  synced INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_missing_status ON missing_persons(status);

-- news_articles
CREATE TABLE IF NOT EXISTS news_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  content TEXT,
  published_at INTEGER,
  fetched_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_news_fetched_at ON news_articles(fetched_at);

-- map_pins
CREATE TABLE IF NOT EXISTS map_pins (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  description TEXT,
  user_id TEXT,
  synced INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
```

4. Implement query helper modules — one file per domain, in `src/db/`:
   - `src/db/posts.ts` — `getAllPosts()`, `createPost(data)`, `setPinned(id, pinned)`, `deletePost(id)`
   - `src/db/missing.ts` — `getAllMissing()`, `createMissing(data)`, `updateMissingStatus(id, status)`, `searchMissing(q)`, `getUnsynced()`
   - `src/db/checkins.ts` — `registerCheckin(data)`, `pingCheckin(id)`, `getAllCheckins()`, `flagUnresponsive(id)`
   - `src/db/news.ts` — `getAllNews()`, `upsertArticle(data)`, `getLastFetchedAt()`
   - `src/db/pins.ts` — `getAllPins()`, `createPin(data)`, `deletePin(id)`, `getUnsynced()`
   - `src/db/messages.ts` — `getMessages(channel, limit?)`, `createMessage(data)`
   - `src/db/users.ts` — `upsertUser(id, displayName)`

   Each function uses parameterised prepared statements. All IDs are `crypto.randomUUID()`. Timestamps are `Date.now()` (Unix ms).

5. Seed: on first run, if `posts` table is empty, insert one pinned post: `{ tag: 'general', content: 'Mukto Mesh node is running. Stay safe.', display_name: 'System', pinned: 1 }`.

### Acceptance Criteria

- [ ] `npm run dev` creates `mukto_mesh.db` with all tables on first boot.
- [ ] Re-running does not error (all statements use `CREATE TABLE IF NOT EXISTS`).
- [ ] `db.prepare('SELECT * FROM posts').all()` returns at least the seed post.
- [ ] `db.prepare('SELECT * FROM users').all()` returns empty array (not an error).
- [ ] No raw SQL exists outside of `src/db/` files.
- [ ] All query functions use prepared statements (no string concatenation of user input).

### AI Agent Guidance

> Do not write any route handlers or HTTP endpoints in this phase. The only code added is DB schema definitions and query functions. If you are writing a `new Hono()` route, stop.

---

## Phase 3 — REST Routes: Noticeboard & Missing Persons

### Goals
Expose the noticeboard and missing persons features via REST. All responses use the `ApiResponse<T>` envelope.

### Tasks

1. Create `src/middleware/apiResponse.ts` — a helper `ok(data)` and `err(message, status)` that return properly shaped Hono responses.
2. Create `src/routes/posts.ts` — mount at `/api/posts`:
   - `GET /api/posts` → all posts, pinned first, descending by `created_at`. Returns `ApiResponse<Post[]>`.
   - `POST /api/posts` → body: `{ display_name, tag, content }`. Validate: all required, `tag` must be a valid `PostTag`. Returns `ApiResponse<Post>`. After DB insert, broadcast `post_created` WS event (broadcast helper is a stub returning void until Phase 5).
   - `PATCH /api/posts/:id/pin` → admin only (stub — skip auth check until Phase 8). Toggles `pinned`. Broadcasts `post_pinned`. Returns `ApiResponse<{ id, pinned }>`.
   - `DELETE /api/posts/:id` → admin only (stub). Returns `ApiResponse<{ deleted: true }>`.
3. Create `src/routes/missing.ts` — mount at `/api/missing`:
   - `GET /api/missing` → all entries, descending by `created_at`. Returns `ApiResponse<MissingPerson[]>`.
   - `GET /api/missing/search?q=` → search by name or last_location (SQL `LIKE`). Returns `ApiResponse<MissingPerson[]>`.
   - `POST /api/missing` → body: `{ name, last_location, contact_name, contact_phone, age?, gender?, description?, photo_url? }`. Validate required fields. Returns `ApiResponse<MissingPerson>`.
   - `PATCH /api/missing/:id/status` → admin only (stub). Body: `{ status }`. Validates against `MissingStatus`. Returns `ApiResponse<MissingPerson>`.
4. Mount both route modules in `src/index.ts` under their respective paths.
5. Implement a global 404 handler: any unmatched route returns `{ data: null, error: 'Not found' }` with status 404.

### Acceptance Criteria

- [ ] `GET /api/posts` returns `{ data: [...], error: null }` with the seed post.
- [ ] `POST /api/posts` with valid body returns `201` with the created post.
- [ ] `POST /api/posts` with missing `content` returns `400` with a descriptive error string.
- [ ] `POST /api/posts` with invalid `tag` returns `400`.
- [ ] `GET /api/missing` returns `{ data: [], error: null }` (empty array, not an error).
- [ ] `POST /api/missing` with valid body returns `201`.
- [ ] `GET /api/missing/search?q=test` returns `{ data: [], error: null }` (no crash on no results).
- [ ] No endpoint returns a raw object without the `{ data, error }` wrapper.
- [ ] Unmatched routes return `404` with `{ data: null, error: 'Not found' }`.

### AI Agent Guidance

> Admin auth stubs (`PATCH /pin`, `DELETE`, `PATCH /status`) do not need any auth logic yet — just leave a comment `// TODO: admin auth (Phase 8)` and pass through. Do not implement JWT validation here.

---

## Phase 4 — REST Routes: Check-in, News, Map Pins, Messages, Admin Login

### Goals
Implement all remaining REST routes.

### Tasks

1. Create `src/routes/checkin.ts` — mount at `/api/checkin`:
   - `POST /api/checkin/register` → body: `{ display_name, contact_phone, interval_hours }`. Validate: `interval_hours` must be one of `[2, 4, 6, 12]`. Sets `last_checkin_at` to `Date.now()`, `status` to `'active'`. Returns `ApiResponse<Checkin>`.
   - `POST /api/checkin/ping` → body: `{ id }`. Updates `last_checkin_at`, resets `status` to `'active'`. Returns `ApiResponse<{ ok: true }>`.
   - `GET /api/checkin/status` → admin only (stub). Returns `ApiResponse<Checkin[]>`.

2. Create `src/routes/news.ts` — mount at `/api/news`:
   - `GET /api/news` → all cached articles, descending by `published_at`. Returns `ApiResponse<NewsArticle[]>` plus `{ lastFetchedAt: number | null }` in the data object.
   - `POST /api/news/refresh` → triggers the RSS fetch job manually (call the fetcher function directly — the job module is implemented in Phase 6, stub it as a no-op returning void for now). Returns `ApiResponse<{ triggered: true }>`.

3. Create `src/routes/pins.ts` — mount at `/api/pins`:
   - `GET /api/pins` → all pins. Returns `ApiResponse<MapPin[]>`.
   - `POST /api/pins` → body: `{ label, type, lat, lng, description?, user_id? }`. Validate: `type` must be valid `PinType`, `lat`/`lng` must be numbers. Returns `ApiResponse<MapPin>`.
   - `DELETE /api/pins/:id` → admin only (stub). Returns `ApiResponse<{ deleted: true }>`.

4. Create `src/routes/messages.ts` — mount at `/api/messages`:
   - `GET /api/messages?channel=` → returns last 100 messages for the channel. Validate channel value. Returns `ApiResponse<Message[]>`.

5. Create `src/routes/admin.ts` — mount at `/api/admin`:
   - `POST /api/admin/login` → body: `{ password }`. Compare to `config.ADMIN_PASSWORD`. If match, sign and return a JWT (24h expiry, secret = `ADMIN_PASSWORD`). Returns `ApiResponse<{ token: string }>`. If mismatch, return `401 { data: null, error: 'Invalid password' }`.
   - `POST /api/admin/broadcast` → admin only (stub for auth). Body: `{ message }`. Broadcasts `broadcast` WS event to all connected clients. Returns `ApiResponse<{ sent: true }>`.
   - `GET /api/admin/connections` → admin only (stub). Returns `ApiResponse<{ count: number }>` (return 0 until Phase 5).

6. Create `src/routes/sync.ts` — mount at `/api/sync` (this is the endpoint the remote Railway instance exposes to receive data from local nodes):
   - `POST /api/sync/missing` → body: `{ entries: MissingPerson[] }`. Upserts each entry. Returns `ApiResponse<{ synced: number }>`.
   - `POST /api/sync/pins` → body: `{ pins: MapPin[] }`. Upserts each pin. Returns `ApiResponse<{ synced: number }>`.

7. Mount all new route modules in `src/index.ts`.

### Acceptance Criteria

- [ ] `POST /api/checkin/register` with valid body returns a checkin record.
- [ ] `POST /api/checkin/register` with `interval_hours: 3` returns `400`.
- [ ] `POST /api/checkin/ping` with a valid id resets `last_checkin_at`.
- [ ] `GET /api/news` returns `{ data: { articles: [], lastFetchedAt: null }, error: null }` on empty DB.
- [ ] `POST /api/admin/login` with correct password returns a JWT string.
- [ ] `POST /api/admin/login` with wrong password returns `401`.
- [ ] `GET /api/messages?channel=general` returns an array (empty on fresh DB).
- [ ] `GET /api/messages?channel=invalid` returns `400`.
- [ ] All routes use `ApiResponse<T>` envelope without exception.

---

## Phase 5 — WebSocket: Chat Server

### Goals
Implement the WebSocket server for real-time chat and server-push events. Wire all broadcast stubs from Phases 3 and 4.

### Tasks

1. Install no new deps — Hono has built-in WS support via `@hono/node-server`.
2. Create `src/ws/chat.ts`:
   - Define the `WsClient` type: `{ ws: WebSocket, displayName: string, channel: Channel, connectedAt: number }`.
   - Maintain a `clients: Map<string, WsClient>` (keyed by connection UUID).
   - Export `broadcastToChannel(channel, eventType, payload)` — sends only to clients in that channel.
   - Export `broadcastToAll(eventType, payload)` — sends to all connected clients.
   - Export `getConnectionCount()` — returns `clients.size`.
   - Implement `onOpen(ws)`: add client to map with a new UUID, log connection count.
   - Implement `onMessage(ws, clientId, raw)`: parse JSON, switch on event type:
     - `join`: set `displayName` and `channel` on the client entry. Send back a `join_ack` with the last 50 messages for that channel (read from DB).
     - `message`: validate `channel` and `content`. Insert into `messages` table via `src/db/messages.ts`. Call `broadcastToChannel(channel, 'message', messagePayload)`.
     - `switch_channel`: update client's `channel`. Send back last 50 messages for new channel.
   - Implement `onClose(ws, clientId)`: remove from `clients` map, log.
   - Every `ws.send()` call is wrapped in try/catch — stale connection errors are caught and the client is removed from the map.
3. Wire the WS handler into `src/index.ts` using Hono's WS upgrade helper.
4. Replace all broadcast stubs from Phases 3 and 4 with real calls to `broadcastToAll` or `broadcastToChannel`.
5. Wire `GET /api/admin/connections` to return `getConnectionCount()`.

### Message payload shape (server → client)
```ts
{
  type: 'message',
  id: string,
  displayName: string,
  channel: Channel,
  content: string,
  createdAt: number
}
```

### Acceptance Criteria

- [ ] Two browser tabs can open a WS connection, send messages, and both receive them in real time.
- [ ] Messages in `general` are not received by a client in `emergency`.
- [ ] On `join`, the client receives the last 50 messages for their channel.
- [ ] Closing one tab does not crash the server or cause errors for remaining clients.
- [ ] `GET /api/admin/connections` returns the correct live count.
- [ ] Creating a noticeboard post triggers a `post_created` WS event to all clients.
- [ ] Admin broadcast triggers a `broadcast` WS event to all clients.
- [ ] All sent payloads include a `type` field matching the `WsEvent` enum values.

### AI Agent Guidance

> The `broadcast` helper must guard against sending to closed connections. The pattern is: attempt `ws.send()`, catch any error, remove the client from the map if the send fails. Never let a single failed send propagate.

---

## Phase 6 — Background Jobs: Check-in Monitor & RSS Fetcher

### Goals
Implement recurring server-side jobs: the check-in interval monitor and the RSS news fetcher.

### Tasks

1. Create `src/jobs/checkinMonitor.ts`:
   - Export `startCheckinMonitor()` which sets up a `setInterval` running every **60 seconds**.
   - On each tick: query all `active` check-ins from DB. For each one, calculate if `Date.now() - last_checkin_at > interval_hours * 3600 * 1000`. If yes:
     - Call `flagUnresponsive(id)` to update DB status to `'unresponsive'`.
     - Create a noticeboard post: `{ tag: 'safety', display_name: 'System', content: 'User [name] has not checked in and is unresponsive. Last check-in: [time].' }`.
     - Call `broadcastToAll('checkin_flagged', { displayName: name })`.
     - If Twilio is configured: send SMS to `contact_phone` (implemented in Phase 7 — stub as a no-op log for now).
   - The monitor must not crash if DB throws — catch, log, continue.
   - Guard against re-flagging: only flag if current status is `'active'`.

2. Create `src/jobs/newsFetcher.ts`:
   - Install `rss-parser` as a new dependency. Justify: lightweight RSS parsing, no alternatives in-stack.
   - Export `fetchNews()` (async function, callable manually from `POST /api/news/refresh`).
   - Export `startNewsFetcher()` which calls `fetchNews()` once on startup (if internet available — wrap in try/catch, log error and continue if offline) then sets an interval to re-fetch every **30 minutes**.
   - `fetchNews()` fetches RSS from:
     - `https://www.prothomalo.com/feed/` (source: `'prothomalo'`)
     - `https://www.thedailystar.net/rss.xml` (source: `'dailystar'`)
     - `https://bdnews24.com/?feed=rss2` (source: `'bdnews24'`)
   - For each article, call `upsertArticle()` from `src/db/news.ts` (upsert by `url UNIQUE`).
   - Fetch failures per-source are caught and logged individually — one failed source does not abort the others.
   - Log total articles fetched per run.

3. Call `startCheckinMonitor()` and `startNewsFetcher()` in `src/index.ts` after the server starts listening.
4. Wire `POST /api/news/refresh` to call `fetchNews()` (replace the stub from Phase 4).

### Acceptance Criteria

- [ ] Server boots and both jobs start without errors.
- [ ] After registering a check-in with `interval_hours: 0.016` (1 minute for testing), the monitor flags it within 2 minutes and a `checkin_flagged` WS event is emitted.
- [ ] A flagged user is not flagged again on subsequent monitor ticks.
- [ ] `POST /api/news/refresh` calls `fetchNews()` and `GET /api/news` returns populated articles (when internet is available).
- [ ] A single offline RSS source does not crash the fetcher or block other sources.
- [ ] Monitor ticks do not accumulate — slow DB calls do not cause tick pile-up (use `setInterval`, not recursive `setTimeout` chained from the previous call).

---

## Phase 7 — External Integrations: Twilio & Remote Sync

### Goals
Implement Twilio SMS (with graceful mock) and the outbound sync to the remote Railway server.

### Tasks

1. Create `src/integrations/twilio.ts`:
   - Install `twilio` SDK. Justify: official SDK, Twilio is spec-mandated.
   - Export `sendSms(to: string, body: string): Promise<void>`.
   - On import, check if all three Twilio env vars are present. If not, `log.warn('Twilio not configured — SMS alerts will be mocked')` and set a `MOCK_MODE` flag.
   - In `MOCK_MODE`: `sendSms` logs `[MOCK SMS] to: {to} | body: {body}` and returns without error.
   - In real mode: use the Twilio SDK to send. Catch errors, log them, and return without throwing (an SMS failure must never crash the job or the request).

2. Wire `sendSms` into `src/jobs/checkinMonitor.ts` — replace the stub from Phase 6.

3. Create `src/integrations/remoteSync.ts`:
   - Export `syncToRemote(): Promise<void>`.
   - If `config.REMOTE_SYNC_URL` is not set: log `Remote sync URL not configured — sync disabled` and return immediately.
   - Query unsynced missing persons via `getUnsynced()` from `src/db/missing.ts`.
   - Query unsynced map pins via `getUnsynced()` from `src/db/pins.ts`.
   - If there is nothing to sync, return immediately.
   - POST to `{REMOTE_SYNC_URL}/api/sync/missing` and `{REMOTE_SYNC_URL}/api/sync/pins`.
   - On success: mark each synced entry's `synced` column to `1`.
   - On failure: log the error and return without throwing. Data stays in the queue for the next attempt.
   - Use `fetch` (native in Node 22). No additional HTTP client needed.

4. Export `startSyncJob()` from `remoteSync.ts` which calls `syncToRemote()` every **5 minutes** via `setInterval`. Call it from `src/index.ts`.

### Acceptance Criteria

- [ ] Without Twilio env vars, server boots cleanly and logs the mock warning.
- [ ] Check-in monitor triggering logs `[MOCK SMS]` with the correct phone number and message.
- [ ] Without `REMOTE_SYNC_URL`, sync job starts, logs the disabled message, and does nothing.
- [ ] With `REMOTE_SYNC_URL` set to a running local instance, unsynced entries are POSTed and marked `synced = 1`.
- [ ] A failed remote sync does not crash the server or throw an unhandled rejection.

---

## Phase 8 — Security: Admin Auth & Input Validation

### Goals
Wire JWT admin auth on all admin-protected routes. Harden all input validation.

### Tasks

1. Install `jsonwebtoken`, `@types/jsonwebtoken`. Justify: JWT for admin session per spec.
2. Create `src/middleware/adminAuth.ts`:
   - Hono middleware that reads `Authorization: Bearer <token>` header.
   - Verifies JWT using `config.ADMIN_PASSWORD` as the secret.
   - On valid token: calls `next()`.
   - On missing or invalid token: returns `401 { data: null, error: 'Unauthorised' }`.
3. Apply `adminAuth` middleware to all admin-only route handlers:
   - `PATCH /api/posts/:id/pin`
   - `DELETE /api/posts/:id`
   - `PATCH /api/missing/:id/status`
   - `GET /api/checkin/status`
   - `DELETE /api/pins/:id`
   - `POST /api/admin/broadcast`
   - `GET /api/admin/connections`
4. Verify all input validation from Phases 3 and 4 is complete. Specifically:
   - All required fields checked before DB insert — return `400` with field name if missing.
   - All enum fields (`tag`, `channel`, `status`, `type`, `interval_hours`) validated against allowed values.
   - `lat`/`lng` must be finite numbers within Bangladesh bounding box: lat `20.3–26.7`, lng `88.0–92.7`. Return `400` if out of bounds.
   - `content` and `description` fields: strip leading/trailing whitespace, reject if empty after trim.
5. SQL injection: confirm all queries use prepared statements (audit — no change should be needed if Phase 2 was followed correctly).
6. Add `ADMIN_PASSWORD` startup warning if value is `changeme` (should already exist from Phase 1 — verify).

### Acceptance Criteria

- [ ] `PATCH /api/posts/:id/pin` without a token returns `401`.
- [ ] `PATCH /api/posts/:id/pin` with a valid token from `POST /api/admin/login` returns `200`.
- [ ] `PATCH /api/posts/:id/pin` with an expired or tampered token returns `401`.
- [ ] `POST /api/pins` with `lat: 999` returns `400`.
- [ ] `POST /api/posts` with `tag: 'invalid'` returns `400`.
- [ ] `POST /api/posts` with `content: '   '` returns `400`.
- [ ] No raw SQL string concatenation exists anywhere in the codebase (audit pass).

---

## Phase 9 — Error Handling & Observability

### Goals
Ensure no unhandled error crashes the server. Standardise all error responses. Improve logging.

### Tasks

1. Add a Hono `onError` global handler in `src/index.ts`:
   - Logs the full error with stack trace at `log.error`.
   - Returns `500 { data: null, error: 'Internal server error' }`.
   - Never leaks the raw error message or stack to the client.

2. Add a Hono `notFound` handler:
   - Returns `404 { data: null, error: 'Not found' }`.

3. Wrap all `setInterval` job callbacks in try/catch if not already done. A job tick that throws must not kill the interval — catch, log, continue.

4. Add process-level error handlers in `src/index.ts`:
   ```ts
   process.on('uncaughtException', (err) => { log.error('Uncaught exception', err); });
   process.on('unhandledRejection', (reason) => { log.error('Unhandled rejection', reason); });
   ```
   These log and keep the server alive rather than crashing.

5. Ensure every async route handler has a try/catch or is wrapped with Hono's built-in async error propagation. Confirm no `async` handler exists without error forwarding.

6. Log enrichment: each request logs `[METHOD] [path] [status] [duration ms]`. Implement via Hono middleware in `src/index.ts`.

### Acceptance Criteria

- [ ] A deliberate `throw new Error('test')` inside a route handler returns `500` with the generic message, not the raw error.
- [ ] The server does not crash after any single bad request or runtime error.
- [ ] Every request generates a log line with method, path, status, and duration.
- [ ] Job intervals continue running after a tick throws an error.
- [ ] `process.on('uncaughtException')` is registered before the server starts listening.

---

## Out of Scope (This Version)

- Full RBAC / multiple admin roles
- P2P mesh networking across separate WiFi networks
- End-to-end encryption for chat
- Android APK / Capacitor wrapper
- Automated test suite (manual testing only — 72h constraint)
- CI/CD pipeline
- Damage reporting with photo upload
- Federated node sync (nodes knowing about each other)
- Single executable distribution via `pkg` or Bun compile
- Wikipedia / general survival guides

---

## Future Work

| Item | Priority | Notes |
|---|---|---|
| E2E encryption for chat | High | Implement post-hackathon before any public deployment |
| P2P mesh across hotspots | High | LoRa or Bluetooth relay |
| Automated test suite | Medium | At minimum: unit tests for business logic and DB query functions |
| Single executable (Bun compile) | Medium | TBD-03 — eliminates Node.js requirement for node operators |
| Full RBAC | Low | Multiple admin roles, moderators |

---

*Read this plan fully before writing any code. Complete each phase's acceptance criteria before starting the next. If this is a coding agent: do not invent endpoints, types, or table columns not listed here — the frontend is coded against these exact contracts.*

*Last updated: 2026-07-27*
