# Defiant Sports — World Cup 2026 Operations Dashboard

Apple-style operations dashboard for FIFA World Cup 2026 with a sticky
sidebar/topbar and a scrollable canvas. Built for host-city stewardship:
live FIFA + CDC source streaming, 16-city interactive map, host-venue
register, stadium intelligence, transit advisories, safety and fan
stewardship, youth pipeline, bracket framework, and a venture-grade
Impact view.

## Highlights

- **Sticky shell, scrollable canvas** — the sidebar and topbar stay
  pinned while the main canvas scrolls vertically, so every map detail
  and section below the fold is reachable on any viewport.
- **FIFA World Cup 2026 Countdown KPI** — live-ticking countdown
  (Days · HH:MM:SS) to the opening match (Estadio Azteca, Mexico City,
  Jun 11, 2026 · 12:00 CDMX / 18:00 UTC). Auto-switches to "Day N / 39"
  while the tournament is in progress and "Concluded" after the Final
  (Jul 19, 2026 · MetLife · NY/NJ).
- **Live FIFA Source Stream** (on the Overview) — black broadcast-style
  card with an animated marquee of factual FIFA 2026 headlines (Defiant
  Sports logo inlined every 4th item) plus four lower-third **news
  panels** that pop in and out CNBC/BBC/CNN-style: **FIFA Fixtures**
  (rotating upcoming match dates and venues), **FIFA Teams** (host +
  spotlight team intelligence), **Tournament Facts** (largest-WC-ever
  framing facts), **US Travel** (ESTA / B-2 / CDC / CBP advisories for
  inbound visitors). Each panel rotates every ~5 seconds with a staggered
  pop-in animation. Fallback content is factual; never fabricated.
- **Donate button** in the topbar links to the Defiant Foundation
  donation page (`thedefiantfoundation.org/donate`).
- **Translate dropdown** drives a hidden Google Translate widget so the
  whole page is translated to ES / FR / PT / AR with a single click.
- **Venues view** — every host venue rendered as an aligned compact
  card grid (city, country, venue name, capacity). Click a card to
  focus that city on the overview map.
- **Interactive stadium register** — search across city/country/venue,
  sort any column, click a row to focus that city on the overview map.
- **Animated KPIs** — count-up on render, including the **Impact**
  metric (projected fan reach across the tournament).
- **Marathon Clothing** — dedicated tab for the Crenshaw apparel brand:
  hero quote ("The Marathon Continues"), founders panel (Nipsey Hussle,
  Blacc Sam, Steve Carless), interactive drop tiles linking to
  themarathonclothing.com, an inline Nipsey music video on the side
  rail, and a 6-second pop-in quote rotator.
- **Bracket card** — group-stage cards, knockout overview, and host-city
  list with confirmed semi-final / 3rd-place / final venues.
- **URL-aware routing** — every tab is reflected in `location.hash`
  (e.g., `/#live`, `/#youth`). Refreshing keeps you on the same view,
  links are shareable, and the browser back/forward walk the tabs you
  visited.
- **Apple-style aesthetic** — Inter + JetBrains Mono, restrained green
  accents on a black-and-white base, subtle elevation, hover lift,
  keyboard shortcuts, toast feedback, modal city briefs.
- **Overview map** — Leaflet + Carto light tiles with custom markers
  and a selected-state ring (kept on the Overview view).

## What this package includes

- `index.html` — root copy of the dashboard for static GitHub Pages preview.
- `public/index.html` — production copy served by the Express app.
- `assets/defiant-sports-logo.jpeg` — Defiant Sports logo (also mirrored
  to `public/assets/` so the Express server resolves it the same way).
- `server.js` — Node/Express server hosting static files plus the live
  API endpoints.
- `DEPLOYMENT.md` — deployment guide (env vars, build/start, API surface).
- `LIVE_SOURCES.md` and `docs/LIVE_SOURCES.md` — verified live source register.

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

Aligned with the visible sidebar tabs.

| Key   | View              |
| ----- | ----------------- |
| `1`   | Overview          |
| `2`   | Venues            |
| `3`   | Stadiums          |
| `4`   | Transport         |
| `5`   | Safety            |
| `6`   | Pogba Academy     |
| `7`   | Bracket           |
| `8`   | Marathon Clothing |
| `Esc` | Close modal       |

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
