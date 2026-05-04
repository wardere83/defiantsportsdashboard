# Defiant Sports, World Cup 2026 Operations Dashboard

Apple-style operations dashboard for FIFA World Cup 2026 with a sticky
sidebar/topbar and a scrollable canvas. Built for host-city stewardship:
live FIFA + CDC source streaming, 16-city interactive map, host-venue
register, stadium intelligence, transit advisories, safety and fan
stewardship, youth pipeline, bracket framework, and a venture-grade
Impact view.

## Highlights

- **Sticky shell, scrollable canvas**, the sidebar and topbar stay
  pinned while the main canvas scrolls vertically, so every map detail
  and section below the fold is reachable on any viewport.
- **FIFA World Cup 2026 Countdown KPI**, live-ticking countdown
  (Days · HH:MM:SS) to the opening match (Estadio Azteca, Mexico City,
  Jun 11, 2026 · 12:00 CDMX / 18:00 UTC). Auto-switches to "Day N / 39"
  while the tournament is in progress and "Concluded" after the Final
  (Jul 19, 2026 · MetLife · NY/NJ).
- **Live FIFA Source Stream** (on the Overview), black broadcast-style
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
- **Translation across 11 languages**, topbar dropdown and a dedicated
  **Translate** tab (with flag-card buttons) translate the whole
  dashboard via the `googtrans` cookie + reload flow. Supported:
  English 🇺🇸, Español 🇪🇸, Français 🇫🇷, Português 🇵🇹, العربية 🇸🇦,
  ትግርኛ 🇪🇷, Soomaali 🇸🇴, 繁體中文 🇹🇼, 한국어 🇰🇷, Tiếng Việt 🇻🇳,
  Tagalog 🇵🇭. Every translation-engine UI artifact (banner, balloon,
  tooltip, attribution) is buried via CSS so the dashboard chrome
  stays clean.
- **Venues view**, every host venue rendered as an aligned compact
  card grid (city, country, venue name, capacity). Click a card to
  focus that city on the overview map.
- **Interactive stadium register**, search across city/country/venue,
  sort any column, click a row to focus that city on the overview map.
- **Headline strip**, five rotating tabs above the live FIFA card,
  each with its own colour stripe, that pop a new headline every ~7
  seconds: **Black Wall Street** (Greenwood / Tulsa facts),
  **Founders' Wisdom** (Madam C.J. Walker, Booker T. Washington,
  Marcus Garvey, Frederick Douglass), **Modern Mavericks** (Jay-Z,
  Nipsey Hussle, Daymond John, Robert F. Smith, Killer Mike),
  **Milestones** (Reginald F. Lewis, BET, Tyler Perry Studios, Fenty
  Beauty, FUBU), and **Marathon Mindset** (cultural stewardship
  cues). Curated context that ties the dashboard to the broader
  legacy of Black entrepreneurship in America.
- **Branding**, dedicated tab pitching brand partnerships with the
  Defiant Sports athlete roster: hero quote, "why athlete branding
  works" 6-card grid, "what Defiant Sports brings" 6-card grid, a
  movement section calling out social / systemic / industry change,
  three partnership lanes (Spotlight, Movement, Legacy), and a CTA
  block linking to Defiant Sports + The Defiant Foundation +
  partnerships email.
- **Marathon Clothing**, dedicated tab for the Crenshaw apparel brand:
  hero quote ("The Marathon Continues"), brand story, Nipsey hero
  image, an inline looping Nipsey music video on the side rail, and
  a Marathon Quotes rotator.
- **Bracket card**, group-stage cards, knockout overview, and host-city
  list with confirmed semi-final / 3rd-place / final venues.
- **URL-aware routing**, every tab is reflected in `location.hash`
  (e.g., `/#live`, `/#youth`). Refreshing keeps you on the same view,
  links are shareable, and the browser back/forward walk the tabs you
  visited.
- **Apple-style aesthetic**, Inter + JetBrains Mono, restrained green
  accents on a black-and-white base, subtle elevation, hover lift,
  keyboard shortcuts, toast feedback, modal city briefs.
- **Overview map**, Leaflet + Carto light tiles with custom markers
  and a selected-state ring (kept on the Overview view).

## What this package includes

- `index.html`, root copy of the dashboard for static GitHub Pages preview.
- `public/index.html`, production copy served by the Express app.
- `assets/defiant-sports-logo.jpeg`, Defiant Sports logo (also mirrored
  to `public/assets/` so the Express server resolves it the same way).
- `server.js`, Node/Express server hosting static files plus the live
  API endpoints.
- `DEPLOYMENT.md`, deployment guide (env vars, build/start, API surface).
- `LIVE_SOURCES.md` and `docs/LIVE_SOURCES.md`, verified live source register.

## API endpoints

| Endpoint               | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| `GET /api/health`      | Service heartbeat with version, uptime, and cache status.         |
| `GET /api/host-cities` | Verified register of all 16 host cities and stadium metadata.     |
| `GET /api/impact`      | Computed impact metrics, fan reach, total seats, matches, etc.   |
| `GET /api/live-feeds`  | Real-time check of verified FIFA + CDC source endpoints.          |
| `GET /api/grant-feeds` | Real-time check of verified grant and program endpoints.          |

All live endpoints are cached server-side (default TTL 5 minutes,
configurable via `CACHE_TTL_MS`). The dashboard never fabricates live
data, when an endpoint is unreachable the UI reports it explicitly.

## Responsive layout

The dashboard ships with breakpoints calibrated for every common viewport.
No horizontal scroll, no clipped tabs, touch-friendly targets on phones.

| Width             | Layout                                                                                |
| ----------------- | ------------------------------------------------------------------------------------- |
| `> 1280px`        | Full desktop. 5-up headline strip, 4-up news panels, 6-up Pogba strip, side-by-side overview map and rail. |
| `1100 to 1280px`  | Compact desktop. Headline-tab font tightens, Pogba tiles cap at 180px.                |
| `980 to 1100px`   | iPad-landscape. Overview stacks (KPI, Live, Map, Rail), news panels go 2-up.          |
| `720 to 980px`    | iPad-portrait. Sidebar collapses to a horizontal scroll-strip, all grids drop to 1-up except the headline strip (2-up). Touch targets bumped to ≥36px. |
| `560 to 720px`    | Large phones. Marathon grid stacks, Pogba goes 2-up.                                  |
| `420 to 560px`    | Small phones. Headline strip goes 1-up, language picker 1-up, marathon hero shrinks.  |
| `≤ 420px`         | Pocket. Topbar title and actions stack on their own rows, Pogba strip 1-up at 16:9.   |

Touch devices automatically lose the hover-lift micro-interaction (so the
tap doesn't feel laggy) and gain a subtle tap-highlight color.

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
| `2`   | Branding          |
| `3`   | Venues            |
| `4`   | Stadiums          |
| `5`   | Transport         |
| `6`   | Safety            |
| `7`   | Pogba Academy     |
| `8`   | Bracket           |
| `9`   | Marathon Clothing |
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
