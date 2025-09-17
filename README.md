# Coinbase Project

A small demo project that proxies Coinbase Pro WebSocket messages to connected browser clients. It consists of a TypeScript Node server that connects to the Coinbase WebSocket feed and a React (TypeScript) client that subscribes to server updates.

## Project language and stacks
- Server: TypeScript (Node.js) using Express and `ws` for WebSocket handling.
- Client: TypeScript React (Create React App) using the browser WebSocket API.

## Repository layout

Top-level folders:
- `server/` — TypeScript Node server and WebSocket handlers.
- `client/` — React TypeScript frontend.

Important files (high-level):

- `server/src/index.ts` — Server entry. Creates an HTTP server + WebSocket.Server, starts the Coinbase feed handler and wires client connections to `handleClientConnection`.
- `server/src/websocket/coinbaseHandler.ts` — Connects to Coinbase Pro WebSocket feed, handles `open`, `message`, `error`, and `close` events. Exposes `subscribeToProduct` and `unsubscribeFromProduct` helpers used by client handlers. It also automatically reconnects after the connection closes.
- `server/src/websocket/clientHandler.ts` — Manages incoming WebSocket client connections from the browser. Handles JSON messages from clients with `action: 'subscribe'|'unsubscribe'` and a `product_id` (e.g., `BTC-USD`). It tracks client subscriptions and forwards matching Coinbase messages to subscribed clients.

- `server/package.json` — server dependencies and npm scripts (`dev`, `start`, `build`, `test`).
- `client/package.json` — client dependencies and scripts (`start`, `build`, `test`).
- `client/src/services/websocket.ts` — front-end WebSocket wrapper that opens a connection to the server and exports helpers `sendMessage` and `onMessage` used by React components.
- `client/src/App.tsx`, `client/src/index.tsx` — React app wiring and main view. Components are under `client/src/components/` (subscribe panel, price/match views and system status view).

## Environment variables

Create a `.env` in `server/` and another in `client/` (or use your preferred method). Example values:

server/.env

COINBASE_WS_URL=wss://ws-feed.pro.coinbase.com
PORT=3000

client/.env

REACT_APP_WS_URL=ws://localhost:3000

Notes:
- `COINBASE_WS_URL` is the Coinbase Pro WebSocket feed URL. The code expects this value to be present.
- `REACT_APP_WS_URL` should point at your running server's WebSocket endpoint (same origin or full ws:// URL).

## How to run (development)

1. Install dependencies for server and client (run from repo root):

Windows PowerShell example:

```powershell
cd e:\coinbase-project\server; npm install; cd ..\client; npm install
```

2. Start the server in dev mode (uses `ts-node-dev`):

```powershell
cd e:\coinbase-project\server; npm run dev
```

3. Start the React client:

```powershell
cd e:\coinbase-project\client; npm start
```

Open the app at http://localhost:3000 (or the CRA default port shown in the terminal). If the client port collides with the server port, CRA will pick a different port and you'll see it in the terminal.

## How to build and run production style

1. Build server and client:

```powershell
cd e:\coinbase-project\server; npm run build
cd e:\coinbase-project\client; npm run build
```

2. Start the (built) server:

```powershell
cd e:\coinbase-project\server; npm start
```

The server runs the compiled `dist/index.js`. Serve the React `build/` separately (or configure the server to serve static files from the client build) for a production setup.

## Running tests

Server tests (Jest):

```powershell
cd e:\coinbase-project\server; npm test
```

Client tests (React Scripts / Jest):

```powershell
cd e:\coinbase-project\client; npm test
```

There are unit tests under `server/tests/` and `client/tests/` for websocket handling and components.

## How the WebSocket flows work

1. The server (in `server/src/index.ts`) connects to Coinbase via `coinbaseHandler.handleCoinbaseFeed`.
2. When the server receives messages from Coinbase, `coinbaseHandler` calls `broadcastToClients` from `clientHandler`, which filters and forwards messages to connected browser clients that have subscribed to that `product_id`.
3. Browser clients open a WebSocket to the server (configured via `REACT_APP_WS_URL`) and send subscription messages with the shape: `{ action: 'subscribe', product_id: 'BTC-USD' }`.
4. The server will send subscribe/unsubscribe messages to Coinbase when a client subscribes/unsubscribes and will also keep a simple system status history.

Message shapes (examples):
- From client to server: { action: 'subscribe' | 'unsubscribe', product_id: string }
- From server to client: raw Coinbase messages forwarded (varies by channel), and system status messages of shape: { type: 'system_status', channels: [...] }

## Troubleshooting: Coinbase WebSocket closed, reconnects and 520 error

The server logs two common messages when the Coinbase connection misbehaves:

- "Coinbase WebSocket closed. Reconnecting..." — The `coinbaseHandler` listens for the `close` event and then attempts to reconnect after a 1 second timeout. This is a normal resiliency behavior when remote WebSocket closes. Frequent reconnects may be caused by network instability, rate limiting, or intentional server-side closures.

- "Coinbase WebSocket error: Unexpected server response: 520" — A 520 response is an HTTP-level error code returned before the WebSocket handshake is completed (Cloudflare and other intermediaries commonly return this). Possible causes:
  - Coinbase (or an intermediary) temporarily rejecting or rate-limiting connections. If too many connections or subscribe messages are sent in a short time, the server or proxy may reject the handshake.
  - A misconfigured `COINBASE_WS_URL` (ensure it's the correct wss URL for Coinbase: `wss://ws-feed.pro.coinbase.com`).
  - Network or proxy interference between your server and Coinbase (corporate proxies, VPNs, Cloudflare, or other security appliances returning 5xx responses).
  - Using an outdated TLS/SSL configuration or Node version that fails the TLS handshake; upgrading Node or ensuring the environment supports modern TLS may help.

Suggested steps to resolve 520 errors:
1. Double-check `COINBASE_WS_URL` in the server environment.
2. Inspect network-level logs and try connecting from another machine or environment (local laptop vs cloud server) to rule out local firewall/proxy.
3. Reduce reconnection / subscription rate during tests to avoid rate limiting.
4. Temporarily add extra logging in `coinbaseHandler` to log the underlying error object and stack for more context.
5. Ensure Node.js is up to date (recommended LTS) to avoid TLS incompatibilities.
6. If you suspect Coinbase-side limitations, check Coinbase Pro's API docs, status page, or contact their support for rate limits and restrictions.

If you repeatedly receive 520 responses, capture a tcpdump/wireshark or use a small standalone Node script that attempts a simple WebSocket handshake to `wss://ws-feed.pro.coinbase.com` to reproduce the failure and gather more details.

## Notes, assumptions and next steps
- The README assumes the server exposes an unsecured ws:// port for the client (development). For production, use wss:// with TLS, and either serve the client from the same origin or configure CORS and secure WebSocket endpoints.
- The project already includes automatic reconnection logic on the Coinbase side. Consider adding exponential backoff and a max retry limit to avoid tight reconnect loops.
- Consider batching subscribe/unsubscribe messages if many clients subscribe to the same product at once to reduce load.

## Contact / author
Project by prithvirajbiswas. For issues, open a GitHub issue on the repository.
