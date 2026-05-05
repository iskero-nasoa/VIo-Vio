import { Router, Request, Response } from "express";
import User from "../models/User";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../config/multer";
import path from "path";
import fs from "fs";

const router = Router();

// Search users
router.get("/search", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== "string") {
      res.status(400).json({ message: "Search query is required" });
      return;
    }

    const currentUserId = req.user?._id;

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        {
          $or: [
            { username: { $regex: q, $options: "i" } },
            { email: { $regex: q, $options: "i" } },
          ],
        },
      ],
    })
      .limit(10)
      .select("username email avatar status statusText");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "User search failed" });
  }
});

// Get own profile
router.get("/me", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Update own profile
router.patch("/me", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, statusText, phone, status } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (description !== undefined) user.description = description;
    if (statusText !== undefined) user.statusText = statusText;
    if (phone !== undefined) user.phone = phone;
    if (status !== undefined) user.status = status;

    await user.save();
    res.status(200).json(user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
});

// Upload avatar
router.put("/me/avatar", authMiddleware, upload.single("avatar"), async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📂 Avatar upload request received");
    console.log("📝 Content-Type:", req.headers["content-type"]);
    if (!req.file) {
      console.error("❌ No file in request");
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Delete old avatar if exists
    if (user.avatar) {
      // Remove leading slash to make it relative to process.cwd()
      const relativePath = user.avatar.replace(/^\//, "");
      const oldPath = path.join(process.cwd(), relativePath);
      
      console.log(`🗑️ Attempting to delete old avatar: ${oldPath}`);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
          console.log("✅ Old avatar deleted");
        } catch (unlinkErr) {
          console.warn("⚠️ Failed to delete old avatar file:", unlinkErr);
        }
      }
    }

    const normalizedPath = req.file.path.split(path.sep).join("/");
    const match = normalizedPath.match(/uploads\/(.*)/);
    const url = match ? `/uploads/${match[1]}` : `/${normalizedPath}`;

    console.log(`💾 Saving new avatar path: ${url}`);
    user.avatar = url;
    await user.save();

    res.status(200).json({ avatar: url });
  } catch (error) {
    console.error("💥 Avatar upload error:", error);
    res.status(500).json({ message: "Avatar upload failed" });
  }
});

// Get user by ID (public)
router.get("/:userId", authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json(user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
