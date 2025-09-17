import { createContext } from 'react';

// Create a context with an initial value of null.
// The provider will wrap the App component to make the WebSocket connection
// and market data available to all children.
export const WebSocketContext = createContext(null);