import { Server, Socket } from "socket.io";
import { prisma } from "../config/prisma";

interface SocketWithUser extends Socket {
  userId?: string;
}

export const setupTopicSocket = (io: Server, socket: SocketWithUser) => {
  socket.on("join_topic", (data: { topicId: string; groupId?: string }) => {
    socket.join(`topic_${data.topicId}`);
    if (data.groupId) socket.join(`supergroup_${data.groupId}`);
  });

  socket.on("leave_topic", (topicId: string) => {
    socket.leave(`topic_${topicId}`);
  });

  socket.on(
    "send_topic_message",
    async (data: {
      topicId: string;
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
            topicId: data.topicId,
            senderId: data.senderId,
            text: data.text || "",
            attachments: JSON.stringify(data.attachments || []),
            replyToId: data.replyTo || null,
          },
          include: {
            sender: { select: { id: true, username: true, avatar: true } },
            replyTo: { include: { sender: { select: { id: true, username: true } } } },
          },
        });

        await prisma.supergroup.update({
          where: { id: data.groupId },
          data: { updatedAt: new Date() },
        });

        const formatted = {
          _id: message.id,
          id: message.id,
          topicId: data.topicId,
          text: message.text,
          attachments: JSON.parse(message.attachments || "[]"),
          createdAt: message.createdAt,
          tempId: data.tempId,
          senderId: { _id: message.sender.id, ...message.sender },
          senderUsername: message.sender.username,
          senderAvatar: message.sender.avatar,
          replyTo: message.replyTo
            ? { _id: message.replyTo.id, text: message.replyTo.text, senderId: message.replyTo.sender }
            : null,
        };

        io.to(`topic_${data.topicId}`).emit("topic_message_received", formatted);
      } catch (error) {
        console.error("Error saving topic message:", error);
      }
    }
  );

  socket.on("topic_typing", (data: { topicId: string; userId: string; isTyping: boolean }) => {
    prisma.user
      .findUnique({ where: { id: data.userId }, select: { username: true } })
      .then((user) => {
        if (user) {
          socket.to(`topic_${data.topicId}`).emit("topic_user_typing", {
            topicId: data.topicId,
            userId: data.userId,
            username: user.username,
            isTyping: data.isTyping,
          });
        }
      });
  });
};
