import { Router } from "express";
import { createMessageRest, getMessages, deleteMessage, editMessage } from "../controllers/messageController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/:chatId", getMessages);
router.post("/", createMessageRest);
router.delete("/:messageId", deleteMessage);
router.patch("/:messageId", editMessage);

export default router;
