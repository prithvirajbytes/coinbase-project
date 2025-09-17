import React, { useContext, useState, useEffect } from 'react';
import { WebSocketContext } from '../App';

const PriceView = () => {
  const { marketData, userSubscriptions } = useContext(WebSocketContext);
  const [displayData, setDisplayData] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      // Update display data at a 50ms refresh rate
      const updatedData = {};
      userSubscriptions.forEach(product => {
        updatedData[product] = marketData[product];
      });
      setDisplayData(updatedData);
    }, 50); // Refresh every 50ms

    return () => clearInterval(interval);
  }, [marketData, userSubscriptions]);

  return (
    <div>
      <h2>Price View (Order Book)</h2>
      {Object.keys(displayData).length > 0 ? (
        Object.entries(displayData).map(([product, data]) => (
          <div key={product} className="order-book-container">
            <h3>{product}</h3>
            <div className="order-book">
              <div className="bids">
                <h4>Bids (Buy)</h4>
                <ul>
                  {data.bids.map(([price, size]) => (
                    <li key={price}>{`Price: ${price}, Size: ${size}`}</li>
                  ))}
                </ul>
              </div>
              <div className="asks">
                <h4>Asks (Sell)</h4>
                <ul>
                  {data.asks.map(([price, size]) => (
                    <li key={price}>{`Price: ${price}, Size: ${size}`}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>No products subscribed.</p>
      )}
    </div>
  );
};

export default PriceView;