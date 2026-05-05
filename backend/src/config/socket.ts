import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { env } from "./env";
import { setupMessageSocket } from "../sockets/messageSocket";
import { setupPresenceSocket } from "../sockets/presenceSocket";
import jwt from "jsonwebtoken";

let io: Server;

interface SocketWithUser extends Socket {
  userId?: string;
}

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3002",
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
      credentials: true,
    },
  });

  // Middleware for Socket Authentication
  io.use((socket: SocketWithUser, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token as string, env.JWT_SECRET) as { userId: string };
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket: SocketWithUser) => {
    console.log(`⚡ Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Setup handlers
    setupMessageSocket(io, socket);
    setupPresenceSocket(io, socket);

    socket.on("disconnect", () => {
      console.log(`⚡ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
};
