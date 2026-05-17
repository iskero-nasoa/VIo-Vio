import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { getIO } from "../config/socket";

const messageInclude = {
  sender: { select: { id: true, username: true, avatar: true } },
  replyTo: {
    include: { sender: { select: { id: true, username: true } } },
  },
  reactions: { select: { id: true, userId: true, emoji: true } },
};

function formatMessage(m: any) {
  return {
    _id: m.id,
    id: m.id,
    chatId: m.chatId,
    groupId: m.groupId,
    text: m.text,
    attachments: JSON.parse(m.attachments || "[]"),
    status: m.status,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
    senderId: m.sender
      ? { _id: m.sender.id, ...m.sender }
      : m.senderId,
    senderUsername: m.sender?.username,
    senderAvatar: m.sender?.avatar,
    replyTo: m.replyTo
      ? {
          _id: m.replyTo.id,
          text: m.replyTo.text,
          senderId: m.replyTo.sender
            ? { _id: m.replyTo.sender.id, ...m.replyTo.sender }
            : m.replyTo.senderId,
        }
      : null,
    reactions: formatReactions(m.reactions || []),
  };
}

function formatReactions(reactions: { id: string; userId: string; emoji: string }[]) {
  const grouped: Record<string, { emoji: string; count: number; userIds: string[] }> = {};
  for (const r of reactions) {
    if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, userIds: [] };
    grouped[r.emoji].count++;
    grouped[r.emoji].userIds.push(r.userId);
  }
  return Object.values(grouped);
}

export const sendMessage = async (
  chatId: string,
  text: string,
  senderId: string,
  attachments?: any[],
  replyToId?: string,
  groupId?: string
) => {
  if (!text.trim() && (!attachments || attachments.length === 0)) {
    throw new Error("Message text or attachments must be provided");
  }

  const message = await prisma.message.create({
    data: {
      chatId: groupId ? null : chatId,
      groupId: groupId || null,
      senderId,
      text,
      attachments: JSON.stringify(attachments || []),
      replyToId: replyToId || null,
    },
    include: messageInclude,
  });

  // Touch chat/group updatedAt
  if (groupId) {
    await prisma.group.update({ where: { id: groupId }, data: { updatedAt: new Date() } });
  } else {
    await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
  }

  return formatMessage(message);
};

export const createMessageRest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId, text, attachments, replyTo } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const message = await sendMessage(chatId, text, senderId, attachments, replyTo);
    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to send message" });
  }
};

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const chatId = req.params.chatId as string;
    const userId = req.user?.id as string;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;

    const deletedForMe = await prisma.deletedMessage.findMany({
      where: { userId },
      select: { messageId: true },
    });
    const deletedIds = deletedForMe.map((d) => d.messageId);

    const messages = await prisma.message.findMany({
      where: {
        chatId,
        id: { notIn: deletedIds },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: messageInclude,
    });

    res.status(200).json(messages.reverse().map(formatMessage));
  } catch (error) {
    res.status(500).json({ message: "Failed to get messages", error });
  }
};

export const deleteMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const messageId = req.params.messageId as string;
    const userId = req.user?.id as string;

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    if (message.senderId !== userId) {
      res.status(403).json({ message: "Only the message author can delete for everyone" });
      return;
    }

    await prisma.message.delete({ where: { id: messageId } });

    const io = getIO();
    if (message.chatId) io.to(message.chatId).emit("message_deleted", messageId);
    if (message.groupId) io.to(`group_${message.groupId}`).emit("message_deleted", messageId);
    if (message.topicId) io.to(`topic_${message.topicId}`).emit("message_deleted", messageId);

    res.status(200).json({ message: "Message deleted for everyone", messageId, type: "hard" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete message", error });
  }
};

export const deleteMessageForMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const messageId = req.params.messageId as string;
    const userId = req.user?.id as string;

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    await prisma.deletedMessage.upsert({
      where: { userId_messageId: { userId, messageId } },
      create: { userId, messageId },
      update: { deletedAt: new Date() },
    });

    res.status(200).json({ message: "Message hidden for you", messageId, type: "soft" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete message", error });
  }
};

export const editMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const messageId = req.params.messageId as string;
    const { text } = req.body;
    const userId = req.user?.id as string;

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    if (message.senderId !== userId) {
      res.status(403).json({ message: "You can only edit your own messages" });
      return;
    }

    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { text },
      include: messageInclude,
    });

    res.status(200).json(formatMessage(updated));
  } catch (error) {
    res.status(500).json({ message: "Failed to edit message", error });
  }
};

export const toggleReaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const messageId = req.params.messageId as string;
    const userId = req.user?.id as string;
    const { emoji } = req.body;

    if (!emoji) { res.status(400).json({ message: "Emoji is required" }); return; }

    const message = await prisma.message.findUnique({ where: { id: messageId } });
    if (!message) { res.status(404).json({ message: "Message not found" }); return; }

    const existing = await prisma.reaction.findUnique({
      where: { messageId_userId: { messageId, userId } },
    });

    let removed = false;
    if (existing) {
      if (existing.emoji === emoji) {
        // Same emoji → remove
        await prisma.reaction.delete({ where: { messageId_userId: { messageId, userId } } });
        removed = true;
      } else {
        // Different emoji → swap
        await prisma.reaction.update({
          where: { messageId_userId: { messageId, userId } },
          data: { emoji },
        });
      }
    } else {
      await prisma.reaction.create({ data: { messageId, userId, emoji } });
    }

    const updated = await prisma.message.findUnique({
      where: { id: messageId },
      include: messageInclude,
    });

    const formatted = formatMessage(updated);
    const io = getIO();
    const room = message.chatId || (message.groupId ? `group_${message.groupId}` : message.topicId ? `topic_${message.topicId}` : null);
    if (room) {
      io.to(room).emit("reaction_updated", { messageId, reactions: formatted.reactions });
    }

    res.status(200).json({ messageId, reactions: formatted.reactions, removed });
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle reaction", error });
  }
};
