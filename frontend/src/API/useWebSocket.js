import { useEffect, useRef } from 'react';

const useWebSocket = (url, onMessage) => {
  const socket = useRef(null);

  useEffect(() => {
    socket.current = new WebSocket(url);

    socket.current.onmessage = (event) => {
      onMessage(event);
    };

    return () => {
      socket.current.close();
    };
  }, [url, onMessage]);

  const sendMessage = (message) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(message);
    }
  };

  return sendMessage;
};

export default useWebSocket;
