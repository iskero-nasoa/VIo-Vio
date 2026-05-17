import { Router } from "express";
import { createMessageRest, getMessages, deleteMessage, editMessage, toggleReaction } from "../controllers/messageController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/:chatId", getMessages);
router.post("/", createMessageRest);
router.delete("/:messageId", deleteMessage);
router.patch("/:messageId", editMessage);
router.post("/:messageId/reactions", toggleReaction);

export default router;
