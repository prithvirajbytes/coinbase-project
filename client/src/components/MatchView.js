import React, { useContext } from 'react';
import { WebSocketContext } from '../App';

const MatchView = () => {
  const { matches, userSubscriptions } = useContext(WebSocketContext);

  // Filter matches to only show those for subscribed products
  const filteredMatches = matches.filter(match => userSubscriptions.has(match.product_id));

  return (
    <div>
      <h2>Match View (Order Blotter)</h2>
      <div className="match-blotter">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Product</th>
              <th>Size</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {filteredMatches.map((match, index) => (
              <tr key={index}>
                <td>{match.timestamp}</td>
                <td>{match.product_id}</td>
                <td>{match.size}</td>
                <td style={{ color: match.side === 'buy' ? 'green' : 'red' }}>
                  {match.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchView;