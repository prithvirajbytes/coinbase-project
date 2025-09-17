import React, { useEffect, useState } from 'react';
import { onMessage } from '../services/websocket';

export const PriceView = () => {
  const [bids, setBids] = useState<string[]>([]);
  const [asks, setAsks] = useState<string[]>([]);

  useEffect(() => {
    onMessage((msg) => {
      if (msg.type === 'l2update') {
        const buy = msg.changes.filter((c: any) => c[0] === 'buy').map((c: any) => c[1]);
        const sell = msg.changes.filter((c: any) => c[0] === 'sell').map((c: any) => c[1]);
        setBids(buy);
        setAsks(sell);
      }
    });
  }, []);

  return (
    <div>
      <h2>Price View</h2>
      <div>Bids: {bids.slice(0, 10).join(', ')}</div>
      <div>Asks: {asks.slice(0, 10).join(', ')}</div>
    </div>
  );
};
