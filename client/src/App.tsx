import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Paper } from '@mui/material';
import Subscribe from './components/Subscribe';
import PriceView from './components/PriceView';
import MatchView from './components/MatchView';
import SystemStatus from './components/SystemStatus';
import './App.css';  // Import the app.css file

const socket: Socket = io('http://localhost:4000');

interface PriceData {
  [productId: string]: [string, string, string][]; // Format for price data
}

const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<string[]>([]);
  const [priceView, setPriceView] = useState<PriceData>({});
  const [matches, setMatches] = useState<any[]>([]); // Holds the match data
  const [systemStatus, setSystemStatus] = useState<string[]>([]);

  const availableProducts = ['BTC-USD', 'ETH-USD', 'XRP-USD', 'LTC-USD']; // Available products to subscribe

  // Socket setup and listeners
  useEffect(() => {
    socket.on('subscribed', (data) => setSubscriptions(data));

    socket.on('update', (data) => {
      if (data.type === 'l2update') {
        setPriceView((prev) => ({
          ...prev,
          [data.product_id]: data.changes || [],
        }));
      }

      if (data.type === 'match') {
        setMatches((prevMatches) => {
          const newMatches = [
            ...prevMatches,
            {
              time: data.time,
              product: data.product_id,
              size: data.size,
              price: data.price,
              side: data.side,
            },
          ];

          // Keep only the most recent 10 matches
          return newMatches.slice(-10);
        });
      }
    });

    socket.on('systemStatus', (data) => {
      console.log('System status update received:', data);
      setSystemStatus(data);
    });
  }, []);

  // Authentication removed: app always renders main UI

  return (
    <div className="app-container">

      <div className="card-stack">
        <Paper className="styled-card" elevation={6}>
          <Subscribe socket={socket} subscriptions={subscriptions} availableProducts={availableProducts} />
        </Paper>

        <Paper className="styled-card" elevation={6}>
          <PriceView priceData={priceView} />
        </Paper>

        <Paper className="styled-card" elevation={6}>
          <MatchView matches={matches} />
        </Paper>

        <Paper className="styled-card" elevation={6}>
          <SystemStatus channels={systemStatus} />
        </Paper>
      </div>
    </div>
  );
};

export default App;
