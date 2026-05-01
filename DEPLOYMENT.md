# GitHub Deployment Guide

## Recommended setup

Use GitHub as the source repository, then connect the repository to a Node.js deployment platform.

The app requires Node 20 or newer because `server.js` powers the live endpoints used by the dashboard.

## Commands

Build/start commands:

```bash
npm install
npm start
```

Default port:

```text
3000
```

Most hosts inject a `PORT` environment variable. The server automatically uses it.

## GitHub repository setup

1. Create a GitHub repository.
2. Upload all project files into the repository root.
3. Confirm this structure:

```text
/
  package.json
  package-lock.json
  server.js
  README.md
  docs/
    DEPLOYMENT.md
    LIVE_SOURCES.md
  public/
    index.html
    assets/
      defiant-sports-logo.jpeg
```

4. Commit and push to `main`.

## Deploying from GitHub

Connect the GitHub repo to a Node-capable platform and use:

```text
Build command: npm install
Start command: npm start
```

The platform should expose the app on its assigned `PORT`; the included server reads `process.env.PORT` automatically.

## Domain mapping

Point these domains to the deployed Node app:

```text
defiantsports.io
defiantsports.com
```

Use your deployment platform’s custom-domain instructions, then update DNS records where your domains are managed.

## Static-only hosting limitation

GitHub Pages cannot run `server.js`. The dashboard page will still display, but live API sections require a Node service.

For static-only GitHub Pages, you would need to move `/api/live-feeds` and `/api/grant-feeds` to a separate backend or serverless service and update the dashboard to call that service.
