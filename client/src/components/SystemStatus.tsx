import React, { useEffect, useState } from 'react';
import { onMessage } from '../services/websocket';

export const SystemStatus = () => {
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    onMessage((msg) => {
      if (msg.type === 'system_status') {
        setChannels(msg.channels);
      }
    });
  }, []);

  return (
    <div>
      <h2>System Status</h2>
      <pre>{JSON.stringify(channels, null, 2)}</pre>
    </div>
  );
};
