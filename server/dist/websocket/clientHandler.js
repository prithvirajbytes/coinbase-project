"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSystemStatus = exports.broadcastToClients = exports.handleClientConnection = void 0;
const coinbaseHandler_1 = require("./coinbaseHandler");
const clients = new Map();
let systemStatus = [];
const handleClientConnection = (ws) => {
    clients.set(ws, new Set());
    ws.on('message', (msg) => {
        const { action, product_id } = JSON.parse(msg.toString());
        const subscriptions = clients.get(ws);
        if (action === 'subscribe') {
            subscriptions.add(product_id);
            (0, coinbaseHandler_1.subscribeToProduct)(product_id);
        }
        else if (action === 'unsubscribe') {
            subscriptions.delete(product_id);
            (0, coinbaseHandler_1.unsubscribeFromProduct)(product_id);
        }
    });
    ws.on('close', () => {
        clients.delete(ws);
    });
};
exports.handleClientConnection = handleClientConnection;
const broadcastToClients = (msg) => {
    clients.forEach((products, ws) => {
        if (products.has(msg.product_id)) {
            ws.send(JSON.stringify(msg));
        }
    });
};
exports.broadcastToClients = broadcastToClients;
const updateSystemStatus = (msg) => {
    systemStatus.push(msg);
    clients.forEach((_, ws) => {
        ws.send(JSON.stringify({ type: 'system_status', channels: systemStatus }));
    });
};
exports.updateSystemStatus = updateSystemStatus;
