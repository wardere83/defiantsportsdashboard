# Defiant Sports World Cup 2026 Dashboard

Interactive Defiant Sports dashboard for FIFA World Cup 2026 fan stewardship, host-city operations, grants, business exposure, transportation advisories, safety protocols, cultural partnerships, youth programming, and live source tracking.

## What this package includes

- `public/index.html`: the BulleCloud-style dashboard interface.
- `public/assets/defiant-sports-logo.jpeg`: Defiant Sports logo.
- `server.js`: Node/Express server for static hosting and live API endpoints.
- `/api/live-feeds`: checks verified FIFA and travel-health endpoints in real time.
- `/api/grant-feeds`: checks open or ongoing grant/program endpoints in real time.
- `docs/`: deployment and source notes.

## Local setup

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Development mode

```bash
npm run dev
```

## GitHub upload

1. Create a new GitHub repository.
2. Upload the contents of this folder, not the ZIP file itself.
3. Commit the files to `main`.
4. Deploy to a Node-capable host, or connect the repo to a platform that can run `npm install` and `npm start`.

## HostGator note

For full live functionality, the app needs Node.js enabled because the dashboard calls `/api/live-feeds` and `/api/grant-feeds`. If your HostGator plan only supports static file hosting, the dashboard UI will load, but live endpoint checks will show unavailable until a Node app or external API service is connected.

## Domains

Primary domain target:

```text
defiantsports.io
```

Pointing/mirror domain:

```text
defiantsports.com
```

Configure both domains in your hosting control panel to route to the same Node app or reverse proxy.

## Live-data policy

The app does not use mock live-feed data. If a verified endpoint is unreachable, blocked, or returns an error, the dashboard reports that state instead of inventing data.
