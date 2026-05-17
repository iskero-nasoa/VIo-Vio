import { Request, Response } from "express";
import { prisma } from "../config/prisma";

const chatInclude = {
  participants: {
    include: {
      user: {
        select: { id: true, username: true, avatar: true, email: true, status: true },
      },
    },
  },
  messages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: {
      sender: { select: { id: true, username: true, avatar: true } },
    },
  },
};

function formatChat(chat: any) {
  return {
    _id: chat.id,
    id: chat.id,
    type: chat.type,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    participants: chat.participants.map((p: any) => ({
      _id: p.user.id,
      ...p.user,
    })),
    messages: chat.messages.map((m: any) => ({
      _id: m.id,
      ...m,
      senderId: { _id: m.sender.id, ...m.sender },
    })),
  };
}

export const getChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const chats = await prisma.chat.findMany({
      where: { participants: { some: { userId } } },
      include: chatInclude,
      orderBy: { updatedAt: "desc" },
    });
    res.status(200).json(chats.map((c) => formatChat(c)));
  } catch (error) {
    res.status(500).json({ message: "Failed to get chats", error });
  }
};

export const getChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const chatId = req.params.chatId as string;
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: chatInclude,
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }
    res.status(200).json(formatChat(chat));
  } catch (error) {
    res.status(500).json({ message: "Failed to get chat", error });
  }
};

export const createDirectChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { targetUserId } = req.body;

    if (!targetUserId) {
      res.status(400).json({ message: "Target user ID is required" });
      return;
    }

    if (userId === targetUserId) {
      res.status(400).json({ message: "Cannot create chat with yourself" });
      return;
    }

    // Find existing direct chat between these two users
    const existing = await prisma.chat.findFirst({
      where: {
        type: "direct",
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: targetUserId } } },
        ],
      },
      include: chatInclude,
    });

    if (existing) {
      res.status(200).json(formatChat(existing));
      return;
    }

    const chat = await prisma.chat.create({
      data: {
        type: "direct",
        participants: {
          create: [{ userId }, { userId: targetUserId }],
        },
      },
      include: chatInclude,
    });

    res.status(200).json(formatChat(chat));
  } catch (error) {
    res.status(500).json({ message: "Failed to create direct chat", error });
  }
};

export const deleteChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const chatId = req.params.chatId as string;
    await prisma.chat.delete({ where: { id: chatId } });
    res.status(200).json({ message: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete chat", error });
  }
};
