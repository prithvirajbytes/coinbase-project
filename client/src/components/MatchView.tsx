import React, { useEffect, useState } from 'react';
import { onMessage } from '../services/websocket';

export const MatchView = () => {
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    onMessage((msg) => {
      if (msg.type === 'match') {
        setMatches((prev) => [msg, ...prev.slice(0, 49)]);
      }
    });
  }, []);

  return (
    <div>
      <h2>Match View</h2>
      {matches.map((m, i) => (
        <div key={i} style={{ color: m.side === 'buy' ? 'green' : 'red' }}>
          {m.time} | {m.product_id} | {m.size} @ {m.price}
        </div>
      ))}
    </div>
  );
};
