import React, { useState, useEffect, createContext } from 'react';
import './App.css';
import SubscribeUnsubscribe from './components/SubscribeUnsubscribe';
import PriceView from './components/PriceView';
import MatchView from './components/MatchView';
import SystemStatus from './components/SystemStatus';

// Create a context to provide WebSocket data
export const WebSocketContext = createContext();

function App() {
  const [marketData, setMarketData] = useState({
    'BTC-USD': { bids: [], asks: [] },
    'ETH-USD': { bids: [], asks: [] },
    'XRP-USD': { bids: [], asks: [] },
    'LTC-USD': { bids: [], asks: [] }
  });
  const [matches, setMatches] = useState([]);
  const [systemStatus, setSystemStatus] = useState({});
  const [userSubscriptions, setUserSubscriptions] = useState(new Set());
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Connect to the WebSocket server
    const socket = new WebSocket('ws://localhost:3001');

    socket.onopen = () => {
      console.log('Connected to server WebSocket');
      setWs(socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const { type } = data;

      switch (type) {
        case 'l2update':
          handleLevel2Update(data);
          break;
        case 'match':
          handleMatch(data);
          break;
        case 'system_status':
          setSystemStatus(data.data);
          break;
        case 'user_subscriptions':
          setUserSubscriptions(new Set(data.data));
          break;
        default:
          console.log('Unknown message type:', data);
          break;
      }
    };

    socket.onclose = () => {
      console.log('Disconnected from server WebSocket');
      setWs(null);
    };

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Update order book with level2 updates
  const handleLevel2Update = (update) => {
    setMarketData(prevData => {
      const newMarketData = { ...prevData };
      const product = newMarketData[update.product_id];
      const newBids = [...product.bids];
      const newAsks = [...product.asks];

      update.changes.forEach(change => {
        const [side, price, size] = change;
        const targetList = side === 'buy' ? newBids : newAsks;
        const existingIndex = targetList.findIndex(item => item[0] === price);

        if (parseFloat(size) === 0) {
          if (existingIndex !== -1) {
            targetList.splice(existingIndex, 1);
          }
        } else {
          if (existingIndex !== -1) {
            targetList[existingIndex] = [price, size];
          } else {
            targetList.push([price, size]);
          }
        }
      });

      // Sort the arrays to maintain order book display
      newBids.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
      newAsks.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));

      return {
        ...prevData,
        [update.product_id]: { bids: newBids.slice(0, 15), asks: newAsks.slice(0, 15) } // Limit display for performance
      };
    });
  };

  // Add a new match to the blotter
  const handleMatch = (match) => {
    setMatches(prevMatches => {
      const newMatches = [{ ...match, timestamp: new Date().toLocaleTimeString() }, ...prevMatches];
      return newMatches.slice(0, 50); // Keep the blotter from growing infinitely
    });
  };

  const wsContextValue = {
    ws,
    marketData,
    matches,
    systemStatus,
    userSubscriptions
  };

  return (
    <WebSocketContext.Provider value={wsContextValue}>
      <div className="App">
        <h1>Coinbase Pro Market Viewer</h1>
        <div className="container">
          <div className="section">
            <SubscribeUnsubscribe />
          </div>
          <div className="section">
            <PriceView />
          </div>
          <div className="section">
            <MatchView />
          </div>
          <div className="section">
            <SystemStatus />
          </div>
        </div>
      </div>
    </WebSocketContext.Provider>
  );
}

export default App;