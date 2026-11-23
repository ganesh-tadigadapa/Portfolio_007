"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { playThemeClickSound } from "@/lib/theme-click-sound";
import { cn } from "@/lib/utils";

/**
 * Theme switch with a circular reveal: the new theme spreads out from the button
 * until it covers the whole screen (View Transitions API). Browsers without it,
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

    const { left, top, width, height } = button.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    // Radius that reaches the farthest corner, so the circle covers everything.
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });

    transition.ready.then(() => {
      const ease = "cubic-bezier(0.83, 0, 0.17, 1)"; // slow start, fast middle, soft landing
      const duration = 950;
      // New theme: a feathered circle that floods out from the button. The mask is a
      // soft-edged disc (see globals.css); growing its size + keeping it centred on the
      // button gives a glowing, light-like edge instead of a hard cut.
      const end = radius * 2.3;
      document.documentElement.animate(
        {
          maskSize: ["0px 0px", `${end}px ${end}px`],
          maskPosition: [`${x}px ${y}px`, `${x - end / 2}px ${y - end / 2}px`],
        },
        { duration, easing: ease, pseudoElement: "::view-transition-new(root)", fill: "both" },
      );
      // Old theme sinks back as it is covered: a touch smaller, rounded and dimmer.
      document.documentElement.animate(
        {
          transform: ["scale(1)", "scale(0.94)"],
          borderRadius: ["0px", "28px"],
          filter: ["brightness(1)", "brightness(0.55)"],
        },
        { duration, easing: ease, pseudoElement: "::view-transition-old(root)", fill: "both" },
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
