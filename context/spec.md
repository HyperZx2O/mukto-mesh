# SPEC.md — Mukto Mesh
### Single Source of Truth · July Hackathon 2026

---

## Table of Contents

1. [Project Overview and Vision](#1-project-overview-and-vision)
2. [Goals and Non-Goals](#2-goals-and-non-goals)
3. [Problem Statement](#3-problem-statement)
4. [Target Users and Use Cases](#4-target-users-and-use-cases)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Complete Feature List with Detailed Behaviour](#7-complete-feature-list-with-detailed-behaviour)
8. [User Flows and Application Workflow](#8-user-flows-and-application-workflow)
9. [System Architecture](#9-system-architecture)
10. [Technology Stack](#10-technology-stack)
11. [Database Schema and Data Models](#11-database-schema-and-data-models)
12. [API Design and Endpoints](#12-api-design-and-endpoints)
13. [Folder and Project Structure](#13-folder-and-project-structure)
14. [Coding Standards and Architectural Principles](#14-coding-standards-and-architectural-principles)
15. [Configuration and Environment Variables](#15-configuration-and-environment-variables)
16. [Error Handling Strategy](#16-error-handling-strategy)
17. [Authentication and Authorisation](#17-authentication-and-authorisation)
18. [State Management Approach](#18-state-management-approach)
19. [UI/UX Guidelines and Design Principles](#19-uiux-guidelines-and-design-principles)
20. [Performance Considerations](#20-performance-considerations)
21. [Security Considerations](#21-security-considerations)
22. [Logging and Monitoring](#22-logging-and-monitoring)
23. [Testing Strategy](#23-testing-strategy)
24. [Deployment Strategy](#24-deployment-strategy)
25. [Development Milestones](#25-development-milestones)
26. [Future Enhancements](#26-future-enhancements)
27. [Assumptions, Constraints, and Trade-offs](#27-assumptions-constraints-and-trade-offs)
28. [Reference Repositories](#28-reference-repositories)

---

## 1. Project Overview and Vision

**Project Name:** Mukto Mesh

**Tagline:** *Stay connected when they cut the cord.*

**Hackathon:** July Hackathon 2026 — Track A: Crisis Tech

**Track justification:** Mukto Mesh is directly dedicated to the spirit of Jogajog — the decentralised communication network students used during the internet shutdowns of the July 2024 Revolution. It addresses what happens when infrastructure fails and communities need to function without it.

**Vision:** Mukto Mesh is a lightweight, offline-first, self-hostable community hub that any person in Bangladesh can download once and spin up on a laptop, instantly turning their local network into a functioning crisis coordination node — with chat, alerts, a knowledge base, missing person registry, safe check-in, an operational dashboard, and offline maps. No cloud dependency. No technical expertise required beyond running one command or double-clicking a batch file.

**Distribution model:** Dual-mode.
- **Online:** Deployed on Railway (backend) and Vercel (frontend), accessible to anyone with internet.
- **Offline node:** Downloaded from GitHub Releases, run locally via `npm start` or `start.bat`, serves the entire neighbourhood over a shared WiFi hotspot. The browser is the client — no installation required on any other device.

---

## 2. Goals and Non-Goals

### Goals

- Build a fully functional offline-first PWA that works on any modern phone browser via local network
- Provide real-time LAN chat without requiring internet
- Provide a crisis Dashboard with live metrics (connected users, check-ins, posts, missing persons, news, map pins)
- Serve a preloaded, Bangladesh-specific knowledge base in Bangla and English
- Enable missing person registration and search with photo upload, with sync when internet returns
- Implement a safe check-in system that auto-flags unresponsive users
- Serve offline Bangladesh maps via ProtoMaps PMTiles
- Cache verified news from trusted Bangladeshi sources for offline reading
- Be distributable as a single downloadable package from GitHub with a one-click launcher
- Ship a complete, polished submission before July 30 23:59 BST

### Non-Goals

- This is not a nationwide real-time communication platform — it is hyper-local by design
- This does not replace mobile networks, satellite internet, or VPNs
- This does not include AI/LLM features (out of scope for 72h)
- This does not include Wikipedia or general survival guides (content is curated and Bangladesh-specific)
- This does not include hardware components
- This does not support P2P mesh networking across separate WiFi networks (future enhancement)

---

## 3. Problem Statement

In July 2024, the Bangladesh government shut down the internet for days. People couldn't find missing family members. Volunteers couldn't reach the injured. Nobody knew what was true. Rumors filled the gap that information left behind.

That wasn't bad luck. It was a deliberate cut, and ordinary people had nothing to fall back on.

VPNs need foresight. Satellite internet needs money. Most people in a crisis have neither. There's no tool built for this specific context, in Bangla, that an ordinary person can spin up on a laptop and use to keep their community functioning when the connection dies.

The next shutdown won't announce itself. And right now, nobody is ready.

---

## 4. Target Users and Use Cases

### Primary Users

| User | Context |
|---|---|
| Node operator | Downloads and runs Mukto Mesh on their laptop during or before a crisis. Becomes the hub for their building or neighbourhood. |
| Community member | Connects to the node via their phone browser on shared WiFi. No download required. |
| Node admin | Manages the noticeboard, pins critical alerts, broadcasts emergency messages, updates missing person statuses. |

### Use Cases

- **During internet shutdown:** A student runs the node on their laptop. 30 neighbours connect via hotspot. They coordinate shelter, share first aid info, post alerts, check in regularly.
- **During protest:** A community runs the node to distribute verified information without relying on a central server that can be blocked.
- **Before a crisis:** Anyone downloads the package from GitHub while internet exists. They have everything they need when it's gone.
- **After a crisis:** Missing person reports and damage data sync automatically to the remote server when connectivity returns.

---

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | The system shall provide real-time chat over LAN via WebSockets with no internet |
| FR-02 | The system shall provide a community noticeboard with tagged posts and pinning |
| FR-03 | The system shall serve a preloaded knowledge base in Bangla and English |
| FR-04 | The system shall allow users to register and search missing persons with photo uploads |
| FR-05 | The system shall implement a safe check-in system with auto-flagging on missed intervals |
| FR-06 | The system shall cache verified news from trusted Bangladeshi sources for offline reading |
| FR-07 | The system shall serve offline Bangladesh maps via ProtoMaps PMTiles |
| FR-08 | The system shall provide a node admin panel to manage posts, users, check-ins, and broadcasts |
| FR-09 | The system shall function as an installable PWA on any mobile device |
| FR-10 | The system shall auto-sync queued offline data when internet is restored |
| FR-11 | The system shall be launchable with a single `npm start` command or by double-clicking `start.bat` |
| FR-12 | The system shall be downloadable as a packaged release from GitHub |
| FR-13 | The system shall provide a Dashboard landing page with live crisis metrics and quick actions |

---

## 6. Non-Functional Requirements

### Performance
- Initial page load under 2 seconds on a local network
- WebSocket message delivery under 100ms on LAN
- Knowledge base pages render instantly from cache — no network request required
- Dashboard metrics poll every 10–30 seconds with skeleton loading states

### Offline Capability
- All core features must function with zero internet after first load
- Service worker must cache all static assets, knowledge base, and last-fetched news
- PWA must be installable on Android and iOS via browser prompt

### Scalability
- Designed for 5–100 concurrent users per node (neighbourhood scale)
- Not designed for national-scale simultaneous users on a single node

### Accessibility
- Bilingual UI: Bangla and English throughout with prominent toggle
- WCAG AA colour contrast minimum (verified via OKLCH perceptual palette)
- Keyboard navigable with custom focus-visible ring
- Minimum 44px tap targets on all interactive elements
- Readable on low-resolution budget Android phones

### Security
- No surveillance tooling — the app explicitly does not track location or collect personal data beyond what users voluntarily submit
- Missing person entries and check-in contact numbers stored in SQLite, not transmitted without user action
- Admin panel protected by JWT-based password authentication

### Reliability
- Graceful degradation: every feature has a defined behaviour when internet is unavailable
- Node continues serving all features as long as the host laptop stays on
- Offline badge informs users that the app is operating in offline mode intentionally

---

## 7. Complete Feature List with Detailed Behaviour

### 7.0 Dashboard (Landing Page)

- Default landing page at `/` — no more redirect to chat
- Displays live crisis metrics in a responsive grid:
  - **Online users** — real-time WebSocket connection count
  - **Active check-ins** — total + unresponsive breakdown
  - **Posts** — total noticeboard posts + pinned count
  - **Missing persons** — total reports + missing/found breakdown
  - **News articles** — cached article count
  - **Map pins** — total map markers
- Quick action buttons: Chat, Board, Info, People, Map, News (1-col mobile → 3-col desktop)
- Pinned alerts carousel — shows pinned posts with timestamps
- Recent activity feed — latest posts with author and timestamp
- Community stats footer — compact numeric summary of all metrics
- Connection status indicator — green/yellow/red dot with label
- Admin badge when logged in
- Skeleton loading state during data fetch
- Automatic polling every 10–30 seconds for live updates

### 7.1 Local Network Chat

- Real-time messaging via WebSockets over LAN
- No account required — user enters a display name on first visit, stored in `localStorage`
- Channels: **General, Emergency, Coordination, Medical**
- Messages display sender name, channel, and timestamp
- Unread message badge per channel
- Emergency channel messages display with a red accent to indicate urgency
- Messages persisted to SQLite (last 50 messages loaded on channel join)
- Anyone connected to the node's IP on the same network can join instantly
- Display name modal on first chat visit

### 7.2 Community Noticeboard

- Any connected user can post an alert
- Post types (tags): **Safety, Medical, Food/Water, Legal, News, General** — each with a distinct colour badge
- Posts display author name, tag, timestamp, and content
- Admin can pin posts — pinned posts always appear at the top
- Admin can delete any post
- Posts stored in SQLite, persist across server restarts
- Real-time update via WebSocket push when new post is created or pinned
- Empty state shown when no posts exist

### 7.3 Knowledge Base (Preloaded, Static)

All content is bundled at build time. No network request required ever.

Sections:

| Section | Content |
|---|---|
| Your Rights | What police can and cannot do, right to assembly, what to do if arrested in Bangladesh |
| First Aid | Crowd crush, tear gas exposure, gunshot wounds, burns, basic triage |
| Emergency Contacts | Legal aid orgs, medical helplines, human rights bodies in Bangladesh |
| Crisis Checklist | 72-hour preparedness list, what to have before a shutdown |
| July 2024 — What We Learned | Factual, documented account of what happened and what worked |

- All sections available in Bangla and English with a prominent language toggle in the header
- Fully cached by service worker on first load — zero network requests after first visit
- Search within the knowledge base (client-side, no server required)
- Content rendered with proper typographic hierarchy (serif headings, sans-serif body)

### 7.4 Safe Check-in System

- User registers: display name + trusted contact phone number + check-in interval (2h, 4h, 6h, 12h)
- User must tap "I'm Safe" within their chosen interval
- If interval is missed, user is flagged as **Unresponsive** on the admin panel automatically
- Admin sees all registered check-in users and their current status on the admin panel
- Optional SMS alert to contact number via Twilio (configured via env var, mocked in demo if not configured)
- Check-in state persists in SQLite
- Registration persisted in localStorage so returning users resume their check-in
- Cancel & re-register option available

### 7.5 Missing Person Registry

- Submit form: name, age, gender, last known location, description, contact person, contact phone
- **Photo upload** via file picker — stored locally in `server/uploads/` directory
- Search by name or last known location (server-side LIKE query)
- Results displayed as cards with all submitted details and photo thumbnail
- Each entry has a status: **Missing, Found, Unverified** — each with a coloured badge
- Admin can update status via the admin panel
- Entries stored in SQLite
- When internet returns, all unsynced entries auto-sync to the remote Railway server
- Sync status tracked per entry (`synced` column)

### 7.6 Verified News Feed

- On startup (if internet available), backend fetches RSS feeds from curated trusted Bangladeshi sources:
  - Prothom Alo (RSS)
  - The Daily Star (RSS)
  - bdnews24 (RSS)
- Fetched articles stored in SQLite with full content, source, and timestamp
- Frontend reads from SQLite — works fully offline after first fetch
- Articles tagged by source, displayed in reverse chronological order
- Manual refresh button (only works when online)
- Background fetcher runs every 30 minutes while server is online

### 7.7 Offline Bangladesh Map

- Bangladesh `.pmtiles` extract served locally from the backend
- Frontend renders via MapLibre GL JS reading the local PMTiles file
- Users can drop pins on the map (missing person last location, shelter, danger zone, medical, general)
- Pins saved to SQLite, visible to all connected users
- No external tile server required — fully offline
- Map source: OpenStreetMap via ProtoMaps basemaps
- Map tiles distributed via download script (~540 MB), not committed to git
- Graceful degradation: if tiles are absent, the map shows a blank background but pins still render

### 7.8 Node Admin Panel

- Accessible via `/admin` route, protected by JWT-based password authentication
- Features:
  - Login screen with password input
  - **Broadcast** — send an emergency message to all connected users (appears as full-screen overlay with red border, dismiss button)
  - **Connected users** — view active WebSocket connection count
  - **Check-ins** — table of all registered users with status, interval, and last check-in time
  - **Missing persons** — list with status change buttons (Missing / Found / Unverified)
  - **Posts** — pin/unpin/delete any noticeboard post
  - **Dashboard quick links** — Broadcast, Check-ins, Missing Persons, Connected Users section tabs

### 7.9 Offline-First PWA

- vite-plugin-pwa with Workbox generates service worker automatically (`injectManifest` strategy)
- Caches: all static assets, all knowledge base pages, last-fetched news articles
- Installable on Android Chrome and iOS Safari via "Add to Home Screen"
- Works fully offline after first visit
- App manifest includes Mukto Mesh name, icon (192x192 + 512x512), theme colour (`#006A4E`), background colour (`#0a0a0a`), standalone display
- Custom service worker at `src/sw.ts`

### 7.10 Auto-Sync

- Background sync registered in service worker
- When connectivity is detected, queued missing person entries and map pins push to the remote Railway backend
- Sync is one-directional: local → remote (the remote server is a backup, not the source of truth during offline operation)
- Remote sync job runs every 5 minutes
- Sync status (`synced` column in SQLite) visible in admin panel

---

## 8. User Flows and Application Workflow

### 8.1 Node Operator Flow

```
Download package from GitHub
        ↓
Run `npm start` or double-click `start.bat`
        ↓
[start.bat] Install dependencies (auto)
[start.bat] Download offline map tiles if missing (auto)
        ↓
App boots on localhost:3000 (API + SPA + WebSocket)
        ↓
Share local IP (e.g. 192.168.1.5:3000) with neighbours
        ↓
Neighbours open browser → type IP → instant access
        ↓
[Internet exists] → news feed fetches and caches
[Internet cut]   → everything still works from cache + SQLite
```

### 8.2 Community Member Flow

```
Connect to node operator's WiFi hotspot
        ↓
Open browser → type node IP:3000
        ↓
Land on Dashboard → see live metrics
        ↓
Navigate to chat / noticeboard / knowledge base / map
        ↓
[Optional] Register for check-in
[Optional] Submit missing person report with photo
```

### 8.3 Check-in Flow

```
Register (name, contact, interval)
        ↓
Server confirms registration, starts timer
        ↓
Loop every [interval]:
    ┌─ Checked in → Timer resets
    └─ Missed → Flagged as "Unresponsive" in admin panel
                 SMS alert via Twilio (if configured)
        ↓
User taps "I'm Safe" → Timer resets
```

### 8.4 Missing Person Sync Flow

```
Submit missing person entry
        ↓
Saved to local SQLite, shown immediately
        ↓
Service Worker registers background sync
        ↓
[Internet available] → Push to remote Railway server
                       Mark entry as synced
[Internet unavailable] → Queue until connectivity returns
```

---

## 9. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT DEVICES                    │
│         (any phone/laptop on same WiFi)             │
│              React 19 PWA (Vite)                    │
│         Service Worker (Workbox) + Cache            │
│    Noto Serif Bengali + Noto Sans Bengali fonts     │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP + WebSocket (LAN)
┌──────────────────────▼──────────────────────────────┐
│               NODE OPERATOR'S LAPTOP                │
│                                                     │
│   Hono.js Server (Node.js 22 LTS)                  │
│   ├── REST API (posts, missing, check-in, news,     │
│   │             pins, admin, messages, status)      │
│   ├── WebSocket Server (chat, live WS events)       │
│   ├── PMTiles Server (Bangladesh map tiles)         │
│   ├── Uploads Server (missing person photos)        │
│   └── Static file server (built React app)          │
│                                                     │
│   SQLite (better-sqlite3)                           │
│   └── Single file: mukto_mesh.db                   │
│                                                     │
│   Background Jobs:                                  │
│   ├── Check-in Monitor (runs every 60s)             │
│   ├── News Fetcher (runs every 30 min)              │
│   └── Remote Sync (runs every 5 min)                │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS (when internet exists)
┌──────────────────────▼──────────────────────────────┐
│              REMOTE INFRASTRUCTURE                  │
│   Railway: Hono backend (sync endpoint only)        │
│   Vercel:  React PWA (online access)                │
│   GitHub:  Releases for download                    │
└─────────────────────────────────────────────────────┘
```

**Key architectural principle:** The remote infrastructure is optional. The entire system functions without it. Remote serves two purposes only: (1) online access for those who haven't downloaded the package, and (2) receiving synced data from local nodes when internet returns.

---

## 10. Technology Stack

### Frontend
| Layer | Choice | Reason |
|---|---|---|
| Framework | React 19 | Stable, widely supported |
| Build tool | Vite | Fast HMR, excellent PWA plugin |
| Language | TypeScript (strict mode) | Type safety throughout |
| Styling | Tailwind CSS 3 | Utility-first, fast to build |
| Design tokens | Custom OKLCH CSS custom properties (50+ tokens) | Perceptual colour, semantic naming |
| Fonts | Noto Serif Bengali + Noto Sans Bengali (Google Fonts) | Proper Bangla glyph rendering |
| Icons | lucide-react | Lightweight, consistent icon set |
| PWA | vite-plugin-pwa + Workbox (injectManifest) | Zero-config service worker, offline caching |
| Maps | MapLibre GL JS + PMTiles JS | Offline tile rendering from local PMTiles |
| State | Zustand | Lightweight, no boilerplate |
| Data fetching | TanStack Query (React Query) | Cache management, background refetching |
| Routing | react-router-dom v7 | Standard SPA routing |
| WebSocket client | Native browser WebSocket API | No library needed |

### Backend
| Layer | Choice | Reason |
|---|---|---|
| Framework | Hono.js | TypeScript-first, built-in WebSocket, lightweight |
| Runtime | Node.js 22 LTS | Stable, widely supported |
| Language | TypeScript (strict mode) | Consistent with frontend |
| Database | SQLite via better-sqlite3 | Zero setup, single file, runs anywhere |
| WebSocket | ws | Lightweight, no dependencies |
| RSS parsing | rss-parser | Lightweight, no dependencies |
| JWT | jsonwebtoken | Admin authentication |
| SMS | Twilio SDK (optional) | Check-in alerts, mocked in demo |
| PMTiles serving | Static file serve via @hono/node-server/serve-static | Serves .pmtiles with HTTP Range support |

### Infrastructure
| Layer | Choice |
|---|---|
| Frontend hosting | Vercel (free tier) |
| Backend hosting | Railway (free tier) |
| Distribution | GitHub Releases (zip package) |
| Package manager | npm |

### Tooling
| Tool | Purpose |
|---|---|
| ESLint | Linting |
| tsx | Run TypeScript directly in Node (dev mode) |
| concurrently | Run client and server together in dev |

---

## 11. Database Schema and Data Models

All tables live in a single SQLite file: `mukto_mesh.db`

### users
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- UUID
  display_name TEXT NOT NULL,
  created_at INTEGER NOT NULL    -- Unix timestamp
);
```

### messages
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  channel TEXT NOT NULL,         -- 'general' | 'emergency' | 'coordination' | 'medical'
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
```
> Messages are persisted to SQLite. On channel join, the last 50 messages are loaded.

### posts (noticeboard)
```sql
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  tag TEXT NOT NULL,             -- 'safety' | 'medical' | 'food' | 'legal' | 'news' | 'general'
  content TEXT NOT NULL,
  pinned INTEGER DEFAULT 0,      -- 0 | 1
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
```
> Posts are returned ordered by `pinned DESC, created_at DESC`.

### checkins
```sql
CREATE TABLE checkins (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  interval_hours INTEGER NOT NULL,  -- 2 | 4 | 6 | 12
  last_checkin_at INTEGER NOT NULL,
  status TEXT DEFAULT 'active',     -- 'active' | 'unresponsive'
  created_at INTEGER NOT NULL
);
```

### missing_persons
```sql
CREATE TABLE missing_persons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  last_location TEXT NOT NULL,
  description TEXT,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  photo_url TEXT,                -- local path or null (stored in server/uploads/)
  status TEXT DEFAULT 'missing', -- 'missing' | 'found' | 'unverified'
  synced INTEGER DEFAULT 0,      -- 0 | 1
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_missing_status ON missing_persons(status);
```

### news_articles
```sql
CREATE TABLE news_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  source TEXT NOT NULL,          -- 'prothomalo' | 'dailystar' | 'bdnews24'
  url TEXT NOT NULL UNIQUE,
  content TEXT,
  published_at INTEGER,
  fetched_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_news_fetched_at ON news_articles(fetched_at);
```

### map_pins
```sql
CREATE TABLE map_pins (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT NOT NULL,            -- 'shelter' | 'danger' | 'missing' | 'medical' | 'general'
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  description TEXT,
  user_id TEXT,
  synced INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL
);
```

---

## 12. API Design and Endpoints

Base URL (local): `http://[node-ip]:3000/api`
Base URL (remote): `https://[railway-url]/api`

### Public (no auth)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check — returns `{ status: 'ok', timestamp }` |
| GET | `/api/status` | Node status — connection count + check-in summary for Dashboard |

### Noticeboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/posts` | Get all posts, pinned first |
| POST | `/api/posts` | Create a new post (body: `{ display_name, user_id?, tag, content }`) |
| PATCH | `/api/posts/:id/pin` | Toggle pin (admin only) |
| DELETE | `/api/posts/:id` | Delete post (admin only) |

### Messages (chat)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/messages?channel=general` | Get last 50 messages for a channel |

### Missing Persons

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/missing` | Get all entries |
| GET | `/api/missing/search?q=` | Search by name or location |
| POST | `/api/missing` | Submit new entry (supports `multipart/form-data` with photo upload) |
| PATCH | `/api/missing/:id/status` | Update status (admin only) |

### Check-in

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/checkin/register` | Register for check-in |
| GET | `/api/checkin/lookup/:id` | Get check-in status by ID (public) |
| POST | `/api/checkin/ping` | "I'm Safe" action |
| GET | `/api/checkin/status` | Get all check-in statuses (admin only) |

### News

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/news` | Get cached articles |
| POST | `/api/news/refresh` | Trigger RSS fetch (online only) |

### Map Pins

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/pins` | Get all pins |
| POST | `/api/pins` | Add a pin |
| DELETE | `/api/pins/:id` | Delete a pin (admin only) |

### Sync (remote server only)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/sync/missing` | Bulk sync missing person entries |
| POST | `/api/sync/pins` | Bulk sync map pins |

### Admin

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | Login (body: `{ password }`) → returns JWT |
| GET | `/api/admin/connections` | Get active WebSocket connection count (admin only) |
| POST | `/api/admin/broadcast` | Send emergency broadcast to all WS clients (body: `{ message }`) |

### WebSocket (`ws://[node-ip]:3000/ws`)

| Event (client → server) | Payload | Description |
|---|---|---|
| `join` | `{ displayName, channel? }` | Join a channel (default: `general`) |
| `message` | `{ channel, content }` | Send a message |
| `switch_channel` | `{ channel }` | Switch active channel |

| Event (server → client) | Payload | Description |
|---|---|---|
| `join_ack` | `{ channel, messages[] }` | Acknowledge join, send last 50 messages |
| `message` | `{ id, displayName, channel, content, createdAt }` | New message broadcast to channel |
| `post_created` | `{ type: 'post_created', post }` | New noticeboard post (broadcast to all) |
| `post_pinned` | `{ type: 'post_pinned', id, pinned }` | Post pin toggled (broadcast to all) |
| `checkin_flagged` | `{ type: 'checkin_flagged', displayName }` | User flagged as unresponsive |
| `broadcast` | `{ type: 'broadcast', message, createdAt }` | Admin emergency broadcast |

---

## 13. Folder and Project Structure

```
mukto-mesh/
├── client/                          # React 19 + Vite frontend
│   ├── public/
│   │   ├── icons/                   # PWA icons (192x192, 512x512)
│   │   └── tiles/                   # Bangladesh PMTiles map (gitignored, ~540 MB)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Admin/
│   │   │   │   └── AdminLogin.tsx
│   │   │   ├── Chat/
│   │   │   │   ├── ChannelTab.tsx
│   │   │   │   └── MessageBubble.tsx
│   │   │   ├── CheckIn/
│   │   │   │   ├── CheckInForm.tsx
│   │   │   │   └── CheckInStatus.tsx
│   │   │   ├── Map/
│   │   │   │   ├── AddPinForm.tsx
│   │   │   │   ├── Map.css
│   │   │   │   └── PinMarker.tsx
│   │   │   ├── MissingPersons/
│   │   │   │   └── MissingPersonForm.tsx
│   │   │   ├── Noticeboard/
│   │   │   │   ├── NewPostForm.tsx
│   │   │   │   └── PostCard.tsx
│   │   │   ├── DisplayNameModal.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── InstallPrompt.tsx
│   │   │   ├── LanguageToggle.tsx
│   │   │   ├── Layout.tsx
│   │   │   ├── OfflineBadge.tsx
│   │   │   └── Toast.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # Landing page with crisis metrics
│   │   │   ├── Chat.tsx
│   │   │   ├── Noticeboard.tsx
│   │   │   ├── KnowledgeBase.tsx
│   │   │   ├── CheckIn.tsx
│   │   │   ├── MissingPersons.tsx
│   │   │   ├── News.tsx
│   │   │   ├── Map.tsx
│   │   │   └── Admin.tsx
│   │   ├── content/                 # Preloaded knowledge base content
│   │   │   ├── rights.bn.md / rights.en.md
│   │   │   ├── firstaid.bn.md / firstaid.en.md
│   │   │   ├── contacts.bn.md / contacts.en.md
│   │   │   ├── checklist.bn.md / checklist.en.md
│   │   │   └── july2024.bn.md / july2024.en.md
│   │   ├── store/                   # Zustand stores
│   │   │   ├── useAuthStore.ts
│   │   │   ├── useChatStore.ts
│   │   │   └── useLanguageStore.ts
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useOfflineStatus.ts
│   │   ├── lib/
│   │   │   ├── api.ts               # Fetch wrapper with JSON/FormData support
│   │   │   ├── config.ts            # VITE_API_URL, VITE_WS_URL
│   │   │   ├── constants.ts
│   │   │   ├── md.ts                # Markdown rendering
│   │   │   ├── utils.ts             # timeAgo, etc.
│   │   │   └── ws.tsx               # WebSocket connection manager + Zustand store
│   │   ├── styles/
│   │   │   └── tokens.css           # 50+ OKLCH design tokens
│   │   ├── App.tsx                  # Router + broadcast overlay
│   │   ├── main.tsx
│   │   ├── index.css                # Tailwind directives + base + utilities
│   │   └── sw.ts                    # Custom service worker (injectManifest)
│   ├── tailwind.config.ts           # Token mappings
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Hono.js backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.ts            # SQLite table definitions (CREATE TABLE IF NOT EXISTS)
│   │   │   ├── index.ts             # DB connection singleton + initDB
│   │   │   ├── posts.ts
│   │   │   ├── messages.ts
│   │   │   ├── checkins.ts
│   │   │   ├── missing.ts
│   │   │   ├── news.ts
│   │   │   ├── pins.ts
│   │   │   └── users.ts
│   │   ├── routes/
│   │   │   ├── posts.ts
│   │   │   ├── missing.ts
│   │   │   ├── checkin.ts
│   │   │   ├── news.ts
│   │   │   ├── pins.ts
│   │   │   ├── messages.ts
│   │   │   ├── sync.ts
│   │   │   └── admin.ts
│   │   ├── ws/
│   │   │   └── chat.ts              # WebSocket handler + broadcast helpers
│   │   ├── jobs/
│   │   │   ├── checkinMonitor.ts    # Interval checker for missed check-ins (every 60s)
│   │   │   └── newsFetcher.ts       # RSS fetch job (every 30 min)
│   │   ├── integrations/
│   │   │   ├── remoteSync.ts        # Auto-sync to remote Railway server (every 5 min)
│   │   │   └── twilio.ts            # Optional SMS via Twilio
│   │   ├── middleware/
│   │   │   └── adminAuth.ts         # JWT verification middleware
│   │   ├── config.ts
│   │   ├── logger.ts
│   │   ├── types.ts                 # WsEvent enum, ApiResponse type
│   │   └── index.ts                 # App entry point — routes, WS, jobs, static files, health
│   ├── dist/                        # Compiled JS (production)
│   ├── uploads/                     # Missing person photo uploads
│   ├── tsconfig.json
│   └── package.json
│
├── scripts/
│   ├── download-tiles.ps1           # PowerShell script to download Bangladesh PMTiles
│   └── download-tiles.sh            # Bash script to download Bangladesh PMTiles
│
├── context/
│   ├── spec.md                      # This file
│   ├── design.md                    # Design system documentation
│   └── api-contract.md              # API contract details
│
├── start.bat                        # One-click Windows launcher (auto-installs deps + downloads tiles)
├── .env.example                     # Template for environment variables
├── .gitignore
├── package.json                     # Root package.json with concurrently scripts
├── README.md                        # Setup and run instructions
└── LICENSE                          # MIT
```

---

## 14. Coding Standards and Architectural Principles

- **TypeScript strict mode** enabled in both client and server `tsconfig.json`
- **Minimize `any` types** — prefer `unknown`, proper generics, and type narrowing. Current status: 1 remaining `any` in `useWebSocket` hook (acceptable utility pattern)
- **File naming:** `PascalCase` for components, `camelCase` for utilities and hooks
- **Imports:** absolute imports via `@/` alias in both client and server
- **API responses:** always return `{ data, error }` shape — never throw raw errors to client
- **Database access:** all DB operations go through functions in `server/src/db/` — no raw SQL in route handlers
- **WebSocket events:** all event names are typed via a shared `WsEvent` enum
- **Commit discipline:** commit frequently with meaningful messages — judges review commit history
- **No squashing:** never squash commits at deadline
- **Open source licence:** MIT (as required by Track A guidelines)

### Component Design
- All interactive components enforce minimum 44px tap targets
- Focus-visible ring for keyboard navigation using OKLCH tokens
- Reduced motion support via `prefers-reduced-motion: reduce` media query
- Component utility classes (`card`, `card-hover`, `btn-primary`, `btn-ghost`, `input-field`, `section-label`, `error-state`, `empty-state`, `skeleton`) defined in `index.css`
- No inline hex or rgba values — all colours derived from OKLCH CSS variables

---

## 15. Configuration and Environment Variables

Copy `.env.example` to `.env` in `/server`.

### Server (`server/.env`)

```env
PORT=3000
NODE_ENV=development

# Admin panel password — CHANGE BEFORE PRODUCTION
ADMIN_PASSWORD=changeme

# Twilio (optional — SMS alerts for check-in; mocked if not set)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Remote sync endpoint (Railway URL after deploy)
REMOTE_SYNC_URL=https://your-railway-app.railway.app

# Database path
DB_PATH=./mukto_mesh.db
```

### Client (`client/.env.example`)

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000/ws
```

> **Production override:** On Vercel, set `VITE_API_URL` to the Railway backend URL.

---

## 16. Error Handling Strategy

- All API responses use a consistent shape:
  ```ts
  { data: T | null, error: string | null }
  ```
- Frontend uses TanStack Query error states to handle failed requests gracefully
- When offline, API calls return `{ data: null, error: 'Network error — you may be offline' }` and the UI shows cached state with an Offline badge
- WebSocket disconnections trigger automatic reconnection with exponential backoff
- SQLite errors are caught and logged server-side; a 500 response is returned with a generic error message
- Missing person photo upload failures do not block the form submission — photo is optional
- Server-level `onError` handler catches all uncaught errors and returns 500
- Uncaught exceptions and unhandled promise rejections are logged at process level

---

## 17. Authentication and Authorisation

**No user authentication.** Users enter a display name on first visit. This is stored in the browser's `localStorage`. There is no password, no account, no session token for regular users.

**Admin authorisation:**
- Admin panel at `/admin` is protected by a simple password check
- Password is set via `ADMIN_PASSWORD` env var (default: `changeme` — warning printed at startup)
- On POST to `/api/admin/login`, server returns a short-lived JWT (24h expiry)
- JWT stored in `localStorage`, sent as `Authorization: Bearer` header on admin requests
- Admin middleware on Hono validates the JWT on every admin-protected route

**Assumption:** For a 72h hackathon sprint, this is sufficient. A full RBAC system is a future enhancement.

---

## 18. State Management Approach

| State type | Solution |
|---|---|
| Server state (API data) | TanStack Query — caching, refetching, polling (10–60s intervals) |
| Global UI state (language, user name, admin status) | Zustand stores (`useAuthStore`, `useLanguageStore`) |
| Chat state (messages, unread counts, active channel) | Zustand `useChatStore`, updated by WebSocket hook |
| WebSocket connection state (status, broadcast) | Zustand store in `ws.tsx` — `useWs` |
| Form state | React `useState` — no form library needed at this scale |
| Offline/online status | `useOfflineStatus` hook wrapping `navigator.onLine` + event listeners |

---

## 19. UI/UX Guidelines and Design Principles

### Theme
- **Dark theme only** — optimised for night-time crisis use and low battery consumption on OLED screens
- **Colour palette:** OKLCH perceptual colour model with 50+ semantic tokens
  - Paper (background): `oklch(0.035 0.004 270)` — near-black
  - Surface (cards): `oklch(0.105 0.008 270)` — slightly lighter
  - Accent (Bangladesh green): `oklch(0.45 0.14 170)` — hover: `oklch(0.50 0.16 170)`, muted: `oklch(0.45 0.14 170 / 0.12)`, text: `oklch(0.75 0.14 170)`
  - Danger (Bangladesh red): `oklch(0.45 0.22 30)`
  - Success: `oklch(0.55 0.16 145)`
  - Warning: `oklch(0.65 0.15 85)`
  - Text primary: `oklch(0.93 0.006 270)`
  - Text muted: `oklch(0.55 0.018 270)`
  - Full token set: paper, paper-alt, surface, surface-hover, elevated, border, border-hover, accent, accent-hover, accent-muted, accent-text, danger, danger-hover, danger-muted, success, success-muted, warning, warning-muted, text, text-heading, text-muted, text-dim, text-inverse, focus, pin colours, tag badge colours

- **Typography:**
  - Display/headings: `Noto Serif Bengali` (serif) — weight 700
  - Body: `Noto Sans Bengali` (sans-serif) — weight 400/500/600/700
  - Mono: `JetBrains Mono` (code fragments)
  - Type scale: display (`clamp(1.625rem, 4vw, 2.5rem)`), heading (`clamp(1.125rem, 2.5vw, 1.5rem)`), subhead, body (0.875rem), small, caption, micro

- **Spacing:** 4pt scale (0.25rem increments)
- **Border radius:** sm (0.25rem), default (0.375rem), lg (0.5rem), pill (9999px)
- **Motion:** Three easings (ease-out, ease-in, ease-in-out) + three durations (fast 150ms, normal 250ms, slow 400ms). Full `prefers-reduced-motion: reduce` support globally.

### Component Utilities (defined in `index.css`)
- `card` — Standard surface card with border
- `card-hover` — Card with hover elevation effect
- `btn-primary` — Primary action button (green accent background)
- `btn-ghost` — Ghost/outline button
- `input-field` — Text input with focus ring
- `section-label` — Section heading with accent underline
- `error-state` — Error message box with muted danger background
- `empty-state` — Empty state placeholder
- `skeleton` — Skeleton loading animation

### Design Principles
- **Function over form** — every UI element serves a crisis use case
- **Large tap targets** — minimum 44px for all interactive elements (phone users in stress)
- **High contrast** — readability in poor lighting conditions
- **Language toggle** — prominent, always accessible from any page (Bangla | English)
- **Empty states** — every list has a meaningful empty state with a call to action
- **Error states** — specific, actionable, never generic "Something went wrong"
- **Offline badge** — a persistent banner when the node detects no internet, reassuring users that offline mode is intentional and everything still works
- **Skeleton loading** — Dashboard shows animated skeleton placeholders during data fetch
- **Serif for headings** — Noto Serif Bengali for all h1–h3 to establish typographic hierarchy

### Navigation
- Bottom navigation bar on mobile (6 items: Dashboard, Chat, Board, Info, People, Map) — hidden on desktop
- Sidebar on desktop (1024px+) — hidden on mobile
- Admin panel accessible via `/admin` route (button in Dashboard header)
- News accessible via Dashboard quick action (not in bottom nav)

---

## 20. Performance Considerations

- All knowledge base content is `.md` files compiled at build time — zero runtime fetch
- Bangladesh `.pmtiles` file is served as a static asset with HTTP Range support — no tile API calls
- News articles cached in SQLite — news page loads instantly from DB even offline
- Dashboard data fetched via polling with TanStack Query — UI never blocks
- Service worker pre-caches all routes on install — navigation is instant
- WebSocket connections are pooled — the server handles up to ~100 concurrent connections comfortably on a laptop
- SQLite queries use indexes on `channel`, `created_at`, `status`, and `fetched_at` columns
- Lazy-loaded page components via `React.lazy` + `Suspense` — code-split by route
- OKLCH tokens in CSS custom properties — no runtime colour computation

---

## 21. Security Considerations

- **No sensitive data collection** — the app does not ask for national ID, passwords, or location beyond what users volunteer for missing person reports
- **Admin password** — must be changed from default before deployment; enforced via a startup warning if `ADMIN_PASSWORD=changeme`
- **SQL injection** — all queries use parameterised statements via better-sqlite3 prepared statements
- **XSS** — React's default JSX escaping handles this; no `dangerouslySetInnerHTML` usage
- **CORS** — in production, backend restricts CORS to the Vercel frontend origin
- **No surveillance** — the app explicitly does not log IP addresses or track user behaviour
- **Photo uploads** — stored locally in `server/uploads/`, not transmitted to any third party

---

## 22. Logging and Monitoring

**Development:**
- Structured logger with timestamps (`[timestamp] [level] message`)
- Request logging: `[method] [path] [status] [duration]`
- SQLite query errors logged to stderr

**Production (Railway):**
- Railway's built-in log streaming is sufficient for hackathon purposes
- Log levels: `INFO`, `WARN`, `ERROR`

**No external monitoring service** — out of scope for 72h sprint.

---

## 23. Testing Strategy

Given the 72h constraint, formal testing is manual but comprehensive:

| Type | Scope | How |
|---|---|---|
| TypeScript type check | All files | `npx tsc --noEmit` — 0 errors (client + server) |
| Production build | Client | `npm run build` — Vite outputs 27 files, ~1.2 MB |
| Production build | Server | `tsc` — compiles to `dist/index.js` |
| Manual | All features, tested on real devices over LAN | Browser DevTools |
| Offline simulation | Kill WiFi, verify core features work | Browser DevTools → Network → Offline |
| WebSocket | Send messages from two browser tabs | Manual |
| PWA install | Verify install prompt on Android Chrome | Manual |
| API smoke test | Hit each endpoint via curl | Manual / curl |
| Responsive | Test at 320/375/414/768/1024px | Browser DevTools responsive mode |

**No automated unit tests in the hackathon sprint.** This is a known trade-off (see Section 27).

---

## 24. Deployment Strategy

### Local (node operator)

```bash
git clone https://github.com/HyperZx2O/mukto-mesh
cd mukto-mesh
start.bat                    # Windows — one-click launcher
# or
npm install                  # Manual
npm run dev                  # Starts both server + client
# App available at http://localhost:3000
# Share http://[your-local-ip]:3000 with neighbours
```

### Production mode (single port, built assets)

```bash
npm run build                # Builds client + server
npm start                    # Serves everything from port 3000
```

### Online (Railway + Vercel)

**Backend (Railway):**
1. Connect GitHub repo to Railway
2. Set root directory to `/server`
3. Set env vars via Railway dashboard
4. Railway auto-deploys on push to `main`

**Frontend (Vercel):**
1. Connect GitHub repo to Vercel
2. Set root directory to `/client`
3. Set `VITE_API_URL` to Railway backend URL
4. Vercel auto-deploys on push to `main`

### GitHub Release (distribution package)

After the sprint:
1. Run `npm run build` in both `/client` and `/server`
2. Bundle into a zip: server build + client build served as static files from server
3. Tag a GitHub release: `v1.0.0-july-hackathon`
4. Attach the zip — anyone downloads and runs `npm start` or `start.bat`
5. Map tiles (~540 MB) distributed separately via download scripts

---

## 25. Development Milestones

All features completed within the 72-hour sprint (July 28–30, 2026):

### Foundation
- [x] Monorepo setup, TypeScript config, concurrently dev script
- [x] Hono server with SQLite connection
- [x] React + Vite + Tailwind scaffold
- [x] PWA manifest and vite-plugin-pwa config

### Core Features
- [x] WebSocket server + chat UI (4 channels)
- [x] Noticeboard REST API + UI (6 tags, pin/delete)
- [x] Knowledge base — write all Bangla + English content (5 sections)
- [x] Knowledge base pages with search and language toggle

### Secondary Features
- [x] Check-in system backend + UI (register, ping, monitor)
- [x] Missing person registry with photo upload
- [x] News feed fetcher (3 sources) + cache + UI
- [x] Offline map (PMTiles + MapLibre GL JS)
- [x] Dashboard with live metrics and quick actions

### Polish and Ship
- [x] Admin panel (login, broadcast, connections, check-ins, missing, posts)
- [x] Auto-sync to remote Railway server
- [x] Offline badge and offline UX polish
- [x] Language toggle (Bangla / English)
- [x] OKLCH design system with 50+ tokens
- [x] Component utility classes (btn-primary, card, etc.)
- [x] Bug fixes, mobile testing at 4 breakpoints
- [x] README with full documentation
- [x] start.bat one-click launcher
- [x] Download scripts for offline map tiles

---

## 26. Future Enhancements

These were discussed but are explicitly out of scope for the hackathon sprint:

- **P2P mesh networking** — connect multiple nodes across separate WiFi networks (LoRa, Bluetooth relay)
- **Bluetooth/WiFi-Direct relay** — extend range without a central hotspot
- **End-to-end encryption** for chat messages
- **Full RBAC** — multiple admin roles, moderators
- **Offline Wikipedia** via Kiwix for Bangladesh-relevant articles
- **Single executable distribution** via pkg or Bun (zero Node.js dependency for operator)
- **Android APK** — wrap in Capacitor for native app distribution
- **Multi-language support** beyond Bangla and English
- **Satellite SMS integration** — Twilio for check-in alerts when mobile networks exist but internet doesn't
- **Damage reporting** — geotagged incident reports with photo upload
- **Federated node sync** — nodes that know about each other and can relay data when internet is intermittent
- **Sentiment analysis on broadcasts** — gauge community morale during crisis
- **Resource tracking** — log available food, water, medicine at shelter locations

---

## 27. Assumptions, Constraints, and Trade-offs

| Item | Detail |
|---|---|
| **Build window** | 72 hours: July 28 00:00 to July 30 23:59 BST |
| **Team size** | 2 members (with AI coding assistance via OpenCode) |
| **No automated unit tests** | Trade-off for speed. Manual + typecheck + build validation only. |
| **No user auth** | Display name only. Acceptable for crisis coordination context. |
| **Admin password simplicity** | JWT with single shared password. Not enterprise-grade. Acceptable for scope. |
| **LAN-only during blackout** | By design and by physics. Multiple nodes across the country is the solution, not a single national server. |
| **Node operator laptop must stay on** | Single point of failure per node. Acceptable for hackathon; future mitigation is a Raspberry Pi distribution. |
| **Bangladesh .pmtiles file size** | ~540 MB. Distributed via download script, not committed to git. App degrades gracefully without tiles (blank map, pins still work). |
| **RSS feed availability** | Bangla news RSS feeds may be unreliable. bdnews24 has known XML parsing issues. News feature degrades gracefully. |
| **Twilio SMS** | Mocked in demo. Real SMS delivery requires a funded Twilio account. |
| **Messages persisted to SQLite** | Last 50 messages per channel loaded on join. Older messages remain in DB but are not loaded by default. |
| **Photo uploads stored locally** | Missing person photos stored in `server/uploads/` directory. Not backed up remotely. |
| **OKLCH browser support** | OKLCH is supported in all modern browsers (2024+). Falls back gracefully on older browsers via Tailwind's color system. |
| **No shadcn/ui** | Decided against it. Custom component utilities (btn-primary, card, etc.) are lighter and more consistent with the OKLCH design system. |
| **Commit history** | Both team members committed throughout the sprint. Judges audit this. |
| **Open source licence** | MIT, as required by Track A guidelines. |

---

## 28. Reference Repositories

| Feature | Reference Repo |
|---|---|
| Project architecture inspiration | [Crosstalk-Solutions/project-nomad](https://github.com/Crosstalk-Solutions/project-nomad) — Node for Offline Media, Archives, and Data |
| LAN WebSocket chat | [yutakusuno/bun-hono-react-websocket](https://github.com/yutakusuno/bun-hono-react-websocket) |
| Offline PWA boilerplate | [adueck/vite-offline-pwa-boilerplate](https://github.com/adueck/vite-offline-pwa-boilerplate) |
| Community noticeboard | [barrygilreath3/community-bulletin-board](https://github.com/barrygilreath3/community-bulletin-board) |
| Preloaded offline content structure | [Crosstalk-Solutions/project-nomad](https://github.com/Crosstalk-Solutions/project-nomad) |
| Dead man's switch / check-in | [circa10a/dead-mans-switch](https://github.com/circa10a/dead-mans-switch) |
| Missing person registry | [YeabTilahun/Missing-Person-Registration-and-Searching](https://github.com/YeabTilahun/Missing-Person-Registration-and-Searching) |
| PMTiles spec and JS client | [protomaps/PMTiles](https://github.com/protomaps/PMTiles) |
| Bangladesh tile extraction | [protomaps/go-pmtiles](https://github.com/protomaps/go-pmtiles) |
| RSS feed aggregation | [FreshRSS/FreshRSS](https://github.com/FreshRSS/FreshRSS) |
| PWA offline plugin | [vite-pwa/vite-plugin-pwa](https://github.com/vite-pwa/vite-plugin-pwa) |

---

*Document maintained by the Mukto Mesh team. Last updated: July 28, 2026.*
*This file is the single source of truth. All implementation decisions should be reflected here.*
