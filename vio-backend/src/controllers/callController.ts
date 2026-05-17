import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export const getCallHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 30;

    const calls = await prisma.callLog.findMany({
      where: { OR: [{ callerId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        caller: { select: { id: true, username: true, avatar: true } },
        receiver: { select: { id: true, username: true, avatar: true } },
      },
    });

    res.status(200).json(
      calls.map((c) => ({
        _id: c.id,
        ...c,
        callerId: { _id: c.caller.id, ...c.caller },
        receiverId: { _id: c.receiver.id, ...c.receiver },
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to get call history", error });
  }
};
