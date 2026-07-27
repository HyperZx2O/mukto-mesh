# Mukto Mesh

> Stay connected when they cut the cord.

A lightweight, offline-first community hub for crisis coordination. Spin it up on any laptop — your neighbourhood stays connected even when the internet is gone.

Built for the July Hackathon 2026. Inspired by Jogajog and the internet shutdowns of the July 2024 Revolution.

---

## Quick Start

### Prerequisites
- Node.js 22 LTS
- npm

### Run locally

```bash
git clone https://github.com/your-team/mukto-mesh
cd mukto-mesh
npm install
cp .env.example server/.env   # fill in values
npm run dev
```

- Server: http://localhost:3000
- Client: http://localhost:5173

### Run as a node (offline use)

```bash
npm run build
npm start
```

Open `http://localhost:3000` in your browser.
Share `http://[your-local-ip]:3000` with anyone on the same WiFi.

---

## Stack

React 19, Vite, Tailwind, shadcn/ui, Hono.js, SQLite, WebSockets, Node.js 22 LTS — offline-first PWA, spins up with one command.

---

## Licence

MIT
