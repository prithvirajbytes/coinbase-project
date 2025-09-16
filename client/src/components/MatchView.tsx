import React, { useEffect, useState } from 'react';
import socket from '../services/socket';
import { MatchMessage } from '../types';

export const MatchView: React.FC = () => {
  const [matches, setMatches] = useState<MatchMessage[]>([]);

  useEffect(() => {
    const handleMatch = (msg: MatchMessage) => {
      setMatches(prev => [msg, ...prev.slice(0, 50)]);
    };

    socket.on('match', handleMatch);
    return () => {
      socket.off('match', handleMatch);
    };
  }, []);

  return (
    <div>
      <h3>Match View</h3>
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
          {matches.map((match, idx) => (
            <tr key={idx}>
              <td>{new Date(match.time).toLocaleTimeString()}</td>
              <td>{match.product_id}</td>
              <td>{match.size}</td>
              <td style={{ color: match.side === 'buy' ? 'green' : 'red' }}>{match.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
