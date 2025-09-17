import React, { useState } from 'react';
import { sendMessage } from '../services/websocket';

const products = ['BTC-USD', 'ETH-USD', 'XRP-USD', 'LTC-USD'];

export const SubscribePanel = () => {
  const [subscribed, setSubscribed] = useState<Record<string, boolean>>({});

  const toggle = (product: string) => {
    const action = subscribed[product] ? 'unsubscribe' : 'subscribe';
    sendMessage({ action, product_id: product });
    setSubscribed((prev) => ({ ...prev, [product]: !prev[product] }));
  };

  return (
    <div>
      <h2>Subscribe/Unsubscribe</h2>
      {products.map((p) => (
        <button key={p} onClick={() => toggle(p)}>
          {subscribed[p] ? `Unsubscribe ${p}` : `Subscribe ${p}`}
        </button>
      ))}
    </div>
  );
};
