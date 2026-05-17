import { Server, Socket } from "socket.io";
import { prisma } from "../config/prisma";

export const setupPresenceSocket = (io: Server, socket: Socket) => {
  const userId = (socket as any).userId as string | undefined;

  if (!userId) return;

  const setStatus = async (status: string, statusText?: string) => {
    await prisma.user.update({
      where: { id: userId },
      data: { status, ...(statusText !== undefined && { statusText }) },
    });
    io.emit("user_status_changed", { userId, status, statusText });
  };

  setStatus("online");
  socket.join(`user_${userId}`);

  socket.on("join_user_room", (targetUserId: string) => {
    socket.join(`user_${targetUserId}`);
  });

  socket.on("join_supergroup", (supergroupId: string) => {
    socket.join(`supergroup_${supergroupId}`);
  });

  socket.on("change_status", (data: { status: "online" | "away" | "offline"; statusText?: string }) => {
    setStatus(data.status, data.statusText || "");
  });

  socket.on("disconnect", () => {
    setStatus("offline");
  });
};
