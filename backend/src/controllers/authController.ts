import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/jwt";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      res.status(400).json({ message: "Все поля обязательны" });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        res.status(409).json({ message: "Пользователь с таким email уже существует" });
        return;
      }
      res.status(409).json({ message: "Имя пользователя уже занято" });
      return;
    }

    // Create user
    const user = await User.create({ username, email, password });
    const token = generateToken(user._id.toString());

    res.status(201).json({
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    if ((error as { name?: string }).name === "ValidationError") {
      const mongoError = error as { errors: Record<string, { message: string }> };
      const messages = Object.values(mongoError.errors).map((e) => e.message);
      res.status(400).json({ message: messages.join(". ") });
      return;
    }
    console.error("Register error:", error);
    res.status(500).json({ message: "Ошибка сервера при регистрации" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email и пароль обязательны" });
      return;
    }

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      res.status(401).json({ message: "Неверный email или пароль" });
      return;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Неверный email или пароль" });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      token,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Ошибка сервера при входе" });
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Не авторизован" });
      return;
    }
    res.json(req.user.toPublicJSON());
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const currentUserId = req.user?._id;
    // Return all users except the current user
    const users = await User.find({ _id: { $ne: currentUserId } }).select("-password");
    res.json(users);
  } catch (error) {
    console.error("GetUsers error:", error);
    res.status(500).json({ message: "Ошибка сервера при получении списка пользователей" });
  }
}
