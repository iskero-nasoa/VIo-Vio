import { Router, Request, Response } from "express";
import { upload } from "../config/multer";
import { authMiddleware } from "../middleware/auth";
import path from "path";

const router = Router();

router.post("/", authMiddleware, upload.single("file"), (req: Request, res: Response): void => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file provided" });
      return;
    }

    const isImage = req.file.mimetype.startsWith("image/");
    const isVideo = req.file.mimetype.startsWith("video/");

    // Check specific size limits
    if (isImage && req.file.size > 5 * 1024 * 1024) {
      res.status(400).json({ message: "Image exceeds 5MB limit" });
      return;
    }

    if (isVideo && req.file.size > 50 * 1024 * 1024) {
      res.status(400).json({ message: "Video exceeds 50MB limit" });
      return;
    }

    const type = isImage ? "image" : "video";
    // We get the path relative to the process.cwd() like uploads/images/file.jpg
    // Let's create a URL that the frontend can fetch
    const normalizedPath = req.file.path.split(path.sep).join("/");
    // Extract everything starting from 'uploads'
    const match = normalizedPath.match(/uploads\/(.*)/);
    const url = match ? `/uploads/${match[1]}` : `/${normalizedPath}`;

    res.status(200).json({
      type,
      url,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "File upload failed" });
  }
});

export default router;
