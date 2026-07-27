# Implementation Plan — Mukto Mesh (Frontend)

> **For the coding agent:** Read this entire file before writing a single line of code. Re-read the relevant phase section before starting each phase. The backend is being built in parallel — you consume its API and WebSocket; you do not own them. Treat all API contracts in this document as the agreed interface. Do not deviate without confirming with the backend member.

---

## Project Overview

| Field | Value |
|---|---|
| Project Name | Mukto Mesh — Frontend |
| Project Type | Frontend App (PWA) |
| Primary Language | TypeScript |
| Framework | React 19 + Vite |
| Target Platform | Web (mobile-first, any modern phone browser over LAN) |
| Deployment Target | Vercel (online) · Served as static files from the local Hono server (offline node) |
| Team / Owner | Frontend Member |
| Status | In Progress |

---

## Global Rules

These rules apply to every phase. Non-negotiable.

1. **Never implement a future phase early.** If Phase 3 needs a component, wait until Phase 3.
2. **Never invent API shapes or WebSocket event names** not defined in this plan or the shared spec. Consume only what the backend exposes.
3. **Every component must have a loading state, an error state, and an empty state** before any data-fetching logic is wired in.
4. **Offline is the default assumption.** Every feature must degrade gracefully when the API is unreachable. Never show a blank screen — show a cached or empty state with an offline badge.
5. **No business logic in components.** Components render and dispatch. Logic lives in hooks and stores.
6. **TypeScript strict mode. No `any`.** Use `unknown` and narrow properly. Shared types live in `src/types/`.
7. **Dark theme only.** Use only the colour tokens defined in Phase 1. No hardcoded hex values in components.
8. **System font stack only.** No web font imports — ever. This is a network-resilience constraint.
9. **All acceptance criteria must pass before moving to the next phase.** Do not skip ahead.
10. **Never present a stub component as a completed feature.** Mark placeholder UI with a `// [STUB]` comment.

---

## Architecture Decision Records

### ADR-1: React 19 + Vite
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** Need fast HMR, excellent PWA plugin support, and a stable component model.
- **Decision:** React 19 with Vite. vite-plugin-pwa handles service worker and manifest automatically.
- **Alternatives considered:** Next.js (overkill for a LAN app; SSR adds complexity with no benefit offline), SvelteKit (team familiarity risk).
- **Consequences:** No SSR. All routing is client-side via React Router. Fine for this use case.

### ADR-2: Zustand for global state
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** Need lightweight global state for chat messages (WebSocket), user identity, language toggle, and admin status. Redux is overkill.
- **Decision:** Zustand. One store per domain concern.
- **Consequences:** Simple, minimal boilerplate. No Provider wrapping required.

### ADR-3: TanStack Query for server state
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** Need stale-while-revalidate, offline awareness, and background refetching without hand-rolling it.
- **Decision:** TanStack Query (React Query v5). All REST API calls go through it.
- **Consequences:** No manual loading/error state management for API calls. Cache is automatic.

### ADR-4: Native WebSocket API for chat
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** Chat and live noticeboard updates need WebSocket. No library needed for this scale.
- **Decision:** Native browser WebSocket wrapped in a custom `useWebSocket` hook. Reconnection with exponential backoff built into the hook.
- **Consequences:** Zero extra dependency. Hook encapsulates all connection lifecycle.

### ADR-5: vite-plugin-pwa + Workbox for offline
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** Must cache static assets, knowledge base, and last-fetched news for full offline operation.
- **Decision:** vite-plugin-pwa with Workbox generateSW strategy. Custom service worker additions for Background Sync in `sw.ts`.
- **Consequences:** Service worker is auto-generated from Vite config. Manual additions go in the injected `sw.ts`.

### ADR-6: MapLibre GL JS + PMTiles for offline maps
- **Date:** 2026-07-27
- **Status:** Accepted
- **Context:** Must render Bangladesh map tiles with zero external tile server dependency.
- **Decision:** MapLibre GL JS reads from the local PMTiles file served by the Hono backend at `/tiles/bangladesh.pmtiles`.
- **Consequences:** Map works fully offline. No Mapbox token required.

---

## Technology Stack

| Layer | Choice | Justification |
|---|---|---|
| Framework | React 19 | Stable, concurrent features, excellent ecosystem |
| Build tool | Vite | Fast HMR, vite-plugin-pwa, excellent TypeScript support |
| Language | TypeScript (strict) | Type safety, shared types with backend |
| Styling | Tailwind CSS | Utility-first, fast to build, dark theme via CSS vars |
| Components | shadcn/ui | Accessible, unstyled base, Tailwind-compatible |
| PWA | vite-plugin-pwa + Workbox | Zero-config service worker, offline caching |
| Maps | MapLibre GL JS + pmtiles | Offline tile rendering from local `.pmtiles` file |
| Global state | Zustand | Lightweight, no boilerplate |
| Server state | TanStack Query v5 | Cache, background refetch, offline awareness |
| WebSocket | Native browser WebSocket API | No library needed at this scale |
| Routing | React Router v6 | Client-side routing |
| Testing | Manual + Browser DevTools | Explicit trade-off for 72h sprint — see Constraints |
| Linting | ESLint + Prettier | Code consistency |

---

## Dependency Management

- **Package manager:** npm
- **Lock file committed:** Yes — `package-lock.json` must always be committed
- **Rule for adding dependencies:** Only add a dependency if it cannot be reasonably hand-rolled in under 30 minutes. Document the reason in the commit message.
- **Known constraints:**
  - No web font libraries (network resilience)
  - No dependencies that require a CDN or external service at runtime
  - MapLibre GL JS and pmtiles must be bundled, not CDN-loaded

---

## Configuration & Environment

- `.env` is gitignored. `.env.example` is committed.
- The Vite config reads all `VITE_` prefixed vars. Missing required vars should fail the build with a clear Vite plugin error or a runtime `console.error` on startup.

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:3000` | Base URL for the Hono REST API |
| `VITE_WS_URL` | Yes | `ws://localhost:3000/ws` | WebSocket endpoint |

> **Production override:** On Vercel, set `VITE_API_URL` to the Railway backend URL.

---

## Phases Skipped

- **Phase 7 (Persistence / External Storage):** The frontend has no database. Persistence is handled by the service worker cache and `localStorage` for user identity. SQLite lives on the backend.
- **Phase 15 (Deployment & Release):** Deployment is handled by the backend member and shared infrastructure setup. Out of scope for this plan.

---

## Phase Checklist

- [x] Phase 0: Requirements & Architecture
- [x] Phase 1: Project Scaffold & Skeleton
- [x] Phase 2: Types, Constants & API Client
- [x] Phase 3: Shell — Routing, Layout, Navigation & Theme
- [x] Phase 4: Static Features — Knowledge Base & News Feed
- [ ] Phase 5: Real-Time — Chat & Live Noticeboard
- [ ] Phase 6: Forms — Missing Persons & Check-in
- [ ] Phase 7: Map — Offline Bangladesh Map with Pins
- [ ] Phase 8: Admin Panel
- [ ] Phase 9: PWA & Offline Polish
- [ ] Phase 10: Validation, Error Handling & Accessibility
- [ ] Phase 11: Performance Optimization
- [ ] Phase 12: Refactoring & Cleanup

---

## Phase 0 — Requirements & Architecture

### Goals

Confirm what the frontend must do and how it fits into the overall Mukto Mesh system before writing code.

### Summary

Mukto Mesh frontend is a React 19 PWA that connects to a local Hono.js server over LAN (or Railway when online). It serves as the browser client for all community users on the same WiFi hotspot. It must work fully offline after first load, be installable as a PWA, render correctly on budget Android phones, and display all content in Bangla and English.

### Functional scope (frontend owns)

- Display name entry on first visit (stored in `localStorage`)
- Real-time chat UI (WebSocket, 4 channels)
- Community noticeboard UI (REST + WebSocket push for new posts)
- Knowledge base: static content rendered from bundled `.md` files
- Safe check-in UI (register, ping "I'm safe")
- Missing person registry: submit form, search, display cards
- Offline news feed: display cached articles from backend
- Offline Bangladesh map: render PMTiles tiles, drop and view pins
- Admin panel UI: connected users, check-in statuses, pin/unpin/delete posts, emergency broadcast
- PWA install, service worker caching, offline badge
- Language toggle (Bangla ↔ English) accessible from every page

### Out of scope for frontend

- RSS fetching (backend job)
- Check-in interval monitoring and Twilio SMS (backend job)
- SQLite operations (backend only)
- Auto-sync Background Sync registration (`sw.ts` stub only — backend drives the sync endpoint)
- Deployment and GitHub Release packaging

### Acceptance Criteria

- [ ] This plan is read and understood in full before Phase 1 begins.
- [ ] The backend API contract (Section 12 of SPEC.md) is confirmed as the interface this frontend consumes.
- [ ] Environment variable list is agreed and `.env.example` is ready.

---

## Phase 1 — Project Scaffold & Skeleton

### Goals

- Working Vite + React 19 + TypeScript + Tailwind + shadcn/ui scaffold
- PWA manifest and vite-plugin-pwa configured
- Colour tokens and theme defined
- Dev server boots; root route renders without errors

### Tasks

1. Scaffold with Vite:
   ```bash
   npm create vite@latest client -- --template react-ts
   cd client
   npm install
   ```

2. Install core dependencies — **only what this phase needs:**
   ```bash
   npm install react-router-dom zustand @tanstack/react-query tailwindcss @tailwindcss/vite
   npm install -D vite-plugin-pwa prettier eslint
   ```

3. Configure Tailwind with the exact design tokens from the spec. Create `src/styles/tokens.css`:
   ```css
   :root {
     --color-bg:       #0a0a0a;
     --color-surface:  #141414;
     --color-border:   #262626;
     --color-primary:  #006A4E;  /* Bangladesh green */
     --color-danger:   #C8102E;  /* Bangladesh red */
     --color-text:     #f5f5f5;
     --color-muted:    #737373;
     --radius:         0.375rem;
   }
   ```
   Reference only these variables in all components. No hardcoded hex values.

4. Configure `tailwind.config.ts` to extend the theme with the tokens above.

5. Install and initialise shadcn/ui:
   ```bash
   npx shadcn@latest init
   ```
   Choose dark mode, Tailwind CSS, and `src/components/ui` as the component directory.

6. Configure `vite.config.ts` with:
   - `vite-plugin-pwa` — manifest with Mukto Mesh name, icons, `theme_color: "#006A4E"`, `background_color: "#0a0a0a"`, `display: "standalone"`
   - Workbox `generateSW` strategy — pre-cache all static assets and routes
   - `@/` alias pointing to `src/`

7. Create `client/.env.example`:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_WS_URL=ws://localhost:3000/ws
   ```

8. Create `src/lib/config.ts` — reads and exports env vars. Log a console error and throw if required vars are missing.

9. Create stub `src/App.tsx` that renders `<h1>Mukto Mesh</h1>` in the correct background colour. Confirm the dark background renders.

10. Configure ESLint and Prettier. Both must pass on the empty scaffold with zero warnings.

### Folder Structure

```
client/
├── public/
│   ├── icons/                   # PWA icons (192x192, 512x512)
│   └── manifest.webmanifest     # auto-generated by vite-plugin-pwa
├── src/
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives
│   │   ├── Chat/
│   │   ├── Noticeboard/
│   │   ├── KnowledgeBase/
│   │   ├── CheckIn/
│   │   ├── MissingPersons/
│   │   ├── NewsFeed/
│   │   ├── Map/
│   │   └── Admin/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Chat.tsx
│   │   ├── Noticeboard.tsx
│   │   ├── KnowledgeBase.tsx
│   │   ├── CheckIn.tsx
│   │   ├── MissingPersons.tsx
│   │   ├── News.tsx
│   │   ├── Map.tsx
│   │   └── Admin.tsx
│   ├── content/                 # Preloaded knowledge base .md files
│   │   ├── rights.bn.md
│   │   ├── rights.en.md
│   │   ├── firstaid.bn.md
│   │   ├── firstaid.en.md
│   │   ├── contacts.bn.md
│   │   ├── contacts.en.md
│   │   ├── checklist.bn.md
│   │   ├── checklist.en.md
│   │   ├── july2024.bn.md
│   │   └── july2024.en.md
│   ├── store/
│   │   ├── useAuthStore.ts      # display name, admin JWT
│   │   ├── useChatStore.ts      # messages, active channel
│   │   └── useLanguageStore.ts  # 'en' | 'bn'
│   ├── hooks/
│   │   ├── useWebSocket.ts
│   │   └── useOfflineStatus.ts
│   ├── lib/
│   │   ├── api.ts               # fetch wrapper using VITE_API_URL
│   │   ├── config.ts            # env var loader
│   │   └── sync.ts              # Background Sync registration stub
│   ├── types/
│   │   └── index.ts             # all shared TypeScript types
│   ├── styles/
│   │   └── tokens.css
│   ├── App.tsx
│   ├── main.tsx
│   └── sw.ts                    # Custom service worker additions
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
└── package.json
```

### Acceptance Criteria

- [ ] `npm install` completes with no errors.
- [ ] `npm run dev` boots and root route renders the dark background with "Mukto Mesh" heading.
- [ ] PWA manifest is generated and visible in browser DevTools → Application → Manifest.
- [ ] `.env` is gitignored; `.env.example` is committed with both variables documented.
- [ ] All target folders exist (even if empty).
- [ ] ESLint and Prettier pass with zero warnings on the scaffold.
- [ ] No hardcoded hex colours exist anywhere — all via CSS tokens.

### AI Agent Guidance

> Do not add any pages, routes, data fetching, or domain logic in this phase. The only output is a bootable scaffold with the correct folder structure, theme tokens, and PWA config. If something seems obviously needed, note it with `// Phase N` and move on.

---

## Phase 2 — Types, Constants & API Client

### Goals

- Define all shared TypeScript types that every component depends on
- Define all domain constants (enums, status values, channel names, tag names)
- Implement the API client wrapper that all data-fetching hooks will use
- No UI yet — this is the data contract layer

### Tasks

1. In `src/types/index.ts`, define TypeScript interfaces for every entity the frontend consumes:

   ```ts
   // Matches the backend DB schema exactly

   type Channel = 'general' | 'emergency' | 'coordination' | 'medical'
   type PostTag = 'safety' | 'medical' | 'food' | 'legal' | 'news' | 'general'
   type MissingStatus = 'missing' | 'found' | 'unverified'
   type CheckinStatus = 'active' | 'unresponsive'
   type PinType = 'shelter' | 'danger' | 'missing' | 'medical' | 'general'
   type NewsSource = 'prothomalo' | 'dailystar' | 'bdnews24'
   type Language = 'en' | 'bn'

   interface ChatMessage {
     id: string
     displayName: string
     channel: Channel
     content: string
     createdAt: number       // Unix timestamp
   }

   interface Post {
     id: string
     userId: string
     displayName: string
     tag: PostTag
     content: string
     pinned: boolean
     createdAt: number
   }

   interface MissingPerson {
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

   interface Checkin {
     id: string
     displayName: string
     contactPhone: string
     intervalHours: 2 | 4 | 6 | 12
     lastCheckinAt: number
     status: CheckinStatus
     createdAt: number
   }

   interface NewsArticle {
     id: string
     title: string
     source: NewsSource
     url: string
     content: string | null
     publishedAt: number | null
     fetchedAt: number
   }

   interface MapPin {
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

   // API response envelope — matches backend contract
   interface ApiResponse<T> {
     data: T | null
     error: string | null
   }

   // WebSocket event payloads
   type WsEventType =
     | 'message'
     | 'post_created'
     | 'post_pinned'
     | 'checkin_flagged'
     | 'broadcast'

   interface WsMessage {
     type: WsEventType
     payload: unknown
   }
   ```

2. In `src/lib/constants.ts`, define all domain constants:
   ```ts
   export const CHANNELS: Channel[] = ['general', 'emergency', 'coordination', 'medical']
   export const POST_TAGS: PostTag[] = ['safety', 'medical', 'food', 'legal', 'news', 'general']
   export const CHECKIN_INTERVALS = [2, 4, 6, 12] as const
   export const PIN_TYPES: PinType[] = ['shelter', 'danger', 'missing', 'medical', 'general']
   export const NEWS_SOURCES: NewsSource[] = ['prothomalo', 'dailystar', 'bdnews24']
   ```

3. Implement `src/lib/api.ts` — a typed fetch wrapper:
   - Base URL from `config.ts`
   - Generic `get<T>`, `post<T>`, `patch<T>`, `del<T>` functions
   - All return `ApiResponse<T>` — never throw; catch and return `{ data: null, error: message }`
   - Attach `Authorization: Bearer <token>` header automatically when admin JWT exists in `useAuthStore`

4. Implement the three Zustand stores (no logic yet — just state shape and setters):

   **`useAuthStore.ts`**
   ```ts
   interface AuthState {
     displayName: string | null
     adminToken: string | null
     setDisplayName: (name: string) => void
     setAdminToken: (token: string | null) => void
     isAdmin: () => boolean
   }
   ```
   Hydrate `displayName` and `adminToken` from `localStorage` on store init.

   **`useChatStore.ts`**
   ```ts
   interface ChatState {
     messages: ChatMessage[]
     activeChannel: Channel
     unreadCounts: Record<Channel, number>
     addMessage: (msg: ChatMessage) => void
     setActiveChannel: (channel: Channel) => void
     markChannelRead: (channel: Channel) => void
   }
   ```

   **`useLanguageStore.ts`**
   ```ts
   interface LanguageState {
     language: Language
     setLanguage: (lang: Language) => void
   }
   ```
   Persist to `localStorage`.

5. Implement `src/hooks/useOfflineStatus.ts`:
   - Wraps `navigator.onLine` and listens to `online`/`offline` window events
   - Returns `{ isOnline: boolean }`

6. Implement stub `src/lib/sync.ts` — exports `registerBackgroundSync()` which registers a Background Sync tag `'sync-missing'` and `'sync-pins'` via the service worker. No-ops gracefully if the API is unavailable.

### Acceptance Criteria

- [ ] Every entity interface is defined with no `any` types.
- [ ] `api.ts` wrapper handles network errors without throwing — returns `{ data: null, error: "..." }`.
- [ ] `useAuthStore` hydrates `displayName` from `localStorage` on first render.
- [ ] `useLanguageStore` persists language choice to `localStorage`.
- [ ] TypeScript strict mode passes with zero errors across all new files.
- [ ] No UI components are created in this phase.

### AI Agent Guidance

> This phase is purely types, constants, stores, and the API client. No JSX, no routes, no fetching from a real server yet. If you find yourself writing a component, stop.

---

## Phase 3 — Shell: Routing, Layout, Navigation & Theme

### Goals

- Working app shell: all routes defined, all pages stub-rendered
- Mobile bottom nav and desktop sidebar
- Display name entry modal on first visit
- Language toggle functional
- Offline badge wired to `useOfflineStatus`

### Tasks

1. Set up React Router in `src/App.tsx` with all routes:
   ```
   /              → Dashboard.tsx (redirect to /chat)
   /chat          → Chat.tsx
   /board         → Noticeboard.tsx
   /info          → KnowledgeBase.tsx
   /people        → MissingPersons.tsx
   /checkin       → CheckIn.tsx
   /news          → News.tsx
   /map           → Map.tsx
   /admin         → Admin.tsx (admin-guarded)
   ```

2. Implement `src/components/Layout.tsx` — wraps all pages with:
   - Top bar: "Mukto Mesh" wordmark + language toggle (EN | বাং) + offline badge
   - Bottom navigation bar (mobile, `<768px`): Chat · Board · Info · People · Map — icons + labels
   - Sidebar (desktop, `≥768px`): same 5 items + admin lock icon at bottom
   - `<Outlet />` for page content

3. Implement `src/components/OfflineBadge.tsx`:
   - Shows a persistent banner when `!isOnline`
   - Text: "Offline mode — all features still work" (Bangla equivalent when `language === 'bn'`)
   - Background: `var(--color-primary)` with `var(--color-text)`

4. Implement `src/components/DisplayNameModal.tsx`:
   - Shows on first visit when `displayName` is null in `useAuthStore`
   - Single text input: "Enter your display name"
   - On submit: calls `setDisplayName`, dismisses modal
   - No network call — local only
   - Cannot be dismissed without entering a name

5. Implement `src/components/LanguageToggle.tsx`:
   - Two buttons: EN · বাং
   - Calls `useLanguageStore.setLanguage`
   - Active language is visually highlighted

6. Create stub pages for all 8 routes. Each stub must render:
   - Page title
   - `<p>Coming in a later phase.</p>`
   - Loading state skeleton (even if never triggered — ensures the pattern exists)
   - Error state placeholder
   - Empty state placeholder

7. Confirm bottom nav active state highlights the correct tab on each route.

8. Confirm admin route shows a "Not authorised" message when `adminToken` is null.

### Acceptance Criteria

- [x] All 8 routes render their stub page without errors.
- [x] Bottom nav is visible on mobile; sidebar on desktop.
- [x] Language toggle switches the `language` state; the active language is highlighted.
- [x] Display name modal appears on first visit and cannot be dismissed without entering a name.
- [ ] Offline badge appears when `navigator.onLine` is false (test via DevTools → Network → Offline). — **requires manual browser test**
- [x] Admin route shows "Not authorised" when no admin token is present.
- [x] All tap targets are minimum 44px height.
- [x] Zero hardcoded colours — all via CSS token variables.

### AI Agent Guidance

> No data fetching in this phase. All pages are stubs. The goal is a fully navigable shell that looks right and handles the three states (loading, error, empty) as structural patterns, not yet wired to real data.

---

## Phase 4 — Static Features: Knowledge Base & News Feed

### Goals

- Knowledge base fully functional — static content, language toggle, client-side search — with zero network dependency
- News feed displays cached articles from the backend API

### Tasks

#### Knowledge Base

1. Import all `.md` files from `src/content/` using Vite's `?raw` import syntax. Do not use a markdown parsing library — use a lightweight renderer (e.g., `marked` or hand-rolled for the subset of markdown used) or convert content to JSX at build time.

2. Implement `src/pages/KnowledgeBase.tsx`:
   - Section list: Your Rights · First Aid · Emergency Contacts · Crisis Checklist · July 2024
   - Clicking a section renders the `.md` content for the active language
   - Language toggle switches between `.bn.md` and `.en.md` content instantly
   - Client-side search: filter sections by keyword match against content string
   - Search input uses `useState` — no server call, no TanStack Query

3. All knowledge base content is bundled at build time. Verify: killing the dev server and loading the page from the service worker cache still renders all content.

4. Write all 10 knowledge base content files (`rights.bn.md`, `rights.en.md`, etc.) with accurate, Bangladesh-specific content in the correct language. This is production content, not placeholder text.

   Content requirements per section:
   - **Your Rights:** Police powers, right to assembly, what to do if arrested in Bangladesh
   - **First Aid:** Crowd crush, tear gas, gunshot wounds, burns, basic triage
   - **Emergency Contacts:** Legal aid orgs, medical helplines, human rights bodies in Bangladesh
   - **Crisis Checklist:** 72-hour preparedness list, what to have before a shutdown
   - **July 2024 — What We Learned:** Factual documented account of what happened and what worked

#### News Feed

5. Implement `GET /api/news` data fetching via TanStack Query in `src/pages/News.tsx`.

6. Display articles as cards: source badge, title, timestamp (human-readable, e.g. "3 hours ago"), content snippet.

7. Source badge colour per source:
   - Prothom Alo: primary green
   - The Daily Star: neutral
   - bdnews24: neutral

8. Show "Last fetched: [time ago]" — derive from the most recent `fetchedAt` value in the response.

9. "Refresh" button — calls `POST /api/news/refresh`. Disabled and shows "Offline — cannot refresh" when `!isOnline`.

10. Empty state: "No news cached yet. Connect to the internet and refresh."

11. Error state: "Could not load news. Using cached version if available."

### Acceptance Criteria

- [x] All 5 knowledge base sections render in both Bangla and English.
- [x] Language toggle on the knowledge base page switches content instantly with no network request.
- [x] Client-side search filters sections correctly.
- [ ] Knowledge base content is fully readable with the network tab showing no requests. — **requires manual browser test (service worker caching)**
- [x] News feed displays articles from `GET /api/news` via TanStack Query.
- [x] Refresh button is disabled when offline.
- [x] All three states (loading, error, empty) are implemented for the news feed.
- [x] Knowledge base content is production-quality, not placeholder text.

### AI Agent Guidance

> The knowledge base must work with the network fully offline after first load. Test this by: loading the page, then in DevTools → Network → checking Offline, then navigating between knowledge base sections. Everything must still work. If it doesn't, the service worker precache config in vite.config.ts needs fixing.

---

## Phase 5 — Real-Time: Chat & Live Noticeboard

### Goals

- Implement `useWebSocket` hook with full connection lifecycle and reconnection logic
- Chat UI: 4 channels, real-time messages, unread badges
- Noticeboard: REST + WebSocket push for new posts, pinning

### Tasks

#### useWebSocket Hook

1. Implement `src/hooks/useWebSocket.ts`:
   - Connects to `VITE_WS_URL` on mount
   - Sends `join` event with `{ displayName, channel }` on connect
   - Dispatches incoming events to the appropriate handler based on `type`
   - Reconnects on close with exponential backoff: `[1s, 2s, 4s, 8s, 16s]` — stop at 5 attempts, then show "Connection lost" state
   - Cleans up on unmount (closes socket, clears timers)
   - Exposes: `sendMessage(channel, content)`, `switchChannel(channel)`, `connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'`

2. Wire WebSocket events to Zustand stores:
   - `message` → `useChatStore.addMessage`
   - `post_created` → invalidate `['posts']` TanStack Query key
   - `post_pinned` → invalidate `['posts']` TanStack Query key
   - `checkin_flagged` → show a toast notification with the user's name
   - `broadcast` → show a full-screen emergency banner (modal that must be dismissed)

#### Chat

3. Implement `src/pages/Chat.tsx`:
   - Channel tabs: General · Emergency · Coordination · Medical
   - Emergency channel tab has a red accent; unread badge shows count
   - Message list: sender name, timestamp, content — messages in Emergency channel have a red left border accent
   - Message input at bottom: text field + send button (or Enter key)
   - Auto-scroll to newest message on arrival
   - Shows `connectionStatus` indicator (green dot = connected, red = disconnected)
   - Offline state: shows "Chat works on LAN only — connect to the node WiFi" if somehow disconnected

4. Implement `src/components/Chat/MessageBubble.tsx` — renders a single message.

5. Implement `src/components/Chat/ChannelTab.tsx` — renders a channel tab with unread badge.

#### Noticeboard

6. Implement `src/pages/Noticeboard.tsx`:
   - Fetches posts via `GET /api/posts` (TanStack Query, `queryKey: ['posts']`)
   - Pinned posts appear first with a pin icon
   - Post cards: author, tag badge, timestamp, content
   - Tag badge colour: Safety=danger red, Medical=amber, Food=green, Legal=blue, News=purple, General=muted
   - "New Post" button → opens inline form: tag selector + content textarea + submit
   - On submit: `POST /api/posts`; on success, TanStack Query auto-refetches
   - Admin controls (visible only when `isAdmin()`): pin toggle button, delete button on each card
   - Real-time: new posts and pin changes arrive via WebSocket and trigger query invalidation

7. Implement `src/components/Noticeboard/PostCard.tsx`.

8. Implement `src/components/Noticeboard/NewPostForm.tsx`.

### Acceptance Criteria

- [ ] Sending a message in one browser tab appears in another tab within 100ms on LAN.
- [ ] Switching channels sends `switch_channel` event and shows correct message history.
- [ ] Unread badge increments on messages in non-active channels and clears on channel switch.
- [ ] Emergency channel messages have a red accent.
- [ ] WebSocket reconnects automatically after a simulated disconnect (kill and restart server).
- [ ] Noticeboard posts load from the API and render in correct pin-first order.
- [ ] New post form submits and the new post appears without a manual page refresh.
- [ ] Admin pin/delete controls are only visible when `isAdmin()` returns true.
- [ ] `broadcast` event shows a full-screen dismissable banner.

---

## Phase 6 — Forms: Missing Persons & Check-in

### Goals

- Missing person registry: submit form, search, view cards, status display
- Check-in system: register, "I'm safe" ping, status display

### Tasks

#### Missing Persons

1. Implement `src/pages/MissingPersons.tsx`:
   - Two tabs: Search · Submit Report
   - Fetches all entries via `GET /api/missing` (TanStack Query)

2. **Search tab:**
   - Text input bound to `GET /api/missing/search?q=` — debounce 300ms
   - Results as cards: all submitted fields, status badge, photo if available

3. **Submit Report tab — `src/components/MissingPersons/MissingPersonForm.tsx`:**
   - Fields: Name (required), Age, Gender (select), Last Known Location (required), Description, Contact Name (required), Contact Phone (required), Photo (optional file upload — accept image/*)
   - Validation: required fields checked before submit; phone number format check
   - On submit: `POST /api/missing` with `multipart/form-data` if photo included, else `application/json`
   - Success: show confirmation card with the submitted name; reset form
   - Offline behaviour: show notice "This report will sync to the central server when connectivity returns"

4. Status badge colours: Missing=danger red, Found=primary green, Unverified=muted

5. Empty state: "No missing persons reported. If someone is missing, submit a report."

#### Check-in

6. Implement `src/pages/CheckIn.tsx`:
   - Two states: **registered** (show ping button + time remaining) and **not registered** (show registration form)
   - Determine registered state from `localStorage` — store `checkinId` after successful registration

7. **Registration form — `src/components/CheckIn/CheckInForm.tsx`:**
   - Fields: Display Name (pre-filled from `useAuthStore`, editable), Contact Phone (required), Interval (select: 2h · 4h · 6h · 12h)
   - On submit: `POST /api/checkin/register`
   - On success: store `checkinId` in `localStorage`; switch to registered view

8. **Registered view — `src/components/CheckIn/CheckInStatus.tsx`:**
   - Shows "You are registered. Tap 'I'm Safe' before [deadline]."
   - Countdown timer: time remaining until next required check-in (derived from `lastCheckinAt + intervalHours * 3600`)
   - "I'm Safe" button: calls `POST /api/checkin/ping`; on success, resets countdown
   - If status is `unresponsive`: show red danger banner "You have been flagged as unresponsive"

### Acceptance Criteria

- [ ] Missing person form validates required fields before submission.
- [ ] Submitted report appears in the search results without page refresh.
- [ ] Photo upload is optional — form submits successfully without it.
- [ ] Offline notice is shown on the submit form when `!isOnline`.
- [ ] Check-in registration stores `checkinId` in `localStorage` and persists across refresh.
- [ ] Countdown timer updates every second.
- [ ] "I'm Safe" ping resets the countdown.
- [ ] All three states (loading, error, empty) implemented for both pages.

---

## Phase 7 — Map: Offline Bangladesh Map with Pins

### Goals

- Render Bangladesh map tiles from the local PMTiles file via MapLibre GL JS
- Display all saved pins from the backend
- Allow users to drop new pins with a label, type, and optional description

### Tasks

1. Install MapLibre GL JS and the PMTiles protocol client:
   ```bash
   npm install maplibre-gl pmtiles
   ```

2. Implement `src/pages/Map.tsx`:
   - On mount, register the PMTiles protocol with MapLibre:
     ```ts
     import { Protocol } from 'pmtiles'
     const protocol = new Protocol()
     maplibregl.addProtocol('pmtiles', protocol.tile)
     ```
   - Initialise the map with source pointing to:
     `pmtiles://${VITE_API_URL}/tiles/bangladesh.pmtiles`
   - Centre on Bangladesh: `[90.3563, 23.6850]`, zoom 7
   - Use the ProtoMaps dark basemap style or a minimal OSM-compatible style that works with the tile data

3. Fetch pins via `GET /api/pins` (TanStack Query). Render each pin as a MapLibre marker with a coloured icon per `PinType`:
   - shelter: green
   - danger: red
   - missing: amber
   - medical: blue
   - general: muted

4. Clicking a pin opens a popup with: label, type, description, timestamp.

5. **Drop Pin flow:**
   - "Add Pin" button in the top-right corner of the map
   - Clicking the button enters "placement mode" — cursor changes, next map click sets coordinates
   - A small form appears (floating panel): Label (required), Type (select), Description (optional)
   - On submit: `POST /api/pins`; marker appears on map immediately; query is invalidated

6. Map must render with no internet after first load. The `.pmtiles` file is served by the local Hono server — no external tile server. Verify this: open map, go offline in DevTools, reload — tiles must still render from service worker cache or the local server.

7. Implement `src/components/Map/PinMarker.tsx` and `src/components/Map/AddPinForm.tsx`.

### Acceptance Criteria

- [ ] Map renders Bangladesh tiles without any external network request when running on the local node.
- [ ] All pins from `GET /api/pins` appear as coloured markers.
- [ ] Clicking a marker shows a popup with pin details.
- [ ] Adding a pin via the form POSTs to the backend and the marker appears immediately.
- [ ] Map renders correctly on mobile (pinch-to-zoom works; add pin button is reachable).
- [ ] Dropping a pin without a label shows a validation error.

### AI Agent Guidance

> MapLibre GL JS requires a canvas element and will error in SSR environments. This is not an issue since the app is client-side only. If you encounter `window is not defined` errors, confirm Vite is not doing SSR. The pmtiles protocol must be registered before the map is instantiated — order matters.

---

## Phase 8 — Admin Panel

### Goals

- Admin login flow
- Full admin panel: connected users, check-in statuses, post management, emergency broadcast

### Tasks

1. Implement `src/components/Admin/AdminLogin.tsx`:
   - Password input form
   - On submit: `POST /api/admin/login` with `{ password }`
   - On success: store JWT in `useAuthStore.setAdminToken` (also persisted to `localStorage`)
   - On failure: show "Incorrect password"
   - The Admin route renders this component when `adminToken` is null

2. Implement `src/pages/Admin.tsx` with four sections (use tabs or an accordion):

   **Connected Users**
   - Fetches `GET /api/admin/connections`
   - Displays active WebSocket connection count
   - Polling every 10 seconds (TanStack Query `refetchInterval: 10000`)

   **Check-in Status Board**
   - Fetches `GET /api/checkin/status`
   - Table: Name, Interval, Last Check-in, Status badge (Active/Unresponsive)
   - Unresponsive rows highlighted with danger red background

   **Post Management**
   - Fetches `GET /api/posts` (same query as Noticeboard — share the query key `['posts']`)
   - Each post: content preview, tag, author, pin toggle button, delete button
   - Pin toggle: `PATCH /api/posts/:id/pin`
   - Delete: `DELETE /api/posts/:id` with confirmation dialog

   **Emergency Broadcast**
   - Textarea: broadcast message content
   - Send button: `POST /api/admin/broadcast`
   - On success: show "Broadcast sent to all connected users"
   - Note: the broadcast arrives at all clients via WebSocket and shows the full-screen banner (implemented in Phase 5)

3. Implement `src/components/Admin/BroadcastBanner.tsx` — full-screen overlay with red background, message text, and a "Dismiss" button. Triggered by `broadcast` WebSocket event.

4. Logout button: clears `adminToken` from store and `localStorage`, redirects to `/chat`.

### Acceptance Criteria

- [ ] Admin route shows login form when not authenticated.
- [ ] Correct password grants access; wrong password shows an error.
- [ ] Connection count updates every 10 seconds.
- [ ] Check-in table shows all registered users with correct status badges.
- [ ] Unresponsive rows are visually distinct.
- [ ] Pin toggle and delete work on posts — changes reflect immediately.
- [ ] Delete requires a confirmation dialog.
- [ ] Broadcast message sends via `POST /api/admin/broadcast` and the full-screen banner appears on all connected clients.
- [ ] Logout clears token and redirects.

---

## Phase 9 — PWA & Offline Polish

### Goals

- Service worker pre-caches everything needed for full offline operation
- PWA is installable on Android Chrome and iOS Safari
- Offline badge and UX messaging are consistent and reassuring
- Background Sync is registered for missing persons and map pins

### Tasks

1. Audit the Workbox `generateSW` config in `vite.config.ts`:
   - Pre-cache: all static assets, all routes, all knowledge base `.md` files
   - Runtime cache: `GET /api/news` (CacheFirst, 24h max age), `GET /api/posts` (NetworkFirst with fallback), map tile requests (CacheFirst)
   - Ensure the `.pmtiles` tile requests are cached (may require custom runtime cache rule for the tile URL pattern)

2. Implement `src/sw.ts` — custom service worker additions injected via vite-plugin-pwa:
   - Register Background Sync tags `'sync-missing'` and `'sync-pins'` on `sync` event
   - On sync event, call `POST /api/sync/missing` and `POST /api/sync/pins` with queued data from IndexedDB (or defer this to the backend's auto-sync job — coordinate with backend member)

3. Verify PWA install prompt:
   - On Android Chrome: "Add to Home Screen" banner should appear after first visit
   - On iOS Safari: manual "Add to Home Screen" — ensure manifest is correct so it installs as standalone

4. Implement `src/components/InstallPrompt.tsx`:
   - Listens for `beforeinstallprompt` event
   - Shows a subtle "Install Mukto Mesh" banner at the bottom
   - On click: calls `prompt()` on the deferred event
   - Dismissible; does not appear again after install or dismissal (store state in `localStorage`)

5. Review all pages for offline UX completeness:
   - Every page with network data must show a cached/stale state, not a blank error, when offline
   - Action buttons that require internet (Refresh news, submit forms that sync) must be disabled with a clear "Offline" tooltip
   - The offline badge must be visible on every page

6. Test the full offline flow manually:
   - Load the app with network
   - Kill the network (DevTools → Network → Offline)
   - Navigate to: Chat → Board → Info (all sections) → People → News → Map
   - Every page must render without errors or blank states

### Acceptance Criteria

- [ ] All static assets and knowledge base content load with network fully offline.
- [ ] News feed shows the last-cached articles offline.
- [ ] Map tiles render offline (served by local server or cached).
- [ ] PWA install prompt appears on Android Chrome.
- [ ] App installs and launches in standalone mode (no browser chrome).
- [ ] Background Sync tags are registered in the service worker.
- [ ] Every page has a functional offline state — no blank screens.
- [ ] Offline badge is visible on every page when `!isOnline`.

---

## Phase 10 — Validation, Error Handling & Accessibility

### Goals

- All forms validate input before submission
- All errors surface to the user with actionable messages — no "Something went wrong"
- WCAG AA colour contrast on all text
- Keyboard navigable throughout
- Bangla font rendering verified on a real Android device

### Tasks

1. **Form validation audit:** Review every form (display name, new post, missing person, check-in registration, admin login, add pin, broadcast). Each must:
   - Validate all required fields before calling the API
   - Show inline error messages below each invalid field
   - Disable the submit button while a request is in flight
   - Re-enable and show the error message if the API returns an error

2. **Global error boundary:** Implement `src/components/ErrorBoundary.tsx` — wraps the entire app. If a component throws, renders a friendly "Something unexpected happened — reload the page" UI instead of a blank screen.

3. **Toast notifications:** Implement a lightweight toast system (can use shadcn/ui `Sonner` or a hand-rolled approach):
   - Success toasts: green, auto-dismiss 3s
   - Error toasts: red, auto-dismiss 5s
   - Use for: post submitted, pin added, check-in successful, broadcast sent, flagged user alert

4. **Accessibility audit:**
   - All interactive elements have `aria-label` or visible text
   - Focus is managed correctly on modal open/close (trap focus inside modal, return focus on close)
   - Tab order is logical on every page
   - All icons used as interactive elements have `aria-label`
   - Colour contrast: verify `var(--color-text)` on `var(--color-bg)` passes WCAG AA (4.5:1 minimum)

5. **Bangla font rendering:** Verify the system font stack renders Bangla correctly:
   - Test on a real Android device (not just Chrome DevTools emulation)
   - The system font stack should include: `'Noto Sans Bengali', 'Hind Siliguri', sans-serif`
   - If system fonts are insufficient, evaluate including a single Bangla web font as a last resort (requires a trade-off discussion — it breaks the no-web-font rule)

6. **Error message i18n:** Ensure all user-facing error messages have Bangla equivalents and the correct language renders based on `useLanguageStore`.

### Acceptance Criteria

- [ ] Every required field shows an inline error if submitted empty.
- [ ] Submit buttons are disabled during in-flight requests.
- [ ] API errors surface as specific toast messages, never generic ones.
- [ ] ErrorBoundary catches render errors and shows a recovery UI.
- [ ] All interactive elements are keyboard-reachable via Tab.
- [ ] Focus is trapped correctly in all modals.
- [ ] Colour contrast passes WCAG AA on all text.
- [ ] Bangla text renders correctly on a real Android device.

---

## Phase 11 — Performance Optimization

### Rules

Only optimize what is **measured and proven** to be a bottleneck. Capture a baseline before changing anything.

### Tasks

1. **Bundle size audit:**
   ```bash
   npm run build
   npx vite-bundle-visualizer
   ```
   Target: total bundle < 500KB gzipped. Identify the largest chunks.

2. **MapLibre GL JS** is the expected largest dependency (~300KB). Verify it is code-split and only loaded on the `/map` route via `React.lazy` + `Suspense`.

3. **Route-level code splitting:** All pages must be lazy-loaded:
   ```ts
   const Chat = React.lazy(() => import('./pages/Chat'))
   ```
   Wrap all lazy routes in `<Suspense fallback={<PageSkeleton />}>`.

4. **Knowledge base:** `.md` file imports via `?raw` are fine — they are strings, not parsed at runtime. Verify they are pre-cached by Workbox and not re-fetched.

5. **Re-render audit:** Use React DevTools Profiler on the Chat page under message load. If any parent re-renders on every message, memoize the message list with `React.memo` or `useMemo`.

6. **Image optimization:** Missing person photos — if displayed in the registry, ensure they are constrained to a max display size (`max-width: 120px`) and not rendered at full upload resolution.

7. Document before/after for any optimization made (bundle size, render count, load time).

### Acceptance Criteria

- [ ] Initial page load is under 2 seconds on a LAN connection (measure with DevTools → Network → Fast 3G as a proxy).
- [ ] MapLibre is only loaded on the `/map` route.
- [ ] All routes are code-split and lazy-loaded.
- [ ] No optimization is made without a before/after measurement documented.

---

## Phase 12 — Refactoring & Cleanup

### Tasks

1. Search codebase for all `// [STUB]`, `// TODO`, `// FIXME`, `// temporary` comments. Resolve or convert to a tracked GitHub issue.
2. Remove all unused imports, unused components, and dead code.
3. Consolidate any duplicated fetch logic into shared hooks.
4. Verify every page still has loading, error, and empty states after refactoring.
5. Run ESLint and Prettier — zero warnings allowed.
6. Run TypeScript strict check — zero errors allowed.
7. Do a final manual test of the full offline flow (Phase 9 acceptance criteria).

### Acceptance Criteria

- [ ] Zero `// STUB`, `// TODO`, or `// FIXME` comments remain unresolved.
- [ ] ESLint passes with zero warnings.
- [ ] TypeScript strict mode passes with zero errors.
- [ ] Full offline flow works end-to-end (Phase 9 criteria still pass).
- [ ] No unused dependencies remain in `package.json`.

---

## Future Work

| Item | Priority | Notes |
|---|---|---|
| End-to-end encryption for chat messages | High | Post-hackathon — requires key exchange design |
| Bluetooth/WiFi-Direct relay for multi-hop LAN | High | Requires native APIs or Capacitor |
| Android APK via Capacitor | Medium | Wrap PWA for Play Store distribution |
| Multi-language support beyond Bangla and English | Low | i18n library would be needed |
| Damage reporting with geotagged photo upload | Medium | Requires map integration extension |

---

## Out of Scope (This Version)

The following are explicitly not part of this frontend implementation. Do not build these unless this list is updated.

- RSS feed fetching or scheduling (backend only)
- Check-in SMS alerts via Twilio (backend only)
- P2P mesh networking across separate WiFi networks
- Wikipedia or general survival guide content
- Any AI/LLM features
- Deployment pipeline configuration (handled by the backend member)
- Automated test suite (explicit 72h sprint trade-off)

---

*This plan is the single source of truth for the Mukto Mesh frontend. Read each phase in full before starting it. Complete all acceptance criteria before moving to the next phase. Last updated: 2026-07-27.*
