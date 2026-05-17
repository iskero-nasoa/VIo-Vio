import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VioApp — Sign In",
  description: "Sign in to your VioApp account",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #c362df 0%, #f054b8 100%)" }}
    >
      <div className="w-full max-w-[500px]">{children}</div>
    </div>
  );
}
