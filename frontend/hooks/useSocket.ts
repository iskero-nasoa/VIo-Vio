"use client";

import { useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "../utils/socket";
import { Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socketInstance = getSocket();
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setConnected(true);
      setError(null);
    });

    socketInstance.on("connect_error", (err) => {
      setConnected(false);
      setError(err.message);
    });

    socketInstance.on("disconnect", () => {
      setConnected(false);
    });

    socketInstance.connect();

    return () => {
      socketInstance.off("connect");
      socketInstance.off("connect_error");
      socketInstance.off("disconnect");
      disconnectSocket();
    };
  }, [isAuthenticated]);

  return { socket, connected, error };
};
