"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A card with a soft spotlight that follows the cursor (and lights up its border near
 * the cursor). Only sets two CSS variables on pointer move; the glow is pure CSS
 * (.spotlight-card in globals.css).
 */
export function SpotlightCard({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || e.pointerType !== "mouse" || frame.current) return;
        const { clientX, clientY } = e;
        // At most one update per screen frame.
        frame.current = requestAnimationFrame(() => {
          frame.current = 0;
          const r = el.getBoundingClientRect();
          el.style.setProperty("--mx", `${clientX - r.left}px`);
          el.style.setProperty("--my", `${clientY - r.top}px`);
        });
      }}
      className={cn("spotlight-card", className)}
    >
      {children}
    </div>
  );
}
