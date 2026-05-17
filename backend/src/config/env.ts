import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface EnvConfig {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  NODE_ENV: string;
}

function getEnv(): EnvConfig {
  const { PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, CORS_ORIGIN, NODE_ENV } = process.env;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required in .env");
  }

  return {
    PORT: parseInt(PORT || "4000", 10),
    DATABASE_URL: DATABASE_URL || "file:./dev.db",
    JWT_SECRET,
    JWT_EXPIRES_IN: JWT_EXPIRES_IN || "7d",
    CORS_ORIGIN: CORS_ORIGIN || "http://localhost:3000",
    NODE_ENV: NODE_ENV || "development",
  };
}

export const env = getEnv();
