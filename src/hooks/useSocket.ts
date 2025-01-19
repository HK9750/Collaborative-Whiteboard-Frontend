import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const useSocket = (url: string, roomId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url || !roomId) return;

    try {
      const socketInstance = io(url, {
        query: { roomId },
        reconnection: true,
        reconnectionAttempts: 5,
      });

      socketInstance.on("connect", () => {
        console.log("Socket connected");
      });

      socketInstance.on("connect_error", (err) => {
        setError(err);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } catch (err) {
      setError(err as Error);
    }
  }, [url, roomId]);

  return { socket, error };
};

export default useSocket;
