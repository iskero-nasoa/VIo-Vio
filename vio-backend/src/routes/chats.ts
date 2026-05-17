import { Router } from "express";
import { getChats, getChat, createDirectChat, deleteChat } from "../controllers/chatController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", getChats);
router.get("/:chatId", getChat);
router.post("/create-direct", createDirectChat);
router.delete("/:chatId", deleteChat);

export default router;
