import React from 'react';
import { SubscribePanel } from './components/SubscribePanel';
import { PriceView } from './components/PriceView';
import { MatchView } from './components/MatchView';
import { SystemStatusPanel  } from './components/SystemStatus';

const App: React.FC = () => {
  return (
    <div>
      <h2>Coinbase Pro WebSocket Dashboard</h2>
      <SubscribePanel />
      <PriceView />
      <MatchView />
      <SystemStatusPanel />
    </div>
  );
};

export default App;
