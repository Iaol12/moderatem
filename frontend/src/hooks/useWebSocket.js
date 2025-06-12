import { useEffect, useRef } from 'react';

export default function useWebSocket(onMessage, screenType, token = null) {
  const socketRef = useRef(null);

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = window.location.host;
    const ws = new WebSocket(`${wsProtocol}://${wsHost}`);
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'register-screen',
        data: { screen: screenType, session_id:  token }
      }));
    };

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      onMessage(msg);
    };

    return () => ws.close();
  }, [screenType, token]);

  const send = (type, data) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn("WebSocket not open. Cannot send:", type, data);
      return;
    }

    ws.send(JSON.stringify({ type, data }));
  };

  return send;
}
