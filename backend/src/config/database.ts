import { execSync } from "child_process";
import path from "path";
import { prisma } from "./prisma";

export async function connectDatabase(): Promise<void> {
  try {
    // Push schema to create/migrate SQLite DB on first run
    execSync("npx prisma db push --skip-generate", {
      cwd: path.resolve(__dirname, "../../"),
      stdio: "pipe",
    });
    await prisma.$connect();
    console.log("✅ SQLite database ready via Prisma");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
}
