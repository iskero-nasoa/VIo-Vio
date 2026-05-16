import { Request, Response } from "express";
import Group from "../models/Group";
import Message from "../models/Message";
import DeletedMessage from "../models/DeletedMessage";
import mongoose from "mongoose";
import { getIO } from "../config/socket";

// Create a new group
export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name, description, memberIds } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ message: "Group name is required" });
      return;
    }

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      res.status(400).json({ message: "At least one member is required" });
      return;
    }

    // Ensure admin is included in members
    const allMembers = Array.from(new Set([userId.toString(), ...memberIds]));

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || "",
      admin: userId,
      members: allMembers.map((id) => new mongoose.Types.ObjectId(id)),
      messages: [],
    });

    const populated = await group.populate([
      { path: "admin", select: "username avatar email" },
      { path: "members", select: "username avatar email status" },
    ]);

    // Notify all members via socket
    const io = getIO();
    allMembers.forEach((memberId) => {
      io.to(`user_${memberId}`).emit("group_created", populated);
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to create group", error });
  }
};

// Get all groups the current user is a member of
export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const groups = await Group.find({ members: userId })
      .populate("admin", "username avatar email")
      .populate("members", "username avatar email status")
      .populate({
        path: "messages",
        options: { sort: { createdAt: -1 }, limit: 1 },
        populate: { path: "senderId", select: "username avatar" },
      })
      .sort({ updatedAt: -1 });

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Failed to get groups", error });
  }
};

// Get a single group by ID
export const getGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("admin", "username avatar email")
      .populate("members", "username avatar email status");

    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Failed to get group", error });
  }
};

// Get messages for a group (paginated)
export const getGroupMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;

    // Filter out messages deleted by this user
    const deletedForMe = await DeletedMessage.find({ userId }).distinct("messageId");

    const messages = await Message.find({
      chatId: new mongoose.Types.ObjectId(groupId as string),
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
    res.status(500).json({ message: "Failed to get group messages", error });
  }
};

// Update group (admin only)
export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id;
    const { name, description, avatar } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.admin.toString() !== userId?.toString()) {
      res.status(403).json({ message: "Only admin can update the group" });
      return;
    }

    if (name !== undefined) group.name = name.trim();
    if (description !== undefined) group.description = description.trim();
    if (avatar !== undefined) group.avatar = avatar;

    await group.save();

    const populated = await group.populate([
      { path: "admin", select: "username avatar email" },
      { path: "members", select: "username avatar email status" },
    ]);

    // Notify all members
    const io = getIO();
    io.to(`group_${groupId}`).emit("group_updated", populated);

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update group", error });
  }
};

// Delete group (admin only)
export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.admin.toString() !== userId?.toString()) {
      res.status(403).json({ message: "Only admin can delete the group" });
      return;
    }

    // Delete all messages in the group
    await Message.deleteMany({ chatId: new mongoose.Types.ObjectId(groupId as string) });

    // Notify members before deletion
    const io = getIO();
    io.to(`group_${groupId}`).emit("group_deleted", { groupId });

    await Group.findByIdAndDelete(groupId);

    res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete group", error });
  }
};

// Add a member to the group (admin only)
export const addMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { userId: newMemberId } = req.body;
    const adminId = req.user?._id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.admin.toString() !== adminId?.toString()) {
      res.status(403).json({ message: "Only admin can add members" });
      return;
    }

    if (!newMemberId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Check if already a member
    if (group.members.some((m) => m.toString() === newMemberId)) {
      res.status(400).json({ message: "User is already a member" });
      return;
    }

    group.members.push(new mongoose.Types.ObjectId(newMemberId));
    await group.save();

    const populated = await group.populate([
      { path: "admin", select: "username avatar email" },
      { path: "members", select: "username avatar email status" },
    ]);

    // Notify group and the new member
    const io = getIO();
    io.to(`group_${groupId}`).emit("group_member_added", {
      groupId,
      group: populated,
    });
    io.to(`user_${newMemberId}`).emit("group_created", populated);

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to add member", error });
  }
};

// Remove a member from the group (admin only)
export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId, memberId } = req.params;
    const adminId = req.user?._id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.admin.toString() !== adminId?.toString()) {
      res.status(403).json({ message: "Only admin can remove members" });
      return;
    }

    if (memberId === group.admin.toString()) {
      res.status(400).json({ message: "Cannot remove the admin" });
      return;
    }

    group.members = group.members.filter((m) => m.toString() !== memberId);
    await group.save();

    const populated = await group.populate([
      { path: "admin", select: "username avatar email" },
      { path: "members", select: "username avatar email status" },
    ]);

    // Notify group and the removed member
    const io = getIO();
    io.to(`group_${groupId}`).emit("group_member_removed", {
      groupId,
      memberId,
      group: populated,
    });
    io.to(`user_${memberId}`).emit("group_removed", { groupId });

    res.status(200).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove member", error });
  }
};

// Leave group (non-admin)
export const leaveGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const userId = req.user?._id;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.admin.toString() === userId?.toString()) {
      res.status(400).json({ message: "Admin cannot leave the group. Transfer admin or delete the group." });
      return;
    }

    group.members = group.members.filter((m) => m.toString() !== userId?.toString());
    await group.save();

    const populated = await group.populate([
      { path: "admin", select: "username avatar email" },
      { path: "members", select: "username avatar email status" },
    ]);

    const io = getIO();
    io.to(`group_${groupId}`).emit("group_member_removed", {
      groupId,
      memberId: userId?.toString(),
      group: populated,
    });

    res.status(200).json({ message: "Left the group" });
  } catch (error) {
    res.status(500).json({ message: "Failed to leave group", error });
  }
};
