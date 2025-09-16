import { io } from 'socket.io-client';

const socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:4000');

export default socket;
