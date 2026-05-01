# Defiant Sports — World Cup 2026 Operations Dashboard

Single-viewport, Apple-style operations dashboard for FIFA World Cup 2026.
Built for host-city stewardship: live FIFA + CDC source streaming, 16-city
interactive map, stadium intelligence, grants and funding, transit advisories,
safety and language access, cultural programming, youth pipeline, bracket
framework, and a venture-grade Impact view.

## Highlights

- **Single-viewport shell** that fits every section in one screen on
  desktop, tablet, and mobile (no outer scroll; long lists scroll inside
  their own cards).
- **Live FIFA 2026 stream** — animated source ticker, per-source latency
  cells, pulsing live indicator, and a dedicated **Live FIFA** tab with
  verified-source status and headlines table.
- **Interactive stadium register** — search across city/venue/role, sort
  any column, click a row to focus that city on the map.
- **Animated KPIs** — count-up on render, including the new **Impact**
  metric (projected fan reach across the tournament).
- **Apple-style aesthetic** — Inter + JetBrains Mono, restrained green
  accents on a black-and-white base, subtle elevation, hover lift,
  keyboard shortcuts (`1`–`9`), toast feedback, modal city briefs.
- **Map** — Leaflet + Carto light tiles with custom markers and a
  selected-state ring.

## What this package includes

- `index.html` — root copy of the dashboard for static GitHub Pages preview.
- `public/index.html` — production copy served by the Express app.
- `public/assets/defiant-sports-logo.jpeg` — Defiant Sports logo (mirrored
  from `assets/` so the Express server resolves it cleanly).
- `server.js` — Node/Express server hosting static files plus the live
  API endpoints.
- `docs/` — deployment notes and the live source register.

## API endpoints

| Endpoint               | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `GET /api/health`      | Service heartbeat with version, uptime, and cache status.         |
| `GET /api/host-cities` | Verified register of all 16 host cities and stadium metadata.     |
| `GET /api/impact`      | Computed impact metrics — fan reach, total seats, matches, etc.   |
| `GET /api/live-feeds`  | Real-time check of verified FIFA + CDC source endpoints.          |
| `GET /api/grant-feeds` | Real-time check of verified grant and program endpoints.          |

All live endpoints are cached server-side (default TTL 5 minutes,
configurable via `CACHE_TTL_MS`). The dashboard never fabricates live
data — when an endpoint is unreachable the UI reports it explicitly.

## Local setup

```bash
npm install
npm start
```

Then open <http://localhost:3000>.

## Development mode

```bash
npm run dev   # node --watch
npm run check # node --check (syntax)
```

## Keyboard shortcuts

| Key   | View        |
| ----- | ----------- |
| `1`   | Overview    |
| `2`   | Live FIFA   |
| `3`   | Host Map    |
| `4`   | Stadiums    |
| `5`   | Grants      |
| `6`   | Business    |
| `7`   | Transport   |
| `8`   | Safety      |
| `9`   | Marathon    |
| `0`   | Youth       |
| `Esc` | Close modal |

## Deployment

For full functionality the app needs a Node runtime (Render, Railway,
Fly.io, DigitalOcean App Platform, or a VPS). GitHub Pages can serve
`public/index.html` for visual review but cannot run the live API
endpoints.

See `DEPLOYMENT.md` and `docs/LIVE_SOURCES.md` for details.

## Domains

```text
defiantsports.io       (primary)
defiantsports.com      (mirror)
```

Configure both domains at your DNS provider or deployment platform to
route to the same Node app.

## Live-data policy

The app does not use mock live-feed data. If a verified endpoint is
unreachable, blocked, or returns an error, the dashboard reports that
state instead of inventing data.
