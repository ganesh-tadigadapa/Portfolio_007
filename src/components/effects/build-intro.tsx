"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ParticlesIntro } from "./intro/particles";

/**
 * Second-stage intro, played after the 0–100% loader, on the homepage only.
 *
 * It waits underneath the loader. On "site-intro:build" it hands over to the page (so
 * the real content is already revealing underneath) and plays the particle build.
 * Skipped (instant handover) elsewhere and with reduced motion; site-intro.tsx checks
 * for [data-build-intro] to decide.
 */
export function BuildIntro() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"wait" | "run" | "gone">(pathname === "/" ? "wait" : "gone");

  useEffect(() => {
    if (phase !== "wait") return;
    const html = document.documentElement;
    if (html.hasAttribute("data-intro-done") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("gone");
      return;
    }
    const onBuild = () => {
      // This intro is the first screen's entrance: put those elements straight into
      // their final positions (the particle intro measures them right after).
      document.dispatchEvent(new Event("intro:reveal-above-fold"));
      requestAnimationFrame(() => {
        html.classList.remove("intro-lock");
        html.setAttribute("data-intro-done", "");
        document.dispatchEvent(new Event("site-intro:done"));
      });
      setPhase("run");
    };
    document.addEventListener("site-intro:build", onBuild, { once: true });
    const failsafe = window.setTimeout(() => setPhase("gone"), 9000);
    return () => {
      document.removeEventListener("site-intro:build", onBuild);
      window.clearTimeout(failsafe);
    };
  }, [phase]);

  const done = useCallback(() => {
    document.dispatchEvent(new Event("build-intro:finished"));
    setPhase("gone");
  }, []);

  if (phase === "gone") return null;
  return (
    <div
      data-build-intro
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[99] overflow-hidden"
      style={{ position: "fixed" }}
    >
      {phase === "wait" ? (
        <div className="absolute inset-0 bg-background" />
      ) : (
        <ParticlesIntro onDone={done} />
      )}
    </div>
  );
}
