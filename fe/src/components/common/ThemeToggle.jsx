"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-xl border border-(--color-border) bg-(--color-surface)" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-(--color-border) bg-(--color-surface)/90 backdrop-blur-md text-(--color-text-secondary) shadow-sm transition-all duration-300 hover:border-(--color-primary-light) hover:bg-(--color-surface-hover) hover:text-(--color-text-primary) hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary)"
      aria-label={`Beralih ke mode ${isDark ? "Terang" : "Gelap"}`}
      title={`Beralih ke mode ${isDark ? "Terang" : "Gelap"}`}
    >
      {isDark ? (
        <Sun
          size={18}
          className="text-amber-400 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
        />
      ) : (
        <Moon
          size={18}
          className="text-indigo-600 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110 dark:text-indigo-400"
        />
      )}
    </button>
  );
}

