import React, { useEffect, useState } from 'react';
import socket from '../services/socket';
import { Level2Update, ProductID } from '../types';

interface PriceMap {
  [product: string]: { bids: string[]; asks: string[] };
}

export const PriceView: React.FC = () => {
  const [prices, setPrices] = useState<PriceMap>({});

  useEffect(() => {
    const updatePrices = (msg: Level2Update) => {
      const current = prices[msg.product_id] || { bids: [], asks: [] };
      msg.changes.forEach(([side, price]) => {
        if (side === 'buy') current.bids.unshift(price);
        else current.asks.unshift(price);
      });
      setPrices(prev => ({ ...prev, [msg.product_id]: current }));
    };

    socket.on('l2update', updatePrices);
    return () => {
      socket.off('l2update', updatePrices);
    };
  }, [prices]);

  return (
    <div>
      <h3>Price View</h3>
      {Object.entries(prices).map(([product, { bids, asks }]) => (
        <div key={product}>
          <h4>{product}</h4>
          <p><strong>Bids:</strong> {bids.slice(0, 5).join(', ')}</p>
          <p><strong>Asks:</strong> {asks.slice(0, 5).join(', ')}</p>
        </div>
      ))}
    </div>
  );
};
