"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveal engine for the whole site.
 *
 * Targets
 *   [data-reveal]             one element; the value picks a variant (see VARIANTS)
 *   [data-reveal-stagger="N"] when the container enters, each child reveals in
 *                             turn, N ms apart (children are triggered by the
 *                             container, so ones clipped by a horizontal
 *                             scroller still play)
 *   [data-reveal-media]       inside a revealed element: settles from a slight zoom
 *   [data-scroll-section], .animate-in-up-on-view, article.prose > *
 *                             legacy targets; a section that contains finer-grained
 *                             targets is skipped so it doesn't animate twice
 *
 * Choreography
 *   Everything is held hidden from first paint (html.reveal-pending, set by the
 *   boot script, then a WAAPI hold). Nothing plays until the intro starts its
 *   wipe, so the page builds itself as the intro leaves. After that, elements
 *   reveal as they scroll into view; ones that enter together cascade
 *   top-to-bottom, left-to-right.
 *
 * Uses the Web Animations API rather than class toggles, so it never changes
 * attributes React rendered (streamed sections can arrive before hydration).
 */

const EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
const BACK = "cubic-bezier(0.34, 1.56, 0.64, 1)";

type Variant = { from: Keyframe; duration: number; easing: string };

const VARIANTS: Record<string, Variant> = {
  up: { from: { opacity: 0, transform: "translateY(28px)" }, duration: 900, easing: EXPO },
  blur: {
    from: { opacity: 0, transform: "translateY(16px)", filter: "blur(10px)" },
    duration: 1000,
    easing: EXPO,
  },
  scale: { from: { opacity: 0, transform: "scale(0.6)" }, duration: 900, easing: BACK },
  unveil: {
    from: { clipPath: "inset(100% 0 0 0)", transform: "translateY(12px)" },
    duration: 1200,
    easing: EXPO,
  },
  pop: { from: { opacity: 0, transform: "translateY(14px) scale(0.9)" }, duration: 700, easing: EXPO },
};

const NEUTRAL: Record<string, string | number> = {
  opacity: 1,
  transform: "none",
  filter: "blur(0px)",
  clipPath: "inset(0 0 0 0)",
};

const DEFAULT_STEP_MS = 90;
const MAX_DELAY_MS = 1400;
/** Lets the intro's wipe uncover the page a little before the hero starts building. */
const AFTER_INTRO_DELAY_MS = 250;

const LEGACY = "main [data-scroll-section], main .animate-in-up-on-view, main article.prose > *";
const FINE = "[data-reveal], [data-reveal-stagger]";

function variantOf(el: Element): Variant {
  if (el.parentElement?.hasAttribute("data-reveal-stagger")) return VARIANTS.pop;
  return VARIANTS[el.getAttribute("data-reveal") || "up"] ?? VARIANTS.up;
}

function stepOf(el: Element): number {
  const step = el.parentElement?.getAttribute("data-reveal-stagger");
  return step ? Number(step) || DEFAULT_STEP_MS : DEFAULT_STEP_MS;
}

function introIsDone() {
  const html = document.documentElement;
  return (
    html.hasAttribute("data-intro-done") ||
    !document.querySelector(".site-intro")
  );
}

export function ScrollReveal() {
  const pathname = usePathname();

  // Layout effect: holds are applied before the browser paints the new route.
  useLayoutEffect(() => {
    const html = document.documentElement;
    if (
      !window.IntersectionObserver ||
      typeof Element.prototype.animate !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      html.classList.remove("reveal-pending");
      return;
    }

    const seen = new WeakSet<Element>();
    const holds = new Map<Element, Animation>();
    let observer: IntersectionObserver | null = null;
    let readyDelay = 0;

    const reveal = (el: Element, delay: number) => {
      const { from, duration, easing } = variantOf(el);
      const to = Object.fromEntries(Object.keys(from).map((k) => [k, NEUTRAL[k]]));
      // Start the reveal (held at `from` through its delay), then drop the hold.
      el.animate([from, to], { duration, delay, easing, fill: "backwards" });
      el.querySelectorAll("[data-reveal-media]").forEach((media) =>
        media.animate([{ transform: "scale(1.14)" }, { transform: "scale(1)" }], {
          duration: 1600,
          delay,
          easing: EXPO,
          fill: "backwards",
        }),
      );
      holds.get(el)?.cancel();
      holds.delete(el);
    };

    const onIntersect: IntersectionObserverCallback = (entries) => {
      const entering = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => ({ el: entry.target, box: entry.boundingClientRect }))
        .sort((a, b) => Math.round(a.box.top - b.box.top) || a.box.left - b.box.left)
        .flatMap(({ el }) => {
          observer?.unobserve(el);
          // A stagger container stands in for its (held) children.
          return el.hasAttribute("data-reveal-stagger")
            ? [...el.children].filter((child) => holds.has(child))
            : [el];
        });

      let delay = readyDelay;
      entering.forEach((el, i) => {
        if (i > 0) delay = Math.min(delay + stepOf(el), readyDelay + MAX_DELAY_MS);
        reveal(el, delay);
      });
      if (entering.length) readyDelay = 0;
    };

    /** What the observer watches for a held element: stagger children are
     *  triggered by their container, everything else by itself. */
    const watchTargetOf = (el: Element) =>
      el.parentElement?.hasAttribute("data-reveal-stagger") ? el.parentElement : el;

    const isTarget = (el: Element) => {
      // A coarse legacy section with finer targets inside would animate twice.
      if (!el.matches(FINE) && !el.parentElement?.hasAttribute("data-reveal-stagger")) {
        if (el.querySelector(FINE)) return false;
      }
      return true;
    };

    const register = () => {
      const found = document.querySelectorAll(
        `${LEGACY}, main [data-reveal], main [data-reveal-stagger] > *`,
      );
      found.forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (!isTarget(el)) return;
        const { from } = variantOf(el);
        holds.set(el, el.animate([from, from], { duration: 1, fill: "forwards" }));
        observer?.observe(watchTargetOf(el));
      });
    };

    register();
    // The WAAPI holds now hide everything; the CSS pre-paint hide can go.
    html.classList.remove("reveal-pending");

    const start = (delay: number) => {
      if (observer) return;
      readyDelay = delay;
      observer = new IntersectionObserver(onIntersect, {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0,
      });
      holds.forEach((_, el) => observer!.observe(watchTargetOf(el)));
    };

    let failsafe = 0;
    const onIntroDone = () => start(AFTER_INTRO_DELAY_MS);
    if (introIsDone()) {
      start(0);
    } else {
      document.addEventListener("site-intro:done", onIntroDone, { once: true });
      failsafe = window.setTimeout(() => start(0), 10_000);
    }

    // Streamed / lazily mounted sections (GitHub graph, tech stack) arrive later.
    const mutations = new MutationObserver(register);
    const main = document.querySelector("main");
    if (main) mutations.observe(main, { childList: true, subtree: true });

    return () => {
      clearTimeout(failsafe);
      document.removeEventListener("site-intro:done", onIntroDone);
      observer?.disconnect();
      mutations.disconnect();
      holds.forEach((animation) => animation.cancel());
      holds.clear();
    };
  }, [pathname]);

  return null;
}
