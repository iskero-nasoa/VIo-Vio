import { Server, Socket } from "socket.io";
import { prisma } from "../config/prisma";

interface SocketWithUser extends Socket {
  userId?: string;
}

export const setupGroupSocket = (io: Server, socket: SocketWithUser) => {
  socket.on("join_group", (data: { groupId: string; userId: string }) => {
    socket.join(`group_${data.groupId}`);
    socket.join(`user_${data.userId}`);
  });

  socket.on(
    "send_group_message",
    async (data: {
      groupId: string;
      senderId: string;
      text: string;
      attachments?: any[];
      replyTo?: string;
      tempId?: string;
    }) => {
      try {
        if (!data.text?.trim() && (!data.attachments || data.attachments.length === 0)) return;

        const message = await prisma.message.create({
          data: {
            groupId: data.groupId,
            senderId: data.senderId,
            text: data.text,
            attachments: JSON.stringify(data.attachments || []),
            replyToId: data.replyTo || null,
          },
          include: {
            sender: { select: { id: true, username: true, avatar: true } },
            replyTo: { include: { sender: { select: { id: true, username: true } } } },
          },
        });

        await prisma.group.update({ where: { id: data.groupId }, data: { updatedAt: new Date() } });

        io.to(`group_${data.groupId}`).emit("group_message_received", {
          _id: message.id,
          id: message.id,
          groupId: data.groupId,
          chatId: data.groupId,
          text: message.text,
          attachments: JSON.parse(message.attachments || "[]"),
          createdAt: message.createdAt,
          senderId: { _id: message.sender.id, ...message.sender },
          senderUsername: message.sender.username,
          senderAvatar: message.sender.avatar,
          replyTo: message.replyTo
            ? { _id: message.replyTo.id, text: message.replyTo.text, senderId: message.replyTo.sender }
            : null,
          tempId: data.tempId,
        });
      } catch (error) {
        console.error("Error saving group message:", error);
      }
    }
  );

  socket.on("group_typing", async (data: { groupId: string; userId: string; isTyping: boolean }) => {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { username: true },
    });
    if (user) {
      socket.to(`group_${data.groupId}`).emit("group_user_typing", {
        groupId: data.groupId,
        userId: data.userId,
        username: user.username,
        isTyping: data.isTyping,
      });
    }
  });

  socket.on("leave_group", (groupId: string) => {
    socket.leave(`group_${groupId}`);
  });
};
