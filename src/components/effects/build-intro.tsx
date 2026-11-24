"use client";

import { motion, type Transition } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * "Assembly" intro that plays after the 0–100% loader, on the homepage only.
 *
 * It waits underneath the loader. When the loader wipes away it fires
 * "site-intro:build"; then the homepage builds itself out of soft blocks that rise and
 * settle one after another (header, banner, avatar, name, buttons, text, toolbox), a
 * shimmer sweeps across the finished structure, and the blocks dissolve into the real
 * page sitting in exactly the same places. Only then does it hand over to the page
 * (data-intro-done + "site-intro:done", which starts the page's own reveals).
 *
 * Blocks animate transform/opacity only, so it stays smooth. Skipped (instant handover)
 * on other pages and with reduced motion; site-intro.tsx checks for [data-build-intro].
 */

const RISE: Transition = { type: "spring", stiffness: 210, damping: 24, mass: 0.9 };
const STEP = 0.07; // seconds between blocks
const TECH_TILES = 19;

export function BuildIntro() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"wait" | "build" | "dissolve" | "gone">(
    pathname === "/" ? "wait" : "gone",
  );

  useEffect(() => {
    if (phase !== "wait") return;
    const html = document.documentElement;
    if (
      html.hasAttribute("data-intro-done") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setPhase("gone");
      return;
    }
    const onBuild = () => setPhase("build");
    document.addEventListener("site-intro:build", onBuild, { once: true });
    // Safety: never leave it waiting if the loader somehow never hands over.
    const failsafe = window.setTimeout(() => setPhase("gone"), 9000);
    return () => {
      document.removeEventListener("site-intro:build", onBuild);
      window.clearTimeout(failsafe);
    };
  }, [phase]);

  // Build → hand over underneath (the page starts its own reveals while still
  // covered) → dissolve into it once the real content is appearing.
  useEffect(() => {
    if (phase !== "build") return;
    const handOver = window.setTimeout(() => {
      const html = document.documentElement;
      html.classList.remove("intro-lock");
      html.setAttribute("data-intro-done", "");
      document.dispatchEvent(new Event("site-intro:done"));
    }, 1100);
    const dissolve = window.setTimeout(() => setPhase("dissolve"), 2250);
    return () => {
      window.clearTimeout(handOver);
      window.clearTimeout(dissolve);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "dissolve") return;
    const t = window.setTimeout(() => setPhase("gone"), 750);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;
  const building = phase !== "wait";

  // Each block gets the next slot in the build order.
  let order = 0;
  let tilesStart = 0;
  const next = () => order++ * STEP;

  return (
    <motion.div
      data-build-intro
      aria-hidden
      className="bg-grid fixed inset-0 z-[99] overflow-hidden bg-background"
      // .bg-grid sets position: relative; the overlay must stay fixed over the page.
      style={{ position: "fixed" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "dissolve" ? 0 : 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header row (mirrors the real sticky header) */}
      <div className="border-b border-border/50">
        <div className="mx-auto flex h-14 w-full max-w-(--portfolio-content-width) items-center justify-between px-5 sm:px-0">
          <Block building={building} delay={next()} className="h-5 w-8 rounded-md" />
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-4 sm:flex sm:gap-5">
              <Block building={building} delay={next()} className="h-3.5 w-10 rounded" />
              <Block building={building} delay={next()} className="h-3.5 w-10 rounded" />
              <Block building={building} delay={next()} className="h-3.5 w-14 rounded" />
            </div>
            <Block building={building} delay={next()} className="hidden h-8 w-24 rounded-full sm:block" />
            <Block building={building} delay={next()} className="size-7 rounded-full" />
            <Block building={building} delay={next()} className="size-7 rounded-full" />
          </div>
        </div>
      </div>

      {/* Hero (mirrors hero.tsx) */}
      <div className="mx-auto w-full max-w-(--portfolio-content-width) px-5 pt-3 sm:px-0 sm:pt-4">
        <div className="flex flex-col gap-5">
          <Block building={building} delay={next()} className="h-[calc(var(--grid-cell-size)*4.5)] rounded-2xl" />
          <div className="-mt-3 flex justify-end">
            <Block building={building} delay={next()} className="h-3.5 w-28 rounded" />
          </div>
          <div className="-mt-[calc(var(--grid-cell-size)*2)] flex">
            <div className="relative z-10 rounded-full bg-background p-1">
              <Block building={building} delay={next()} className="size-24 rounded-full sm:size-28" />
            </div>
          </div>
          <div>
            <Block building={building} delay={next()} className="h-9 w-[min(70%,22rem)] rounded-lg" />
            <Block building={building} delay={next()} className="mt-2.5 h-4 w-40 rounded" />
            <div className="mt-3 flex gap-3">
              <Block building={building} delay={next()} className="h-6 w-40 rounded-full" />
              <Block building={building} delay={next()} className="h-6 w-28 rounded-full" />
            </div>
            <div className="mt-4 flex gap-2">
              <Block building={building} delay={next()} className="h-8 w-32 rounded-full" />
              <Block building={building} delay={next()} className="h-8 w-28 rounded-full" />
              <Block building={building} delay={next()} className="h-8 w-24 rounded-full" />
            </div>
          </div>
          <div className="max-w-xl space-y-2">
            <Block building={building} delay={next()} className="h-3.5 w-full rounded" />
            <Block building={building} delay={next()} className="h-3.5 w-[92%] rounded" />
            <Block building={building} delay={next()} className="h-3.5 w-[60%] rounded" />
          </div>
          <div className="flex gap-2">
            <Block building={building} delay={next()} className="size-6 rounded-md" />
            <Block building={building} delay={next()} className="size-6 rounded-md" />
            <Block building={building} delay={next()} className="size-6 rounded-md" />
          </div>
        </div>

        {/* Toolbox */}
        <div className="mt-12 sm:mt-16">
          <Block building={building} delay={next()} className="h-3 w-20 rounded" />
          <Block building={building} delay={next()} className="mt-2.5 h-7 w-56 rounded-lg" />
          {(() => {
            tilesStart = order * STEP;
            return null;
          })()}
          <div className="mt-6 flex flex-wrap gap-3">
            {Array.from({ length: TECH_TILES }, (_, i) => (
              <Block key={i} building={building} className="size-[52px] rounded-xl" delay={tilesStart + i * 0.025} />
            ))}
          </div>
        </div>
      </div>

      {/* Light sweeping across the finished structure */}
      {building && (
        <motion.div
          aria-hidden
          className="build-shimmer pointer-events-none absolute inset-y-0 -left-1/3 w-1/3"
          initial={{ x: "0%" }}
          animate={{ x: "420%" }}
          transition={{ duration: 0.9, delay: 1.25, ease: [0.45, 0, 0.25, 1] }}
        />
      )}
    </motion.div>
  );
}

function Block({
  className,
  children,
  delay,
  building,
}: {
  className: string;
  children?: ReactNode;
  delay: number;
  building: boolean;
}) {
  return (
    <motion.div
      className={`build-block ${className}`}
      style={{ willChange: "transform, opacity" }}
      initial={{ opacity: 0, y: 46, scale: 0.94 }}
      animate={building ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{ ...RISE, delay, opacity: { duration: 0.35, delay } }}
    >
      {children}
    </motion.div>
  );
}
