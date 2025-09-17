const socket = new WebSocket(process.env.REACT_APP_WS_URL!);

export const sendMessage = (msg: any) => {
  socket.send(JSON.stringify(msg));
};

export const onMessage = (callback: (data: any) => void) => {
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    callback(data);
  };
};

export default socket;
