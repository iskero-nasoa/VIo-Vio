import { Server, Socket } from "socket.io";
import User from "../models/User";

export const setupPresenceSocket = (io: Server, socket: Socket) => {
  const userId = (socket as any).userId;

  if (userId) {
    // Set user to online on connect
    const setOnline = async () => {
      await User.findByIdAndUpdate(userId, { status: "online" });
      io.emit("user_status_changed", { userId, status: "online" });
      // Join personal room automatically
      socket.join(`user_${userId}`);
    };
    setOnline();

    socket.on("join_user_room", (targetUserId: string) => {
      socket.join(`user_${targetUserId}`);
    });

    socket.on("join_supergroup", (supergroupId: string) => {
      socket.join(`supergroup_${supergroupId}`);
      console.log(`🔌 Socket ${socket.id} joined supergroup: ${supergroupId}`);
    });

    socket.on("disconnect", async () => {
      // Set user to offline on disconnect
      await User.findByIdAndUpdate(userId, { status: "offline" });
      io.emit("user_status_changed", { userId, status: "offline" });
    });

    socket.on("change_status", async (data: { status: "online" | "away" | "offline"; statusText?: string }) => {
      await User.findByIdAndUpdate(userId, {
        status: data.status,
        statusText: data.statusText || ""
      });
      io.emit("user_status_changed", {
        userId,
        status: data.status,
        statusText: data.statusText
      });
    });
  }
};
