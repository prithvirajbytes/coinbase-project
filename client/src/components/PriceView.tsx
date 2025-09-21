import React, { useEffect, useState } from 'react';

interface PriceData {
  [productId: string]: [string, string, string][]; // Each productId has an array of [side, price, size]
}

interface Props {
  priceData: PriceData;
}

const PriceView: React.FC<Props> = ({ priceData }) => {
  const [displayData, setDisplayData] = useState<PriceData>(priceData);

  // Update displayData whenever priceData prop changes.
  // Avoid polling and avoid mutating incoming arrays.
  useEffect(() => {
    setDisplayData({ ...priceData });
  }, [priceData]);

  // Return a new sorted array for bids (descending) or asks (ascending)
  const getBids = (orderBook: [string, string, string][]) =>
    orderBook
      .filter(([side]) => side === 'buy')
      .slice()
      .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));

  const getAsks = (orderBook: [string, string, string][]) =>
    orderBook
      .filter(([side]) => side === 'sell')
      .slice()
      .sort((a, b) => parseFloat(a[1]) - parseFloat(b[1]));

  return (
    <div data-testid="price-view-container">
      <h2>Price View</h2>
      {Object.keys(displayData).map((productId) => {
        const orderBook = displayData[productId] || [];
          const bids = getBids(orderBook);
          const asks = getAsks(orderBook);

          return (
          <div key={productId} data-testid={`product-${productId}`}>
            <h3>{productId}</h3>

              {/* Bids Section */}
              <div data-testid={`bids-${productId}`}>
                <h4>Bids</h4>
                {bids.length > 0 ? (
                  <ul>
                    {bids.map(([side, price, size], idx) => (
                      <li key={idx} data-testid={`bid-${productId}-${idx}`}>
                        {side} - Price: {price}, Size: {size}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No bids available</p>
                )}
              </div>

              {/* Asks Section */}
              <div data-testid={`asks-${productId}`}>
                <h4>Asks</h4>
                {asks.length > 0 ? (
                  <ul>
                    {asks.map(([side, price, size], idx) => (
                      <li key={idx} data-testid={`ask-${productId}-${idx}`}>
                        {side} - Price: {price}, Size: {size}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No asks available</p>
                )}
              </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceView;
