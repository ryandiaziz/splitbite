import { useState, useEffect, useCallback, useRef } from 'react';

type WebSocketHook = {
  isConnected: boolean;
  sendMessage: (msg: any) => void;
  lastMessage: any | null;
};

export function useWebSocket(url: string | null): WebSocketHook {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCount = useRef(0);
  const unmounted = useRef(false);

  const connect = useCallback(() => {
    if (!url || unmounted.current) return;

    // Clean up previous connection
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      retryCount.current = 0; // Reset retry count on successful connection
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
      } catch (err) {
        console.warn('Failed to parse WebSocket message:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed, code:', event.code, 'reason:', event.reason);
      setIsConnected(false);

      // Auto-reconnect with exponential backoff (max 10 seconds)
      if (!unmounted.current) {
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
        console.log(`Reconnecting in ${delay}ms (attempt ${retryCount.current + 1})`);
        reconnectTimer.current = setTimeout(() => {
          retryCount.current++;
          connect();
        }, delay);
      }
    };
  }, [url]);

  useEffect(() => {
    unmounted.current = false;
    connect();

    return () => {
      unmounted.current = true;
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((msg: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } else {
      console.warn('Cannot send message, WebSocket is not open');
    }
  }, []);

  return { isConnected, sendMessage, lastMessage };
}
