# Deployment Guide

## Node host deployment

Use a Node.js runtime with Node 20 or newer.

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

## HostGator Node.js deployment

If your HostGator/cPanel account has Setup Node.js App:

1. Upload the project files into the application folder.
2. Set the application root to that folder.
3. Set application startup file to:

```text
server.js
```

4. Run dependency installation:

```bash
npm install
```

5. Start or restart the Node app.
6. Map `defiantsports.io` and `defiantsports.com` to the app.

## Static-only hosting limitation

GitHub Pages and basic File Manager static hosting cannot run `server.js`. The dashboard page will still display, but live API sections require a Node service.

For static-only hosting, use the earlier standalone `index.html` package and connect `/api/live-feeds` plus `/api/grant-feeds` through another backend service.
