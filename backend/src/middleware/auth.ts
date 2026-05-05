import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import User, { IUser } from "../models/User";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Токен авторизации не предоставлен" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ message: "Пользователь не найден" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Невалидный или истёкший токен" });
  }
}
