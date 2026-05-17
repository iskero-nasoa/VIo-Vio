"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  // Render a placeholder that matches the button size to avoid layout shift
  if (!mounted) return <div style={{ width: 32, height: 32 }} />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="p-2 rounded-lg"
      style={{ color: "var(--muted-foreground)" }}
      onMouseEnter={e => (e.currentTarget.style.background = "var(--secondary)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}
