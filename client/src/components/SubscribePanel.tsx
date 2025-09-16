import React, { useState } from 'react';
import socket from '../services/socket';
import { ProductID } from '../types';

const products: ProductID[] = ['BTC-USD', 'ETH-USD', 'XRP-USD', 'LTC-USD'];

export const SubscribePanel: React.FC = () => {
  const [subscribed, setSubscribed] = useState<ProductID[]>([]);

  const toggleSubscription = (product: ProductID) => {
    if (subscribed.includes(product)) {
      socket.emit('unsubscribe', product);
      setSubscribed(subscribed.filter(p => p !== product));
    } else {
      socket.emit('subscribe', product);
      setSubscribed([...subscribed, product]);
    }
  };

  return (
    <div>
      <h3>Subscribe/Unsubscribe</h3>
      {products.map(product => (
        <button key={product} onClick={() => toggleSubscription(product)}>
          {subscribed.includes(product) ? `Unsubscribe ${product}` : `Subscribe ${product}`}
        </button>
      ))}
    </div>
  );
};
