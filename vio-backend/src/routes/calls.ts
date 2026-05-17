import { Router } from "express";
import { getCallHistory } from "../controllers/callController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/", getCallHistory);

export default router;
