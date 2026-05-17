import { Router } from "express";
import { createMessageRest, getMessages, deleteMessage, deleteMessageForMe, editMessage, toggleReaction } from "../controllers/messageController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/:chatId", getMessages);
router.post("/", createMessageRest);
router.delete("/:messageId", deleteMessage);
router.put("/:messageId/delete-for-me", deleteMessageForMe);
router.patch("/:messageId", editMessage);
router.post("/:messageId/reactions", toggleReaction);

export default router;
