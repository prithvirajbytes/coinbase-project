import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { handleCoinbaseFeed, setCoinbaseSocket } from './websocket/coinbaseHandler';
import { handleClientConnection } from './websocket/clientHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

handleCoinbaseFeed(setCoinbaseSocket);

wss.on('connection', (ws: WebSocket) => {
  handleClientConnection(ws);
});

app.get('/', (_req, res) => {
  res.send('Server is running');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
