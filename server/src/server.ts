import express, { Request, Response } from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import WebSocket from 'ws';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000; // Use the PORT from the .env file

// Middleware
app.use(cors());
app.use(express.json());

// (Authentication removed) 

// Create HTTP server and WebSocket server
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: '*', // Replace '*' with your frontend URL in production
  },
});

// Coinbase WebSocket URL
const COINBASE_WS_URL = 'wss://ws-feed.exchange.coinbase.com';

// Active WebSocket connection to Coinbase
export const coinbaseWs = new WebSocket(COINBASE_WS_URL);

// Maintain subscriptions for each user
interface Subscriptions {
  [key: string]: string[];
}

const subscriptions: Subscriptions = {};

// Maintain active channels
const activeChannels: string[] = [];

// Authentication removed: connections are accepted without JWT

// Handle WebSocket connection to Coinbase
coinbaseWs.on('open', () => {
  console.log('Connected to Coinbase WebSocket');
});

coinbaseWs.on('message', (message: string) => {
  try {
    const data = JSON.parse(message);
    if (data.type === 'l2update' || data.type === 'match') {
      Object.keys(subscriptions).forEach((userId) => {
        const userProducts = subscriptions[userId];
        if (userProducts.includes(data.product_id || '')) {
          io.to(userId).emit('update', data);
        }
      });
    }
  } catch (error) {
    console.error('Error parsing WebSocket message:', error);
  }
});

coinbaseWs.on('close', () => {
  console.log('Coinbase WebSocket closed. Reconnecting...');
});

coinbaseWs.on('error', (error: Error) => {
  console.error('Coinbase WebSocket error:', error);
});

// Handle client connections
io.on('connection', (socket: Socket) => {
  try {
    console.log(`User connected: ${socket.id}`);
    subscriptions[socket.id] = [];

    socket.on('subscribe', ({ productId }: { productId: string }) => {
      try {
        if (!subscriptions[socket.id].includes(productId)) {
          subscriptions[socket.id].push(productId);
          if (!activeChannels.includes(productId)) {
            coinbaseWs.send(
              JSON.stringify({
                type: 'subscribe',
                product_ids: [productId],
                channels: ['level2', 'matches'],
              })
            );
            activeChannels.push(productId);
          }
          io.to(socket.id).emit('subscribed', subscriptions[socket.id]);
          io.emit('systemStatus', Object.keys(subscriptions).map((id) => subscriptions[id]).flat());
        }
      } catch (error) {
        console.error('Error handling subscribe event:', error);
      }
    });

    socket.on('unsubscribe', ({ productId }: { productId: string }) => {
      try {
        subscriptions[socket.id] = subscriptions[socket.id].filter(
          (p) => p !== productId
        );
        if (!Object.values(subscriptions).some((subs) => subs.includes(productId))) {
          coinbaseWs.send(
            JSON.stringify({
              type: 'unsubscribe',
              product_ids: [productId],
              channels: ['level2', 'matches'],
            })
          );
          activeChannels.splice(activeChannels.indexOf(productId), 1);
        }
        io.to(socket.id).emit('subscribed', subscriptions[socket.id]);
        io.emit('systemStatus', Object.keys(subscriptions).map((id) => subscriptions[id]).flat());
      } catch (error) {
        console.error('Error handling unsubscribe event:', error);
      }
    });

    socket.on('disconnect', () => {
      try {
        delete subscriptions[socket.id];
        activeChannels.forEach((productId) => {
          if (!Object.values(subscriptions).some((subs) => subs.includes(productId))) {
            coinbaseWs.send(
              JSON.stringify({
                type: 'unsubscribe',
                product_ids: [productId],
                channels: ['level2', 'matches'],
              })
            );
            activeChannels.splice(activeChannels.indexOf(productId), 1);
          }
        });
        io.emit('systemStatus', Object.keys(subscriptions).map((id) => subscriptions[id]).flat());
      } catch (error) {
        console.error('Error during disconnect:', error);
      }
    });
  } catch (error) {
    console.error('Error handling socket connection:', error);
  }
});

// Basic HTTP route to handle GET requests
app.get('/', (req: Request, res: Response) => {
  try {
    res.send('Backend server is running!');
  } catch (error) {
    console.error('Error in root GET route:', error);
    res.status(500).send('Internal server error');
  }
});


// Export app and server for testing
export { app, server };

// For CommonJS `require()` compatibility in tests
// @ts-ignore
module.exports = { app, server, coinbaseWs, io };

// Start server when not running in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    try {
      console.log(`Server running on http://localhost:${PORT}`);
    } catch (error) {
      console.error('Error starting server:', error);
    }
  });
}
