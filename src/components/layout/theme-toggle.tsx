"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { playThemeClickSound } from "@/lib/theme-click-sound";
import { cn } from "@/lib/utils";

/**
 * Theme switch with a diagonal sweep: the new theme slides across the screen with a
 * soft edge (View Transitions API). Browsers without it,
 * and people who prefer reduced motion, get an instant switch.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    playThemeClickSound();
    const next = resolvedTheme === "dark" ? "light" : "dark";

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduceMotion) {
      setTheme(next);
      return;
    }

    // The sweep itself is pure CSS (globals.css); just swap the theme inside the transition.
    document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
  };

  if (!mounted) {
    return <span className={cn("inline-flex size-8 items-center justify-center", className)} />;
  }

  return (
    <button
      ref={button}
      type="button"
      aria-label="Toggle theme"
      onClick={toggleTheme}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary active:scale-95",
        className,
      )}
    >
      <span key={resolvedTheme} className="theme-icon-in inline-flex">
        {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </span>
    </button>
  );
}
