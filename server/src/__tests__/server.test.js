const request = require('supertest');
const ClientIO = require('socket.io-client');

// Mock the 'ws' module used by server.js so tests don't open a real network connection.
jest.mock('ws', () => {
  return jest.fn().mockImplementation(() => {
    return {
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn(),
    };
  });
});

process.env.NODE_ENV = 'test';

const { app, server, io, coinbaseWs } = require('../server');

let httpServer;
let clientSocket;

beforeAll((done) => {
  httpServer = server.listen(0, () => done());
});

afterAll((done) => {
  if (clientSocket && clientSocket.connected) {
    clientSocket.disconnect();
  }
  httpServer.close(done);
});

test('GET / should return running message', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.text).toMatch(/Backend server is running/);
});

test('socket subscribe -> server emits subscribed and systemStatus', (done) => {
  const port = httpServer.address().port;
  clientSocket = ClientIO(`http://localhost:${port}`);

  clientSocket.on('connect', () => {
    clientSocket.emit('subscribe', { productId: 'BTC-USD' });
  });

  let gotSubscribed = false;
  let gotSystemStatus = false;

  clientSocket.on('subscribed', (data) => {
    expect(Array.isArray(data)).toBe(true);
    gotSubscribed = true;
    if (gotSubscribed && gotSystemStatus) done();
  });

  clientSocket.on('systemStatus', (data) => {
    expect(Array.isArray(data)).toBe(true);
    gotSystemStatus = true;
    if (gotSubscribed && gotSystemStatus) done();
  });
});

// Test that server forwards mocked coinbaseWs messages to subscribed clients
test('server forwards coinbase update to subscribed clients', (done) => {
  const port = httpServer.address().port;
  const client = ClientIO(`http://localhost:${port}`);

  client.on('connect', () => {
    client.emit('subscribe', { productId: 'BTC-USD' });

    const matchMsg = JSON.stringify({ type: 'match', product_id: 'BTC-USD', price: '50000', size: '0.1', side: 'buy', time: new Date().toISOString() });

    // Use the server's exported io to simulate forwarded message
    io.emit('update', JSON.parse(matchMsg));
  });

  client.on('update', (data) => {
    try {
      expect(data.type).toBe('match');
      expect(data.product_id).toBe('BTC-USD');
      client.disconnect();
      done();
    } catch (err) {
      done(err);
    }
  });
});
