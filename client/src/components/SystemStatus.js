import React, { useContext } from 'react';
import { WebSocketContext } from '../App';

const SystemStatus = () => {
  const { systemStatus } = useContext(WebSocketContext);

  if (!systemStatus || !systemStatus.channels) {
    return (
      <div>
        <h2>System Status</h2>
        <p>Awaiting system status...</p>
      </div>
    );
  }

  return (
    <div>
      <h2>System Status</h2>
      <p>Channels Subscribed by Server:</p>
      <ul>
        {systemStatus.channels.map((channel, index) => (
          <li key={index}>
            **Name:** {channel.name}
            {channel.product_ids && (
              <>
                <br />
                **Products:** {channel.product_ids.join(', ')}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SystemStatus;