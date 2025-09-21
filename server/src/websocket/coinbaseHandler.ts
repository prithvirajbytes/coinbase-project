import WebSocket from 'ws';
import dotenv from 'dotenv';
import { broadcastToClients, updateSystemStatus } from './clientHandler';

dotenv.config();

const COINBASE_WS_URL = process.env.COINBASE_WS_URL!;
let coinbaseSocket: WebSocket;

/**
 * Allows test injection of a mock WebSocket
 */
export const setCoinbaseSocket = (ws: WebSocket) => {
  coinbaseSocket = ws;
};

/**
 * Connects to Coinbase Pro WebSocket feed and sets up listeners
 */
export const handleCoinbaseFeed = (injectSocket?: (ws: WebSocket) => void) => {
  coinbaseSocket = new WebSocket(COINBASE_WS_URL);
  injectSocket?.(coinbaseSocket);

  coinbaseSocket.on('open', () => {
    console.log('✅ Connected to Coinbase Pro WebSocket');
  });

  coinbaseSocket.on('error', (err) => {
    console.error('❌ Coinbase WebSocket error:', err.message);
  });

  coinbaseSocket.on('message', (data: WebSocket.RawData) => {
    try {
      const msg = JSON.parse(data.toString());
      broadcastToClients(msg);
    } catch (err) {
      console.error('⚠️ Failed to parse Coinbase message:', err);
    }
  });

  coinbaseSocket.on('close', () => {
    console.warn('🔄 Coinbase WebSocket closed. Reconnecting...');
    setTimeout(() => handleCoinbaseFeed(injectSocket), 1000);
  });
};

/**
 * Sends a subscribe message for a given product
 */
export const subscribeToProduct = (product_id: string) => {
  const msg = {
    type: 'subscribe',
    product_ids: [product_id],
    channels: ['level2', 'matches'],
  };
  if (coinbaseSocket?.readyState === WebSocket.OPEN) {
    coinbaseSocket.send(JSON.stringify(msg));
    updateSystemStatus(msg);
  } else {
    console.warn(`⚠️ Cannot subscribe to ${product_id}: WebSocket not open`);
  }
};

/**
 * Sends an unsubscribe message for a given product
 */
export const unsubscribeFromProduct = (product_id: string) => {
  const msg = {
    type: 'unsubscribe',
    product_ids: [product_id],
    channels: ['level2', 'matches'],
  };
  if (coinbaseSocket?.readyState === WebSocket.OPEN) {
    coinbaseSocket.send(JSON.stringify(msg));
    updateSystemStatus(msg);
  } else {
    console.warn(`⚠️ Cannot unsubscribe from ${product_id}: WebSocket not open`);
  }
};
