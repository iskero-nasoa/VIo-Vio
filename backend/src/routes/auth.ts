import { Router } from "express";
import { register, login, getMe, getUsers } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me (protected)
router.get("/me", authMiddleware, getMe);

// GET /api/auth/users (protected)
router.get("/users", authMiddleware, getUsers);

export default router;
