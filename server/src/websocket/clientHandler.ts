import WebSocket from 'ws';
import { subscribeToProduct, unsubscribeFromProduct } from './coinbaseHandler';

const clients: Map<WebSocket, Set<string>> = new Map();
let systemStatus: any[] = [];

export const handleClientConnection = (ws: WebSocket) => {
  clients.set(ws, new Set());

  ws.on('message', (msg: WebSocket.RawData) => {
    const { action, product_id } = JSON.parse(msg.toString());
    const subscriptions = clients.get(ws)!;

    if (action === 'subscribe') {
      subscriptions.add(product_id);
      subscribeToProduct(product_id);
    } else if (action === 'unsubscribe') {
      subscriptions.delete(product_id);
      unsubscribeFromProduct(product_id);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
};

export const broadcastToClients = (msg: any) => {
  clients.forEach((products, ws) => {
    if (products.has(msg.product_id)) {
      ws.send(JSON.stringify(msg));
    }
  });
};

export const updateSystemStatus = (msg: any) => {
  systemStatus.push(msg);
  clients.forEach((_, ws) => {
    ws.send(JSON.stringify({ type: 'system_status', channels: systemStatus }));
  });
};
