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
/**
 * Allows test injection of a mock WebSocket
 */
const setCoinbaseSocket = (ws) => {
    coinbaseSocket = ws;
};
exports.setCoinbaseSocket = setCoinbaseSocket;
/**
 * Connects to Coinbase Pro WebSocket feed and sets up listeners
 */
const handleCoinbaseFeed = (injectSocket) => {
    coinbaseSocket = new ws_1.default(COINBASE_WS_URL);
    injectSocket?.(coinbaseSocket);
    coinbaseSocket.on('open', () => {
        console.log('✅ Connected to Coinbase Pro WebSocket');
    });
    coinbaseSocket.on('error', (err) => {
        console.error('❌ Coinbase WebSocket error:', err.message);
    });
    coinbaseSocket.on('message', (data) => {
        try {
            const msg = JSON.parse(data.toString());
            (0, clientHandler_1.broadcastToClients)(msg);
        }
        catch (err) {
            console.error('⚠️ Failed to parse Coinbase message:', err);
        }
    });
    coinbaseSocket.on('close', () => {
        console.warn('🔄 Coinbase WebSocket closed. Reconnecting...');
        setTimeout(() => (0, exports.handleCoinbaseFeed)(injectSocket), 1000);
    });
};
exports.handleCoinbaseFeed = handleCoinbaseFeed;
/**
 * Sends a subscribe message for a given product
 */
const subscribeToProduct = (product_id) => {
    const msg = {
        type: 'subscribe',
        product_ids: [product_id],
        channels: ['level2', 'matches'],
    };
    if (coinbaseSocket?.readyState === ws_1.default.OPEN) {
        coinbaseSocket.send(JSON.stringify(msg));
        (0, clientHandler_1.updateSystemStatus)(msg);
    }
    else {
        console.warn(`⚠️ Cannot subscribe to ${product_id}: WebSocket not open`);
    }
};
exports.subscribeToProduct = subscribeToProduct;
/**
 * Sends an unsubscribe message for a given product
 */
const unsubscribeFromProduct = (product_id) => {
    const msg = {
        type: 'unsubscribe',
        product_ids: [product_id],
        channels: ['level2', 'matches'],
    };
    if (coinbaseSocket?.readyState === ws_1.default.OPEN) {
        coinbaseSocket.send(JSON.stringify(msg));
        (0, clientHandler_1.updateSystemStatus)(msg);
    }
    else {
        console.warn(`⚠️ Cannot unsubscribe from ${product_id}: WebSocket not open`);
    }
};
exports.unsubscribeFromProduct = unsubscribeFromProduct;
