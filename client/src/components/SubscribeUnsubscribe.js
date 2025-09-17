import React, { useContext } from 'react';
import { WebSocketContext } from '../App';

const products = ['BTC-USD', 'ETH-USD', 'XRP-USD', 'LTC-USD'];

const SubscribeUnsubscribe = () => {
  const { ws, userSubscriptions } = useContext(WebSocketContext);

  const handleSubscribe = (productId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'subscribe', product_id: productId }));
    }
  };

  const handleUnsubscribe = (productId) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'unsubscribe', product_id: productId }));
    }
  };

  return (
    <div>
      <h2>Subscribe/Unsubscribe</h2>
      {products.map(product => (
        <div key={product} className="subscription-item">
          <p>{product}</p>
          <button
            onClick={() => handleSubscribe(product)}
            disabled={userSubscriptions.has(product)}
          >
            Subscribe
          </button>
          <button
            onClick={() => handleUnsubscribe(product)}
            disabled={!userSubscriptions.has(product)}
          >
            Unsubscribe
          </button>
          <span className={`status ${userSubscriptions.has(product) ? 'subscribed' : 'unsubscribed'}`}>
            {userSubscriptions.has(product) ? 'Subscribed' : 'Unsubscribed'}
          </span>
        </div>
      ))}
    </div>
  );
};

export default SubscribeUnsubscribe;