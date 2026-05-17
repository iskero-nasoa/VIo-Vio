import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { getIO } from "../config/socket";

const groupInclude = {
  admin: { select: { id: true, username: true, avatar: true, email: true } },
  members: {
    include: {
      user: { select: { id: true, username: true, avatar: true, email: true, status: true } },
    },
  },
  messages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: { sender: { select: { id: true, username: true, avatar: true } } },
  },
};

function formatGroup(g: any) {
  return {
    _id: g.id,
    id: g.id,
    name: g.name,
    description: g.description,
    avatar: g.avatar,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
    admin: { _id: g.admin.id, ...g.admin },
    members: g.members.map((m: any) => ({ _id: m.user.id, ...m.user })),
    messages: (g.messages || []).map((m: any) => ({
      _id: m.id,
      text: m.text,
      createdAt: m.createdAt,
      senderUsername: m.sender?.username,
      senderId: m.sender ? { _id: m.sender.id, ...m.sender } : m.senderId,
    })),
  };
}

export const createGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { name, description } = req.body;
    // Accept both "memberIds" and "members" keys from the frontend
    const memberIds: string[] = req.body.memberIds || req.body.members || [];

    if (!name?.trim()) {
      res.status(400).json({ message: "Group name is required" });
      return;
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      res.status(400).json({ message: "At least one member is required" });
      return;
    }

    const allMemberIds = Array.from(new Set([userId, ...memberIds])) as string[];

    const group = await prisma.group.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        adminId: userId,
        members: { create: allMemberIds.map((uid) => ({ userId: uid })) },
      },
      include: groupInclude,
    });

    const formatted = formatGroup(group);
    const io = getIO();
    allMemberIds.forEach((uid) => io.to(`user_${uid}`).emit("group_created", formatted));

    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to create group", error });
  }
};

export const getGroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const groups = await prisma.group.findMany({
      where: { members: { some: { userId } } },
      include: groupInclude,
      orderBy: { updatedAt: "desc" },
    });
    res.status(200).json(groups.map(formatGroup));
  } catch (error) {
    res.status(500).json({ message: "Failed to get groups", error });
  }
};

export const getGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const groupId = req.params.groupId as string;
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: groupInclude,
    });
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }
    res.status(200).json(formatGroup(group));
  } catch (error) {
    res.status(500).json({ message: "Failed to get group", error });
  }
};

export const getGroupMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const groupId = req.params.groupId as string;
    const userId = req.user?.id as string;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;

    const deletedForMe = await prisma.deletedMessage.findMany({
      where: { userId },
      select: { messageId: true },
    });
    const deletedIds = deletedForMe.map((d) => d.messageId);

    const messages = await prisma.message.findMany({
      where: { groupId, id: { notIn: deletedIds } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        sender: { select: { id: true, username: true, avatar: true } },
        replyTo: { include: { sender: { select: { id: true, username: true } } } },
      },
    });

    res.status(200).json(
      messages.reverse().map((m) => ({
        _id: m.id,
        id: m.id,
        groupId: m.groupId,
        text: m.text,
        attachments: JSON.parse(m.attachments || "[]"),
        createdAt: m.createdAt,
        senderId: m.sender ? { _id: m.sender.id, ...m.sender } : m.senderId,
        senderUsername: m.sender?.username,
        senderAvatar: m.sender?.avatar,
        replyTo: m.replyTo
          ? { _id: m.replyTo.id, text: m.replyTo.text, senderId: m.replyTo.sender }
          : null,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: "Failed to get group messages", error });
  }
};

export const updateGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const groupId = req.params.groupId as string;
    const userId = req.user?.id as string;
    const { name, description, avatar } = req.body;

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.adminId !== userId) {
      res.status(403).json({ message: "Only admin can update the group" });
      return;
    }

    const updated = await prisma.group.update({
      where: { id: groupId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(avatar !== undefined && { avatar }),
      },
      include: groupInclude,
    });

    const formatted = formatGroup(updated);
    getIO().to(`group_${groupId}`).emit("group_updated", formatted);
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to update group", error });
  }
};

export const deleteGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const groupId = req.params.groupId as string;
    const userId = req.user?.id as string;

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.adminId !== userId) {
      res.status(403).json({ message: "Only admin can delete the group" });
      return;
    }

    getIO().to(`group_${groupId}`).emit("group_deleted", { groupId });
    await prisma.group.delete({ where: { id: groupId } });
    res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete group", error });
  }
};

export const addMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const groupId = req.params.groupId as string;
    const { userId: newMemberId } = req.body;
    const adminId = req.user?.id as string;

    const group = await prisma.group.findUnique({ where: { id: groupId }, include: { members: true } });
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.adminId !== adminId) {
      res.status(403).json({ message: "Only admin can add members" });
      return;
    }

    if (group.members.some((m) => m.userId === newMemberId)) {
      res.status(400).json({ message: "User is already a member" });
      return;
    }

    const updated = await prisma.group.update({
      where: { id: groupId },
      data: { members: { create: { userId: newMemberId } } },
      include: groupInclude,
    });

    const formatted = formatGroup(updated);
    const io = getIO();
    io.to(`group_${groupId}`).emit("group_member_added", { groupId, group: formatted });
    io.to(`user_${newMemberId}`).emit("group_created", formatted);
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to add member", error });
  }
};

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const groupId = req.params.groupId as string;
    const memberId = req.params.memberId as string;
    const adminId = req.user?.id as string;

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.adminId !== adminId) {
      res.status(403).json({ message: "Only admin can remove members" });
      return;
    }

    if (memberId === group.adminId) {
      res.status(400).json({ message: "Cannot remove the admin" });
      return;
    }

    await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId: memberId } } });

    const updated = await prisma.group.findUnique({ where: { id: groupId }, include: groupInclude });
    const formatted = formatGroup(updated!);
    const io = getIO();
    io.to(`group_${groupId}`).emit("group_member_removed", { groupId, memberId, group: formatted });
    io.to(`user_${memberId}`).emit("group_removed", { groupId });
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to remove member", error });
  }
};

export const leaveGroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const groupId = req.params.groupId as string;
    const userId = req.user?.id as string;

    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) {
      res.status(404).json({ message: "Group not found" });
      return;
    }

    if (group.adminId === userId) {
      res.status(400).json({ message: "Admin cannot leave. Transfer admin or delete the group." });
      return;
    }

    await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId } } });

    const updated = await prisma.group.findUnique({ where: { id: groupId }, include: groupInclude });
    const formatted = formatGroup(updated!);
    getIO().to(`group_${groupId}`).emit("group_member_removed", { groupId, memberId: userId, group: formatted });
    res.status(200).json({ message: "Left the group" });
  } catch (error) {
    res.status(500).json({ message: "Failed to leave group", error });
  }
};
