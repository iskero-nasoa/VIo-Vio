import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let subscribersCount = 0;

/**
 * Returns a singleton socket instance.
 * If a token is provided and differs from the current socket's token, 
 * it re-initializes the connection.
 */
export const getSocket = (token?: string): Socket => {
  const currentToken = token || (typeof window !== "undefined" ? localStorage.getItem("token") : null);
  
  if (!socket) {
    console.log("🌐 Creating NEW socket instance. Token present:", !!currentToken);
    socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001", {
      autoConnect: false,
      query: { token: currentToken },
      withCredentials: true,
    });
    (socket as any).token = currentToken;
  } else if (currentToken && (socket as any).token !== currentToken) {
    // If token changed, disconnect and re-init
    console.log("🌐 Auth token changed! Re-initializing socket...");
    socket.disconnect();
    socket = io(process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:3001", {
      autoConnect: false,
      query: { token: currentToken },
      withCredentials: true,
    });
    (socket as any).token = currentToken;
  }

  subscribersCount++;
  console.log(`🌐 Socket subscribers count: ${subscribersCount}`);
  return socket;
};

/**
 * Decrements the subscriber count and disconnects the socket if it reaches zero.
 */
export const disconnectSocket = () => {
  console.log("🌐 Request to disconnect socket...");
  if (subscribersCount > 0) {
    subscribersCount--;
  }
  
  if (socket && subscribersCount === 0) {
    console.log("🌐 All subscribers gone. Disconnecting socket completely.");
    socket.disconnect();
    socket = null;
  }
};
