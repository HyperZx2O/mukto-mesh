# Mukto Mesh

> **Stay connected when they cut the cord.**

A lightweight, offline-first community hub for crisis coordination during internet shutdowns. Spin it up on any laptop — your neighbourhood stays connected even when the internet is gone.

**Built for the [July Hackathon 2026](https://hackathon2026.jrabd.org) — Track A: Crisis Tech**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Design System](#design-system)
- [Reference Project](#reference-project)
- [Credits](#credits)
- [Licence](#licence)

---

## Overview

In July 2024, the Bangladesh government shut down the internet for days. People couldn't find missing family members. Volunteers couldn't reach the injured. Rumors filled the gap that information left behind.

Mukto Mesh is built for the next time it happens. It turns any laptop into a local crisis coordination node — no internet, no cloud, no technical expertise required. Anyone on the same WiFi can connect, chat, post alerts, check in, search for missing people, view a knowledge base, and browse an offline map — all without a single byte leaving the local network.

**Key differentiators:**
- **Zero cloud dependency** — The entire app runs locally. The remote server is optional backup.
- **One command to start** — `npm start` boots everything: server + database + PWA serving.
- **Hyper-local by design** — One laptop per neighbourhood. Not a national platform.
- **Bangladesh-specific** — Bangla + English UI, Bangladesh map, curated crisis content.
- **Built in 72 hours** for the July Hackathon 2026.

---

## Features

| Feature | Description |
|---|---|
| **Real-time Chat** | WebSocket-based LAN chat with 4 channels (General, Emergency, Coordination, Medical). Unread badges. Emergency channel with red accent. |
| **Community Noticeboard** | Tagged posts (Safety, Medical, Food, Legal, News, General). Admin pin/delete. Real-time WebSocket push. |
| **Knowledge Base** | 8 sections bilingual (Bangla + English): About Mukto Mesh, Quick Start Guide, Running a Node, Your Rights, First Aid, Emergency Contacts, Crisis Checklist, July 2024 Report. Bundled at build time — zero network requests. Searchable. |
| **Safe Check-in** | Register with name + phone + interval. Tap "I'm Safe" before deadline. Auto-flagged as unresponsive on missed interval. Admin overview. Optional SMS via Twilio. |
| **Missing Person Registry** | Submit name, age, location, photo. Search by name/location. Admin status management (missing/found/unverified). Auto-syncs to remote when internet returns. |
| **Verified News Feed** | RSS from Prothom Alo, The Daily Star, bdnews24. Cached in SQLite for offline reading. Manual refresh button. |
| **Offline Map** | Bangladesh PMTiles served locally. Rendered via MapLibre GL JS. 5 pin types (Shelter, Danger, Missing, Medical, General). Fully offline — no tile server needed. |
| **Admin Panel** | Password-protected. View connected users, check-in statuses, manage posts, broadcast emergency messages, update missing person status, view sync status. |
| **PWA** | Installable on Android + iOS. Full offline support via service worker. Background Sync API for queued data. |
| **Auto-Sync** | Missing persons and map pins sync to remote server when connectivity returns. One-directional (local → remote). Sync status visible in admin panel. |

---

## Tech Stack

### Frontend
| Layer | Choice |
|---|---|
| Framework | React 19 |
| Build tool | Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3 + custom OKLCH design tokens |
| State | Zustand |
| Data fetching | TanStack Query |
| Maps | MapLibre GL JS + PMTiles |
| PWA | vite-plugin-pwa + Workbox |
| Icons | lucide-react |
| Fonts | Noto Sans Bengali + Noto Serif Bengali (Google Fonts) |

### Backend
| Layer | Choice |
|---|---|
| Framework | Hono.js |
| Runtime | Node.js 22 LTS |
| Language | TypeScript |
| Database | SQLite via better-sqlite3 |
| WebSocket | ws |
| RSS | rss-parser |
| SMS | Twilio SDK (optional, mocked when unconfigured) |

### Infrastructure
| Service | Purpose |
|---|---|
| Vercel | Frontend hosting (online mode) |
| Railway | Backend hosting + sync endpoint (online mode) |
| GitHub Releases | Distribution package download |

---

## Quick Start

### Prerequisites
- Node.js 22 LTS
- npm

### One-click start (Windows)

Double-click `start.bat` — it installs dependencies, downloads the offline map tiles if missing (540 MB), and starts both server and client automatically.

```
mukto-mesh/
├── start.bat        # ← Just double-click this
├── scripts/
│   ├── download-tiles.ps1   # PowerShell (called by start.bat)
│   └── download-tiles.sh    # Bash (for Linux/Mac)
```

> **Note:** The offline map tile download is ~540 MB and may take a few minutes on first run. The app works without the tiles — only the map background will be blank.

### Manual start

```bash
# Clone and enter the project
git clone https://github.com/your-team/mukto-mesh
cd mukto-mesh

# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Set up environment (optional — defaults work for local use)
cp .env.example server/.env

# Start in development mode
npm run dev
```

- **Server** → http://localhost:3000 (API + WebSocket + static files)
- **Client** → http://localhost:5173 (Vite dev server with HMR)

### Production mode (serve everything from one port)

```bash
npm run build
npm start
```

Open http://localhost:3000 — share http://[your-local-ip]:3000 with anyone on the same WiFi.

---

## Project Structure

```
mukto-mesh/
├── client/                     # React 19 + Vite frontend
│   ├── public/
│   │   ├── icons/              # PWA icons
│   │   └── tiles/              # Bangladesh PMTiles map
│   ├── src/
│   │   ├── components/         # Chat, Noticeboard, Map, CheckIn, etc.
│   │   ├── pages/              # Dashboard, Chat, Noticeboard, KnowledgeBase, etc.
│   │   ├── content/            # Preloaded bilingual knowledge base (.md)
│   │   ├── store/              # Zustand stores (auth, chat, language)
│   │   ├── hooks/              # useWebSocket, useOfflineStatus
│   │   ├── lib/                # API client, utils, config
│   │   └── styles/             # tokens.css (OKLCH design tokens)
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
├── server/                     # Hono.js backend
│   ├── src/
│   │   ├── db/                 # SQLite schema + queries
│   │   ├── routes/             # API route handlers
│   │   ├── ws/                 # WebSocket chat handler
│   │   ├── jobs/               # Check-in monitor, news fetcher, remote sync
│   │   ├── middleware/         # Admin JWT auth
│   │   └── index.ts            # Entry point
│   └── package.json
│
├── context/                    # Spec + design docs
├── start.bat                   # One-click Windows launcher
└── package.json                # Root with concurrently scripts
```

---

## Design System

The frontend uses a **custom dark theme** purpose-built for crisis contexts:

- **OKLCH colour palette** — Perceptual colour model with semantic tokens (paper, surface, accent, danger, success, warning)
- **Font pairing** — Noto Serif Bengali (display/serif for headings) + Noto Sans Bengali (body/sans for content)
- **Typographic hierarchy** — Three-tier type scale (display/heading, body, caption) with tailored letter-spacing
- **4pt spacing scale** — Consistent rhythm across all components
- **Motion tokens** — Three easings + three durations, with `prefers-reduced-motion: reduce` support
- **Component utilities** — `card`, `card-hover`, `btn-primary`, `btn-ghost`, `input-field`, `section-label`, `error-state`, `empty-state`
- **Minimum 44px tap targets** — Globally enforced for all interactive elements
- **Focus-visible ring** — Custom OKLCH focus indicator for keyboard navigation

All colours and sizes are defined as CSS custom properties in `client/src/styles/tokens.css` and consumed via Tailwind `theme.extend` mappings.

---

## Reference Project

This project takes inspiration from **[Project N.O.M.A.D.](https://github.com/Crosstalk-Solutions/project-nomad)** (Node for Offline Media, Archives, and Data) by Crosstalk Solutions.

### What Project N.O.M.A.D. does

Project N.O.M.A.D. is a self-contained offline knowledge server that runs on Debian-based systems via Docker. It includes:
- An AI chat assistant with local LLM (Ollama) and RAG (Qdrant)
- Offline Wikipedia, medical references, and ebooks via Kiwix
- Khan Academy courses with progress tracking via Kolibri
- Downloadable regional maps via ProtoMaps
- A one-click app catalogue ("Supply Depot") with custom Docker containers
- A system benchmark with community leaderboard

### How Mukto Mesh differs

| Aspect | Project N.O.M.A.D. | Mukto Mesh |
|---|---|---|
| **Target use case** | General offline knowledge & education | Crisis coordination during internet shutdowns |
| **Geographic focus** | Global | Bangladesh-specific |
| **Deployment** | Docker on Debian (sudo required) | `npm start` on any OS (no Docker) |
| **Infrastructure** | Heavy — Docker Compose, multiple containers | Lightweight — single Node.js process + SQLite |
| **AI / LLM** | Built-in (Ollama + Qdrant) | None (out of scope for hackathon) |
| **Offline content** | Wikipedia, Khan Academy, medical refs | Crisis-specific: rights, first aid, check-in, missing persons |
| **Real-time comms** | Not a focus | WebSocket chat + emergency broadcast |
| **Map** | Downloadable regional maps | Single offline Bangladesh extract (PMTiles) |
| **Authentication** | None | Admin JWT for panel access |
| **Hardware requirements** | 4GB RAM minimum, GPU recommended for AI | Any laptop with Node.js |
| **Language** | English-only | Bangla + English bilingual |

**In short:** N.O.M.A.D. is a general-purpose survival computer for anyone, anywhere. Mukto Mesh is a targeted crisis tool for Bangladeshi communities — lighter, faster, and focused on real-time coordination when the internet is cut.

---

## Credits

- **Built by:** The Mukto Mesh team for the July Hackathon 2026
- **Coding assistance:** This project was developed with the help of [OpenCode](https://opencode.com) (powered by Claude and DeepSeek models) for code generation, debugging, and design refinement
- **Reference:** [Project N.O.M.A.D.](https://github.com/Crosstalk-Solutions/project-nomad) by Crosstalk Solutions — an offline knowledge server that inspired the architecture of Mukto Mesh
- **Inspiration:** Jogajog — the decentralised communication network students used during the internet shutdowns of the July 2024 Revolution in Bangladesh
- **Map data:** OpenStreetMap contributors via ProtoMaps basemaps
- **News sources:** Prothom Alo, The Daily Star, bdnews24

---

## Licence

MIT
