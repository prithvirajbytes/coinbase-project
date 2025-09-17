"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeFromProduct = exports.subscribeToProduct = exports.handleCoinbaseFeed = exports.setCoinbaseSocket = void 0;
const ws_1 = __importDefault(require("ws"));
const dotenv_1 = __importDefault(require("dotenv"));
const clientHandler_1 = require("./clientHandler");
dotenv_1.default.config();
const COINBASE_WS_URL = process.env.COINBASE_WS_URL;
let coinbaseSocket;
const setCoinbaseSocket = (ws) => {
    coinbaseSocket = ws;
};
exports.setCoinbaseSocket = setCoinbaseSocket;
const handleCoinbaseFeed = (injectSocket) => {
    coinbaseSocket = new ws_1.default(COINBASE_WS_URL);
    injectSocket?.(coinbaseSocket);
    coinbaseSocket.on('open', () => {
        console.log('Connected to Coinbase Pro WebSocket');
    });
    coinbaseSocket.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        (0, clientHandler_1.broadcastToClients)(msg);
    });
    coinbaseSocket.on('close', () => {
        console.log('Coinbase WebSocket closed. Reconnecting...');
        setTimeout(() => (0, exports.handleCoinbaseFeed)(injectSocket), 1000);
    });
};
exports.handleCoinbaseFeed = handleCoinbaseFeed;
const subscribeToProduct = (product_id) => {
    const msg = {
        type: 'subscribe',
        product_ids: [product_id],
        channels: ['level2', 'matches'],
    };
    coinbaseSocket?.send(JSON.stringify(msg));
    (0, clientHandler_1.updateSystemStatus)(msg);
};
exports.subscribeToProduct = subscribeToProduct;
const unsubscribeFromProduct = (product_id) => {
    const msg = {
        type: 'unsubscribe',
        product_ids: [product_id],
        channels: ['level2', 'matches'],
    };
    coinbaseSocket?.send(JSON.stringify(msg));
    (0, clientHandler_1.updateSystemStatus)(msg);
};
exports.unsubscribeFromProduct = unsubscribeFromProduct;
