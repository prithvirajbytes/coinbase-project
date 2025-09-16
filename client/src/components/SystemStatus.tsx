import React, { useEffect, useState } from 'react';
import socket from '../services/socket';
import { SystemStatus as SystemStatusType } from '../types/index';

export const SystemStatusPanel: React.FC = () => {
  const [channels, setChannels] = useState<string[]>([]);

  useEffect(() => {
    socket.on('systemStatus', (msg: SystemStatusType) => {
      setChannels(msg.channels);
    });

    return () => {
      socket.off('systemStatus');
    };
  }, []);

  return (
    <div>
      <h3>System Status</h3>
      <ul>
        {channels.map((channel, idx) => (
          <li key={idx}>{channel}</li>
        ))}
      </ul>
    </div>
  );
};
