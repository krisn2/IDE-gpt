import { useRef, useState, useEffect, useCallback } from 'react';

const useWebSocket = (url, onMessageCallback) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const onMessageRef = useRef(onMessageCallback);

  // Update the ref whenever onMessageCallback changes
  useEffect(() => {
    onMessageRef.current = onMessageCallback;
  }, [onMessageCallback]);

  const initWebSocket = useCallback(() => {
    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      console.log('WebSocket already connected or connecting.');
      return;
    }

    try {
      socketRef.current = new WebSocket(url);

      socketRef.current.onopen = () => {
        setIsConnected(true);
        onMessageRef.current({ type: "system", data: "System connected to server" });
      };

      socketRef.current.onclose = () => {
        setIsConnected(false);
        onMessageRef.current({ type: "system", data: "Disconnected from server" });
        // Attempt to reconnect after a delay
        setTimeout(initWebSocket, 3000);
      };

      socketRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        onMessageRef.current({ type: "system", data: "Error connecting to server" });
      };

      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current(data);
        } catch (error) {
          console.error("Error parsing message:", error);
          onMessageRef.current({ type: "stderr", data: "Error processing server response" });
        }
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      onMessageRef.current({ type: "system", data: "Failed to connect to server: " + error.message });
    }
  }, [url]);

  useEffect(() => {
    initWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [initWebSocket]);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not connected. Message not sent:", message);
    }
  }, []);

  return { socket: socketRef.current, isConnected, sendMessage, initWebSocket };
};

export default useWebSocket;