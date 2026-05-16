import { Request, Response } from "express";
import Topic from "../models/Topic";
import Message from "../models/Message";
import Group from "../models/Group";
import DeletedMessage from "../models/DeletedMessage";
import mongoose from "mongoose";
import { getIO } from "../config/socket";

// Create a topic in a group (admin only)
export const createTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id;
    const { name, description } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.admin.toString() !== userId?.toString()) {
      res.status(403).json({ message: "Only admin can create topics" });
      return;
    }

    if (!name || !name.trim()) {
      res.status(400).json({ message: "Topic name is required" });
      return;
    }

    const topic = await Topic.create({
      groupId: new mongoose.Types.ObjectId(groupId as string),
      name: name.trim(),
      description: description?.trim() || "",
      createdBy: userId,
      messages: [],
    });

    const populated = await topic.populate("createdBy", "username avatar");

    const io = getIO();
    io.to(`group_${groupId}`).emit("topic_created", { groupId, topic: populated });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to create topic", error });
  }
};

// Get all topics for a group
export const getTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;

    const topics = await Topic.find({ groupId })
      .populate("createdBy", "username avatar")
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 1 },
        populate: { path: "senderId", select: "username avatar" },
      })
      .sort({ createdAt: 1 });

    res.status(200).json(topics);
  } catch (error) {
    res.status(500).json({ message: "Failed to get topics", error });
  }
};

// Get messages for a topic (paginated)
export const getTopicMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { topicId } = req.params;
    const userId = req.user?._id;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;

    const deletedForMe = await DeletedMessage.find({ userId }).distinct("messageId");

    const messages = await Message.find({
      topicId: new mongoose.Types.ObjectId(topicId as string),
      _id: { $nin: deletedForMe },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate([
        { path: "senderId", select: "username avatar" },
        {
          path: "replyTo",
          populate: { path: "senderId", select: "username" },
        },
      ]);

    res.status(200).json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: "Failed to get topic messages", error });
  }
};

// Update topic (admin only)
export const updateTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, topicId } = req.params;
    const userId = req.user?._id;
    const { name, description } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.admin.toString() !== userId?.toString()) {
      res.status(403).json({ message: "Only admin can update topics" });
      return;
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      res.status(404).json({ message: "Topic not found" });
      return;
    }

    if (name !== undefined) topic.name = name.trim();
    if (description !== undefined) topic.description = description.trim();
    await topic.save();

    const populated = await topic.populate("createdBy", "username avatar");

    const io = getIO();
    io.to(`group_${groupId}`).emit("topic_updated", { groupId, topic: populated });

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update topic", error });
  }
};

// Delete topic (admin only)
export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, topicId } = req.params;
    const userId = req.user?._id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.admin.toString() !== userId?.toString()) {
      res.status(403).json({ message: "Only admin can delete topics" });
      return;
    }

    // Delete all messages in the topic
    await Message.deleteMany({ topicId: new mongoose.Types.ObjectId(topicId as string) });

    await Topic.findByIdAndDelete(topicId);

    const io = getIO();
    io.to(`group_${groupId}`).emit("topic_deleted", { groupId, topicId });

    res.status(200).json({ message: "Topic deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete topic", error });
  }
};
