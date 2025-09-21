"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const dotenv_1 = __importDefault(require("dotenv"));
const coinbaseHandler_1 = require("./websocket/coinbaseHandler");
const clientHandler_1 = require("./websocket/clientHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.default.Server({ server });
const PORT = process.env.PORT || 3000;
(0, coinbaseHandler_1.handleCoinbaseFeed)(coinbaseHandler_1.setCoinbaseSocket);
wss.on('connection', (ws) => {
    (0, clientHandler_1.handleClientConnection)(ws);
});
app.get('/', (_req, res) => {
    res.send('Server is running');
});
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
