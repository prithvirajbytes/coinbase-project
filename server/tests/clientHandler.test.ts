import { handleClientConnection } from '../src/websocket/clientHandler';

describe('Client WebSocket handler', () => {
  let mockWs: any;

  beforeEach(() => {
    mockWs = {
      send: jest.fn(),
      on: jest.fn(),
      close: jest.fn(),
    };
  });

  it('should register client connection', () => {
    handleClientConnection(mockWs);
    expect(mockWs.on).toHaveBeenCalledWith('message', expect.any(Function));
  });
});
