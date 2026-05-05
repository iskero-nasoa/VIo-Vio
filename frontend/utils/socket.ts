import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001", {
      autoConnect: false,
      query: { token },
      withCredentials: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
