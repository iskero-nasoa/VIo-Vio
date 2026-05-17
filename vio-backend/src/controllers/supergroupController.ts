import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { getIO } from "../config/socket";

const sgInclude = {
  admin: { select: { id: true, username: true, avatar: true } },
  members: {
    include: {
      user: { select: { id: true, username: true, avatar: true, status: true } },
    },
  },
  topics: { orderBy: { createdAt: "asc" as const } },
};

const msgInclude = {
  sender: { select: { id: true, username: true, avatar: true } },
  replyTo: { include: { sender: { select: { id: true, username: true } } } },
};

function formatSG(sg: any) {
  return {
    _id: sg.id,
    id: sg.id,
    name: sg.name,
    description: sg.description,
    avatar: sg.avatar,
    isPublic: sg.isPublic,
    maxMembers: sg.maxMembers,
    createdAt: sg.createdAt,
    updatedAt: sg.updatedAt,
    admin: { _id: sg.admin.id, ...sg.admin },
    members: (sg.members || []).map((m: any) => ({ _id: m.user.id, ...m.user, role: m.role })),
    topics: (sg.topics || []).map((t: any) => ({
      _id: t.id, id: t.id, name: t.name, description: t.description,
      supergroupId: t.supergroupId, createdAt: t.createdAt, updatedAt: t.updatedAt,
    })),
  };
}

function formatTopic(t: any) {
  return { _id: t.id, id: t.id, name: t.name, description: t.description, supergroupId: t.supergroupId, createdAt: t.createdAt, updatedAt: t.updatedAt };
}

function formatMsg(m: any) {
  return {
    _id: m.id, id: m.id, topicId: m.topicId,
    text: m.text,
    attachments: JSON.parse(m.attachments || "[]"),
    createdAt: m.createdAt,
    senderId: m.sender ? { _id: m.sender.id, ...m.sender } : m.senderId,
    senderUsername: m.sender?.username,
    senderAvatar: m.sender?.avatar,
    replyTo: m.replyTo ? { _id: m.replyTo.id, text: m.replyTo.text, senderId: m.replyTo.sender } : null,
  };
}

// ── Supergroups ──────────────────────────────────────────────────

export const createSupergroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = req.user?.id as string;
    const { name, description, isPublic, maxMembers } = req.body;
    const memberIds: string[] = Array.isArray(req.body.memberIds)
      ? req.body.memberIds
      : Array.isArray(req.body.members)
      ? req.body.members
      : [];

    if (!name?.trim()) { res.status(400).json({ message: "Supergroup name is required" }); return; }

    const allIds = Array.from(new Set([adminId, ...memberIds])) as string[];

    const sg = await prisma.supergroup.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
        maxMembers: maxMembers ? Number(maxMembers) : 1000,
        adminId,
        members: { create: allIds.map((uid) => ({ userId: uid, role: uid === adminId ? "admin" : "member" })) },
        topics: { create: [{ name: "General", description: "Main channel" }] },
      },
      include: sgInclude,
    });

    const formatted = formatSG(sg);
    const io = getIO();
    allIds.forEach((uid) => io.to(`user_${uid}`).emit("supergroup_created", formatted));
    res.status(201).json(formatted);
  } catch (error) {
    console.error("createSupergroup:", error);
    res.status(500).json({ message: "Failed to create supergroup" });
  }
};

export const getSupergroups = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const list = await prisma.supergroup.findMany({
      where: { members: { some: { userId } } },
      include: sgInclude,
      orderBy: { updatedAt: "desc" },
    });
    res.json(list.map(formatSG));
  } catch (error) {
    res.status(500).json({ message: "Failed to get supergroups" });
  }
};

export const getSupergroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const sg = await prisma.supergroup.findUnique({ where: { id }, include: sgInclude });
    if (!sg) { res.status(404).json({ message: "Supergroup not found" }); return; }
    res.json(formatSG(sg));
  } catch (error) {
    res.status(500).json({ message: "Failed to get supergroup" });
  }
};

export const updateSupergroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id as string;
    const sg = await prisma.supergroup.findUnique({ where: { id } });
    if (!sg) { res.status(404).json({ message: "Supergroup not found" }); return; }
    if (sg.adminId !== userId) { res.status(403).json({ message: "Admin only" }); return; }

    const { name, description, isPublic, maxMembers, avatar } = req.body;
    const updated = await prisma.supergroup.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
        ...(maxMembers !== undefined && { maxMembers: Number(maxMembers) }),
        ...(avatar !== undefined && { avatar }),
      },
      include: sgInclude,
    });
    const formatted = formatSG(updated);
    getIO().to(`supergroup_${id}`).emit("supergroup_updated", formatted);
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to update supergroup" });
  }
};

export const deleteSupergroup = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id as string;
    const sg = await prisma.supergroup.findUnique({ where: { id } });
    if (!sg) { res.status(404).json({ message: "Supergroup not found" }); return; }
    if (sg.adminId !== userId) { res.status(403).json({ message: "Admin only" }); return; }

    getIO().to(`supergroup_${id}`).emit("supergroup_deleted", { supergroupId: id });
    await prisma.supergroup.delete({ where: { id } });
    res.json({ message: "Supergroup deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete supergroup" });
  }
};

export const addSupergroupMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const adminId = req.user?.id as string;
    const { userId: newUserId } = req.body;

    const sg = await prisma.supergroup.findUnique({ where: { id }, include: { members: true } });
    if (!sg) { res.status(404).json({ message: "Supergroup not found" }); return; }
    if (sg.adminId !== adminId) { res.status(403).json({ message: "Admin only" }); return; }
    if (sg.members.some((m) => m.userId === newUserId)) { res.status(400).json({ message: "Already a member" }); return; }

    const updated = await prisma.supergroup.update({
      where: { id },
      data: { members: { create: { userId: newUserId } } },
      include: sgInclude,
    });
    const formatted = formatSG(updated);
    const io = getIO();
    io.to(`supergroup_${id}`).emit("supergroup_member_added", { supergroupId: id, group: formatted });
    io.to(`user_${newUserId}`).emit("supergroup_created", formatted);
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to add member" });
  }
};

export const removeSupergroupMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const memberId = req.params.memberId as string;
    const adminId = req.user?.id as string;

    const sg = await prisma.supergroup.findUnique({ where: { id } });
    if (!sg) { res.status(404).json({ message: "Supergroup not found" }); return; }
    if (sg.adminId !== adminId) { res.status(403).json({ message: "Admin only" }); return; }
    if (memberId === sg.adminId) { res.status(400).json({ message: "Cannot remove the admin" }); return; }

    await prisma.supergroupMember.delete({ where: { supergroupId_userId: { supergroupId: id, userId: memberId } } });
    const io = getIO();
    io.to(`supergroup_${id}`).emit("supergroup_member_removed", { supergroupId: id, memberId });
    io.to(`user_${memberId}`).emit("supergroup_removed", { supergroupId: id });
    res.json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove member" });
  }
};

export const leaveSupergroupHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.id as string;

    const sg = await prisma.supergroup.findUnique({ where: { id } });
    if (!sg) { res.status(404).json({ message: "Supergroup not found" }); return; }
    if (sg.adminId === userId) { res.status(400).json({ message: "Admin cannot leave. Delete instead." }); return; }

    await prisma.supergroupMember.delete({ where: { supergroupId_userId: { supergroupId: id, userId } } });
    getIO().to(`supergroup_${id}`).emit("supergroup_member_removed", { supergroupId: id, memberId: userId });
    res.json({ message: "Left supergroup" });
  } catch (error) {
    res.status(500).json({ message: "Failed to leave supergroup" });
  }
};

export const getSupergroupMessages = (_req: Request, res: Response) => res.json([]);

// ── Topics ───────────────────────────────────────────────────────

export const getTopics = async (req: Request, res: Response): Promise<void> => {
  try {
    const supergroupId = req.params.id as string;
    const topics = await prisma.topic.findMany({ where: { supergroupId }, orderBy: { createdAt: "asc" } });
    res.json(topics.map(formatTopic));
  } catch (error) {
    res.status(500).json({ message: "Failed to get topics" });
  }
};

export const createTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const supergroupId = req.params.id as string;
    const adminId = req.user?.id as string;
    const { name, description } = req.body;

    if (!name?.trim()) { res.status(400).json({ message: "Topic name is required" }); return; }

    const sg = await prisma.supergroup.findUnique({ where: { id: supergroupId } });
    if (!sg) { res.status(404).json({ message: "Supergroup not found" }); return; }
    if (sg.adminId !== adminId) { res.status(403).json({ message: "Admin only" }); return; }

    const topic = await prisma.topic.create({ data: { supergroupId, name: name.trim(), description: description?.trim() || "" } });
    const formatted = formatTopic(topic);
    getIO().to(`supergroup_${supergroupId}`).emit("topic_created", { supergroupId, topic: formatted });
    res.status(201).json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to create topic" });
  }
};

export const updateTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const supergroupId = req.params.id as string;
    const topicId = req.params.topicId as string;
    const adminId = req.user?.id as string;
    const { name, description } = req.body;

    const sg = await prisma.supergroup.findUnique({ where: { id: supergroupId } });
    if (!sg) { res.status(404).json({ message: "Supergroup not found" }); return; }
    if (sg.adminId !== adminId) { res.status(403).json({ message: "Admin only" }); return; }

    const topic = await prisma.topic.update({ where: { id: topicId }, data: { ...(name !== undefined && { name: name.trim() }), ...(description !== undefined && { description: description.trim() }) } });
    const formatted = formatTopic(topic);
    getIO().to(`supergroup_${supergroupId}`).emit("topic_updated", { supergroupId, topic: formatted });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to update topic" });
  }
};

export const deleteTopic = async (req: Request, res: Response): Promise<void> => {
  try {
    const supergroupId = req.params.id as string;
    const topicId = req.params.topicId as string;
    const adminId = req.user?.id as string;

    const sg = await prisma.supergroup.findUnique({ where: { id: supergroupId } });
    if (!sg) { res.status(404).json({ message: "Supergroup not found" }); return; }
    if (sg.adminId !== adminId) { res.status(403).json({ message: "Admin only" }); return; }

    const count = await prisma.topic.count({ where: { supergroupId } });
    if (count <= 1) { res.status(400).json({ message: "Cannot delete the last topic" }); return; }

    await prisma.topic.delete({ where: { id: topicId } });
    getIO().to(`supergroup_${supergroupId}`).emit("topic_deleted", { supergroupId, topicId });
    res.json({ message: "Topic deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete topic" });
  }
};

export const getTopicMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const topicId = req.params.topicId as string;
    const userId = req.user?.id as string;
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 50;

    const deletedIds = (await prisma.deletedMessage.findMany({ where: { userId }, select: { messageId: true } })).map((d) => d.messageId);

    const messages = await prisma.message.findMany({
      where: { topicId, id: { notIn: deletedIds } },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: msgInclude,
    });

    res.json(messages.reverse().map(formatMsg));
  } catch (error) {
    res.status(500).json({ message: "Failed to get topic messages" });
  }
};
