import { Server, Socket } from "socket.io";
import { prisma } from "../config/prisma";
import { sendMessage } from "../controllers/messageController";

function groupReactions(reactions: { id: string; userId: string; emoji: string }[]) {
  const grouped: Record<string, { emoji: string; count: number; userIds: string[] }> = {};
  for (const r of reactions) {
    if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, userIds: [] };
    grouped[r.emoji].count++;
    grouped[r.emoji].userIds.push(r.userId);
  }
  return Object.values(grouped);
}

interface SocketWithUser extends Socket {
  userId?: string;
}

export const setupMessageSocket = (io: Server, socket: SocketWithUser) => {
  socket.on("join_chat", (data: { chatId: string; userId: string }) => {
    socket.join(data.chatId);
  });

  socket.on(
    "send_message",
    async (data: {
      chatId: string;
      senderId: string;
      text: string;
      attachments?: any[];
      replyTo?: string;
      tempId?: string;
    }) => {
      try {
        const message = await sendMessage(data.chatId, data.text, data.senderId, data.attachments, data.replyTo);
        io.to(data.chatId).emit("message_received", { ...message, tempId: data.tempId });
      } catch (error) {
        console.error("Error saving message via socket:", error);
      }
    }
  );

  socket.on("typing", async (data: { chatId: string; userId: string; isTyping: boolean }) => {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { username: true },
    });
    if (user) {
      socket.to(data.chatId).emit("user_typing", {
        userId: data.userId,
        username: user.username,
        isTyping: data.isTyping,
      });
    }
  });

  socket.on("leave_chat", (chatId: string) => {
    socket.leave(chatId);
    if (socket.userId) {
      socket.to(chatId).emit("user_left", { userId: socket.userId });
    }
  });

  socket.on(
    "toggle_reaction",
    async (data: { messageId: string; emoji: string; userId: string }) => {
      try {
        const message = await prisma.message.findUnique({ where: { id: data.messageId } });
        if (!message) return;

        const existing = await prisma.reaction.findUnique({
          where: { messageId_userId: { messageId: data.messageId, userId: data.userId } },
        });

        if (existing) {
          if (existing.emoji === data.emoji) {
            await prisma.reaction.delete({ where: { messageId_userId: { messageId: data.messageId, userId: data.userId } } });
          } else {
            await prisma.reaction.update({
              where: { messageId_userId: { messageId: data.messageId, userId: data.userId } },
              data: { emoji: data.emoji },
            });
          }
        } else {
          await prisma.reaction.create({ data: { messageId: data.messageId, userId: data.userId, emoji: data.emoji } });
        }

        const reactions = await prisma.reaction.findMany({
          where: { messageId: data.messageId },
          select: { id: true, userId: true, emoji: true },
        });

        const grouped = groupReactions(reactions);
        const room = message.chatId || (message.groupId ? `group_${message.groupId}` : message.topicId ? `topic_${message.topicId}` : null);
        if (room) {
          io.to(room).emit("reaction_updated", { messageId: data.messageId, reactions: grouped });
        }
      } catch (error) {
        console.error("Error toggling reaction:", error);
      }
    }
  );
};
