const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const COINBASE_PRO_WS_URL = 'wss://ws-feed.pro.coinbase.com';
const products = ['BTC-USD', 'ETH-USD', 'XRP-USD', 'LTC-USD'];

const coinbaseClient = new WebSocket(COINBASE_PRO_WS_URL);
let subscribedChannels = {}; // This will store the system status

// Map to manage connected clients and their subscriptions
const clients = new Map();

// Generate a unique ID for each client
const generateClientId = () => Math.random().toString(36).substring(2, 9);

// Setup Coinbase Pro WebSocket connection
coinbaseClient.onopen = () => {
  console.log('Connected to Coinbase Pro WebSocket');
  const subscribeMessage = {
    type: 'subscribe',
    product_ids: products,
    channels: ['level2', 'matches']
  };
  coinbaseClient.send(JSON.stringify(subscribeMessage));
};

// Handle messages from Coinbase Pro
coinbaseClient.onmessage = (message) => {
  const data = JSON.parse(message.data);
  const { type, product_id, channels } = data;

  if (type === 'subscriptions') {
    subscribedChannels = data;
    // Broadcast the updated system status to all clients
    clients.forEach(client => {
      client.ws.send(JSON.stringify({ type: 'system_status', data: subscribedChannels }));
    });
    return;
  }

  // Filter and broadcast the message to subscribed clients
  if (product_id) {
    clients.forEach(client => {
      if (client.subscriptions.has(product_id)) {
        client.ws.send(JSON.stringify(data));
      }
    });
  }
};

coinbaseClient.onclose = () => {
  console.log('Disconnected from Coinbase Pro WebSocket');
  // Handle reconnection logic here
};

coinbaseClient.onerror = (error) => {
  console.error('Coinbase Pro WebSocket error:', error);
};

// Setup WebSocket server for React clients
wss.on('connection', (ws) => {
  const clientId = generateClientId();
  console.log(`Client ${clientId} connected`);

  clients.set(clientId, { ws, subscriptions: new Set() });

  // Send initial system status to the new client
  ws.send(JSON.stringify({ type: 'system_status', data: subscribedChannels }));

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    const client = clients.get(clientId);

    if (data.type === 'subscribe' && client) {
      client.subscriptions.add(data.product_id);
      console.log(`Client ${clientId} subscribed to ${data.product_id}`);
    } else if (data.type === 'unsubscribe' && client) {
      client.subscriptions.delete(data.product_id);
      console.log(`Client ${clientId} unsubscribed from ${data.product_id}`);
    }
    // Inform the client about their current subscriptions
    ws.send(JSON.stringify({ type: 'user_subscriptions', data: Array.from(client.subscriptions) }));
  });

  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  });

  ws.on('error', (error) => {
    console.error(`Client ${clientId} error:`, error);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});