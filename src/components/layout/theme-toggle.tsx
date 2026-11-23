"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { playThemeClickSound } from "@/lib/theme-click-sound";
import { cn } from "@/lib/utils";

/**
 * Theme switch with a diagonal light-sweep: the new theme pours across the screen
 * from the button's corner with a wide, soft edge (View Transitions API). Browsers without it,
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
    if (!document.startViewTransition || reduceMotion || !button.current) {
      setTheme(next);
      return;
    }

    // Sweep away from the button: from the top-right corner it pours down and left.
    const { left, top, width, height } = button.current.getBoundingClientRect();
    const fromRight = left + width / 2 > innerWidth / 2;
    const fromBottom = top + height / 2 > innerHeight / 2;
    document.documentElement.style.setProperty(
      "--wipe-dir",
      `to ${fromBottom ? "top" : "bottom"} ${fromRight ? "left" : "right"}`,
    );

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    transition.ready.then(() => {
      // --wipe is the middle of the soft edge along the diagonal: from fully before the
      // page (-30%) to fully past it (130%). See globals.css.
      document.documentElement.animate(
        { "--wipe": ["-30%", "130%"] } as PropertyIndexedKeyframes,
        {
          duration: 900,
          easing: "cubic-bezier(0.65, 0, 0.35, 1)",
          pseudoElement: "::view-transition-new(root)",
          fill: "both",
        },
      );
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
