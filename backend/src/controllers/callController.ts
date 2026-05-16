import { Request, Response } from "express";
import CallLog from "../models/CallLog";

// Get call history for the current user
export const getCallHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 30;

    const calls = await CallLog.find({
      $or: [{ callerId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("callerId", "username avatar")
      .populate("receiverId", "username avatar");

    res.status(200).json(calls);
  } catch (error) {
    res.status(500).json({ message: "Failed to get call history", error });
  }
};
