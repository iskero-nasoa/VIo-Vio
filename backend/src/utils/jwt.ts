import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { env } from "../config/env";

interface TokenPayload {
  userId: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId } as TokenPayload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
