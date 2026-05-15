"use client";
import { useTheme } from "next-themes";
import { useLayoutEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useLayoutEffect(() => setMounted(true), []);

  if (!mounted) return <span className="inline-block w-9 h-9" aria-hidden />;
  const isDark = resolvedTheme === "dark";

  return (
    <button type="button" onClick={() => setTheme(isDark ? "light" : "dark")} 
      className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-surface hover:bg-surface-muted transition">
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
