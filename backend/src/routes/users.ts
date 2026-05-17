import { Router, Request, Response } from "express";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../config/multer";
import { prisma } from "../config/prisma";
import { userToPublic } from "../utils/userHelpers";
import path from "path";
import fs from "fs";

const router = Router();

const publicSelect = {
  id: true, username: true, email: true, avatar: true,
  description: true, status: true, statusText: true,
  phone: true, role: true, createdAt: true,
};

router.get("/search", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    const currentUserId = req.user?.id;
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        OR: [
          { username: { contains: q } },
          { email: { contains: q } },
        ],
      },
      take: 10,
      select: publicSelect,
    });

    res.status(200).json(users.map((u) => ({ ...u, _id: u.id })));
  } catch (error) {
    res.status(500).json({ message: "User search failed" });
  }
});

router.get("/me", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(userToPublic(req.user));
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.patch("/me", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id as string;
    const { description, statusText, phone, status } = req.body;

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(description !== undefined && { description }),
        ...(statusText !== undefined && { statusText }),
        ...(phone !== undefined && { phone }),
        ...(status !== undefined && { status }),
      },
    });

    res.status(200).json(userToPublic(updated));
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
});

router.put("/me/avatar", authMiddleware, upload.single("avatar"), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const userId = req.user?.id as string;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.avatar) {
      const relativePath = user.avatar.replace(/^\//, "");
      const oldPath = path.join(process.cwd(), relativePath);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch {}
      }
    }

    const normalizedPath = req.file.path.split(path.sep).join("/");
    const match = normalizedPath.match(/uploads\/(.*)/);
    const avatarUrl = match ? `/uploads/${match[1]}` : `/${normalizedPath}`;

    await prisma.user.update({ where: { id: userId }, data: { avatar: avatarUrl } });
    res.status(200).json({ avatar: avatarUrl });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Avatar upload failed" });
  }
});

router.get("/:userId", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: publicSelect });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ ...user, _id: user.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
