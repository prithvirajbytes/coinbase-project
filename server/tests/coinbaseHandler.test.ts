import {
  subscribeToProduct,
  unsubscribeFromProduct,
  setCoinbaseSocket,
} from '../src/websocket/coinbaseHandler';

describe('Coinbase WebSocket subscription', () => {
  const mockSend = jest.fn();
  // Mock the WebSocket with required methods for ws library compatibility
  const mockSocket = {
    send: mockSend,
    on: jest.fn(),
    close: jest.fn(),
    terminate: jest.fn(),
    ping: jest.fn(),
    pong: jest.fn(),
    isPaused: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    readyState: 1,
  };

  beforeEach(() => {
    setCoinbaseSocket(mockSocket as any);
    mockSend.mockClear();
  });

  it('should format subscribe message correctly', () => {
    subscribeToProduct('BTC-USD');
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('"type":"subscribe"'));
  });

  it('should format unsubscribe message correctly', () => {
    unsubscribeFromProduct('ETH-USD');
    expect(mockSend).toHaveBeenCalledWith(expect.stringContaining('"type":"unsubscribe"'));
  });
});
