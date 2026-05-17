import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { generateToken } from "../utils/jwt";
import { userToPublic } from "../utils/userHelpers";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ message: "Все поля обязательны" });
      return;
    }

    if (username.length < 3 || username.length > 30) {
      res.status(400).json({ message: "Имя пользователя: минимум 3, максимум 30 символов" });
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      res.status(400).json({ message: "Только буквы, цифры и _" });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: "Пароль: минимум 6 символов" });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { username }] },
    });

    if (existing) {
      if (existing.email === email.toLowerCase()) {
        res.status(409).json({ message: "Пользователь с таким email уже существует" });
      } else {
        res.status(409).json({ message: "Имя пользователя уже занято" });
      }
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);
    res.status(201).json({ token, user: userToPublic(user) });
  } catch (error) {
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

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      res.status(401).json({ message: "Неверный email или пароль" });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: "Неверный email или пароль" });
      return;
    }

    const token = generateToken(user.id);
    res.json({ token, user: userToPublic(user) });
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
    res.json(userToPublic(req.user));
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
}

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const currentUserId = req.user?.id;
    const users = await prisma.user.findMany({
      where: { id: { not: currentUserId } },
      select: {
        id: true, username: true, email: true, avatar: true,
        description: true, status: true, statusText: true,
        phone: true, role: true, createdAt: true,
      },
    });
    res.json(users.map((u) => ({ ...u, _id: u.id })));
  } catch (error) {
    console.error("GetUsers error:", error);
    res.status(500).json({ message: "Ошибка сервера при получении пользователей" });
  }
}
