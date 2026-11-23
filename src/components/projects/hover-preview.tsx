"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Plays a project's live-site recording over its still cover, only while the card
 * is hovered (or focused from the keyboard). Nothing is downloaded until the first
 * hover, so the page stays light; afterwards it simply fades in and out.
 */
export function HoverPreview({ src, title }: { src: string; title: string }) {
  const marker = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(false); // loaded at least once
  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = marker.current;
    const card = (el?.closest(".group") as HTMLElement | null) ?? el?.parentElement ?? null;
    if (!card) return;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const on = () => { setArmed(true); setActive(true); };
    const off = () => setActive(false);
    if (canHover) {
      card.addEventListener("pointerenter", on);
      card.addEventListener("pointerleave", off);
    }
    card.addEventListener("focusin", on);
    card.addEventListener("focusout", off);
    return () => {
      card.removeEventListener("pointerenter", on);
      card.removeEventListener("pointerleave", off);
      card.removeEventListener("focusin", on);
      card.removeEventListener("focusout", off);
    };
  }, []);

  const show = active && ready;

  return (
    <>
      <span ref={marker} aria-hidden className="hidden" />
      {armed && (
        // eslint-disable-next-line @next/next/no-img-element -- animated WebP, served as-is
        <img
          src={src}
          alt={`${title} live preview`}
          onLoad={() => setReady(true)}
          className={cn(
            "pointer-events-none absolute inset-0 size-full object-cover object-top transition-opacity duration-500",
            show ? "opacity-100" : "opacity-0",
          )}
        />
      )}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur transition-all duration-300",
          active ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
        )}
      >
        <span className={cn("size-1.5 rounded-full bg-emerald-400", show ? "animate-pulse" : "")} />
        {show || !active ? "Live demo" : "Loading demo"}
      </span>
    </>
  );
}
