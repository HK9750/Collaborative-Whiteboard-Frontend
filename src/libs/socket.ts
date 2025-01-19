import { io, Socket } from "socket.io-client";

export const createSocket = (url: string, roomId: string): Socket => {
  return io(url, {
    query: { roomId },
  });
};
