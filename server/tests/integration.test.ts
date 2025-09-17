import WebSocket from 'ws';

jest.setTimeout(10000);

describe('WebSocket integration test', () => {
  let ws: WebSocket;

  beforeAll((done) => {
    ws = new WebSocket('ws://localhost:3000');
    ws.on('open', () => done());
    ws.on('error', (err) => done(err));
  });

  it('should subscribe and receive system status', (done) => {
    ws.send(JSON.stringify({ action: 'subscribe', product_id: 'BTC-USD' }));

    ws.on('message', (msg) => {
      const data = JSON.parse(msg.toString());
      if (data.type === 'system_status') {
        expect(data.channels).toBeDefined();
        done();
      }
    });
  });

  afterAll(() => {
    ws.close();
  });
});
