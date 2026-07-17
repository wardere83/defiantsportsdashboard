# Deployment Guide

## Recommended setup

Use GitHub as the source of truth and connect the repository to a Node.js
deployment platform. The app requires Node 20+ because `server.js` powers
the live API endpoints used by the dashboard.

## Build / start commands

```bash
npm install
npm start
```

Default port: `3000`. Most hosts inject a `PORT` environment variable, the server reads it automatically.

Optional configuration:

| Env var         | Default     | Notes                                       |
| --------------- | ----------- | ------------------------------------------- |
| `PORT`          | `3000`      | Listening port.                             |
| `CACHE_TTL_MS`  | `300000`    | TTL for live + grant feed caches (5 min).   |

## Repository structure

```text
/
  package.json
  package-lock.json
  server.js
  README.md
  DEPLOYMENT.md
  index.html                       # static preview copy
  assets/defiant-sports-logo.png  # source logo (white mark on transparent background)
  docs/
    LIVE_SOURCES.md
  public/
    index.html                     # served by Express
    assets/
      defiant-sports-logo.png     # mirrored for /public-rooted requests
```

## Deploying from GitHub

Connect the repo to any Node-capable host and use:

```text
Build command: npm install
Start command: npm start
```

The platform exposes the app on its assigned port; the server reads
`process.env.PORT` automatically.

## API surface

Once deployed, the dashboard hits these endpoints from the browser:

- `GET /api/health`, heartbeat, version, uptime, cache status.
- `GET /api/host-cities`, verified 16-city register.
- `GET /api/impact`, computed impact metrics.
- `GET /api/live-feeds`, real-time FIFA + CDC source check.
- `GET /api/grant-feeds`, real-time grant and program endpoint check.

Smoke-test after deploy:

```bash
curl https://your-host/api/health
curl https://your-host/api/impact
curl https://your-host/api/live-feeds | head -200
```

## Domain mapping

```text
defiantsports.io       (primary)
defiantsports.com      (mirror)
```

Use your platform’s custom-domain instructions, then update DNS records
where your domains are managed.

## Static-only hosting limitation

GitHub Pages cannot run `server.js`. The dashboard page will still display
(and the static UI is fully functional in degraded "static" mode), but the
live API sections will report "unavailable" because the `/api/*` routes
won't exist.

For a static-only deployment, move the API endpoints to a serverless
backend (Cloudflare Workers, Vercel Functions, AWS Lambda) and update the
`fetch()` URLs in `public/index.html` to point at it.
