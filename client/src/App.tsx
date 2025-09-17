import React from 'react';
import { SubscribePanel } from './components/SubscribePanel';
import { PriceView } from './components/PriceView';
import { MatchView } from './components/MatchView';
import { SystemStatus } from './components/SystemStatus';

function App() {
  return (
    <div>
      <h1>Coinbase Pro WebSocket Viewer</h1>
      <SubscribePanel />
      <PriceView />
      <MatchView />
      <SystemStatus />
    </div>
  );
}

export default App;
