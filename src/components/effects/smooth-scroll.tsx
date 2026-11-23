"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Smooth, weighted page scrolling (Lenis). It still drives the real window scroll,
 * so position: sticky, scroll-driven CSS animations and IntersectionObservers keep
 * working. Touch devices keep their native scrolling (already smooth), and it is
 * off entirely for people who prefer reduced motion.
 *
 * - Paused while the intro is on screen (html.intro-lock).
 * - Jumps to the top on route changes.
 * - Elements with data-lenis-prevent (e.g. the command menu list) scroll natively.
 */
export function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.09, // lower = floatier; 0.09 feels weighted but still responsive
      smoothWheel: true,
      wheelMultiplier: 0.95,
      anchors: true,
    });
    lenisRef.current = lenis;

    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });

    // Follow the intro's scroll lock.
    const html = document.documentElement;
    // (Dialogs don't stop Lenis: a stopped Lenis swallows every wheel event, including
    // inside the dialog. Dialogs mark themselves data-lenis-prevent instead, and
    // html.modal-lock's overflow: hidden keeps the page still.)
    const sync = () => (html.classList.contains("intro-lock") ? lenis.stop() : lenis.start());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}
