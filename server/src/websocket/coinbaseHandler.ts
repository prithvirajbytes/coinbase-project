import WebSocket from 'ws';
import dotenv from 'dotenv';
import { broadcastToClients, updateSystemStatus } from './clientHandler';

dotenv.config();

const COINBASE_WS_URL = process.env.COINBASE_WS_URL!;
let coinbaseSocket: WebSocket;

export const setCoinbaseSocket = (ws: WebSocket) => {
  coinbaseSocket = ws;
};

export const handleCoinbaseFeed = (injectSocket?: (ws: WebSocket) => void) => {
  coinbaseSocket = new WebSocket(COINBASE_WS_URL);
  injectSocket?.(coinbaseSocket);

  coinbaseSocket.on('open', () => {
    console.log('Connected to Coinbase Pro WebSocket');
  });

  coinbaseSocket.on('message', (data: WebSocket.RawData) => {
    const msg = JSON.parse(data.toString());
    broadcastToClients(msg);
  });

  coinbaseSocket.on('close', () => {
    console.log('Coinbase WebSocket closed. Reconnecting...');
    setTimeout(() => handleCoinbaseFeed(injectSocket), 1000);
  });
};

export const subscribeToProduct = (product_id: string) => {
  const msg = {
    type: 'subscribe',
    product_ids: [product_id],
    channels: ['level2', 'matches'],
  };
  coinbaseSocket?.send(JSON.stringify(msg));
  updateSystemStatus(msg);
};

export const unsubscribeFromProduct = (product_id: string) => {
  const msg = {
    type: 'unsubscribe',
    product_ids: [product_id],
    channels: ['level2', 'matches'],
  };
  coinbaseSocket?.send(JSON.stringify(msg));
  updateSystemStatus(msg);
};
