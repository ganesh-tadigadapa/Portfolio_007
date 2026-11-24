"use client";

import { motion, type Transition } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";

/**
 * "Curtains" page transitions for the header nav (in the spirit of motion.dev's
 * Curtains examples): a curtain closes over the page with an effect, the route swaps
 * underneath, and the curtain opens again. Fast (~0.4 s each way) and transform-only,
 * so the GPU composites every frame. One effect per destination:
 *   /          iris    a circle grows from the click point, then shrinks back into it
 *   /about     doors   two panels slide in from the sides and meet, then part again
 *   /projects  blinds  horizontal slats drop shut one after another, then lift open
 * Reduced motion: a plain instant navigation.
 */

type Effect = "iris" | "doors" | "blinds";
const EFFECTS: Record<string, Effect> = { "/": "iris", "/about": "doors", "/projects": "blinds" };

const EVENT = "page-transition:go";
const IN = 0.32; // seconds to close
const OUT = 0.42; // seconds to open
const EASE_IN: Transition["ease"] = [0.65, 0, 0.35, 1];
const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1];
const SLATS = 7;
const SLAT_STAGGER = 0.014;

type Stage = "in" | "out";
type Active = { effect: Effect; x: number; y: number; stage: Stage; id: number };

export function PageTransitionListener() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<Active | null>(null);
  const waitingFor = useRef<string | null>(null);

  // Fetch every curtain destination ahead of time, so the page is ready the moment
  // the curtain closes (no wait on a click).
  useEffect(() => {
    const warm = () => Object.keys(EFFECTS).forEach((href) => router.prefetch(href));
    const idle = window.requestIdleCallback?.(warm, { timeout: 2500 }) ?? window.setTimeout(warm, 1200);
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(idle);
      else clearTimeout(idle);
    };
  }, [router]);

  useEffect(() => {
    const timers: number[] = [];
    const onGo = (e: Event) => {
      const { href, x, y } = (e as CustomEvent<{ href: string; x: number; y: number }>).detail;
      if (waitingFor.current) return;
      waitingFor.current = href;
      router.prefetch(href);
      setActive({ effect: EFFECTS[href] ?? "blinds", x, y, stage: "in", id: Date.now() });
      // Fully closed (incl. the last slat's stagger) → swap the page underneath.
      timers.push(window.setTimeout(() => router.push(href, { scroll: false }), IN * 1000 + 30));
      // Safety net: never leave the curtain closed.
      timers.push(
        window.setTimeout(() => {
          if (waitingFor.current !== href) return;
          waitingFor.current = null;
          setActive((a) => (a ? { ...a, stage: "out" } : a));
        }, 3000),
      );
    };
    document.addEventListener(EVENT, onGo);
    return () => {
      document.removeEventListener(EVENT, onGo);
      timers.forEach(clearTimeout);
    };
  }, [router]);

  // New page rendered behind the curtain → top of page, one frame to paint, open.
  useEffect(() => {
    if (!waitingFor.current || pathname !== waitingFor.current) return;
    waitingFor.current = null;
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setActive((a) => (a ? { ...a, stage: "out" } : a))),
    );
  }, [pathname]);

  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    html.classList.add("modal-lock");
    return () => html.classList.remove("modal-lock");
  }, [active]);

  if (!active) return null;
  const done = () => setActive(null);
  return (
    <div key={active.id} aria-hidden data-lenis-prevent className="fixed inset-0 z-[200] overflow-hidden">
      {active.effect === "iris" && <Iris a={active} onDone={done} />}
      {active.effect === "doors" && <Doors a={active} onDone={done} />}
      {active.effect === "blinds" && <Blinds a={active} onDone={done} />}
    </div>
  );
}

const CURTAIN = "curtain absolute";

function Iris({ a, onDone }: { a: Active; onDone: () => void }) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const r = Math.hypot(Math.max(a.x, w - a.x), Math.max(a.y, h - a.y)) + 2;
  const closing = a.stage === "in";
  return (
    <motion.div
      className={`${CURTAIN} rounded-full`}
      style={{ left: a.x - r, top: a.y - r, width: r * 2, height: r * 2, willChange: "transform" }}
      initial={{ scale: 0 }}
      animate={{ scale: closing ? 1 : 0 }}
      transition={{ duration: closing ? IN + 0.04 : OUT, ease: closing ? EASE_IN : EASE_OUT }}
      onAnimationComplete={() => !closing && onDone()}
    />
  );
}

function Doors({ a, onDone }: { a: Active; onDone: () => void }) {
  const closing = a.stage === "in";
  return (
    <>
      {[-1, 1].map((side) => (
        <motion.div
          key={side}
          className={`${CURTAIN} top-0 h-full w-[calc(50%+1px)]`}
          style={{ [side < 0 ? "left" : "right"]: 0, willChange: "transform" }}
          initial={{ x: `${side * 100}%` }}
          animate={{ x: closing ? "0%" : `${side * 100}%` }}
          transition={{ duration: closing ? IN : OUT, ease: closing ? EASE_IN : EASE_OUT }}
          onAnimationComplete={() => !closing && side === 1 && onDone()}
        />
      ))}
      {/* Seam where the doors meet: a faint light line that fades out as they part. */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/15"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 1 : 0 }}
        transition={{ duration: 0.2, delay: closing ? IN - 0.05 : 0 }}
      />
    </>
  );
}

function Blinds({ a, onDone }: { a: Active; onDone: () => void }) {
  const closing = a.stage === "in";
  return (
    <>
      {Array.from({ length: SLATS }, (_, i) => (
        <motion.div
          key={i}
          className={CURTAIN}
          style={{
            left: 0,
            right: 0,
            top: `${(i * 100) / SLATS}%`,
            height: `calc(${100 / SLATS}% + 1px)`,
            transformOrigin: closing ? "50% 0%" : "50% 100%",
            willChange: "transform",
          }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: closing ? 1 : 0 }}
          transition={{
            duration: closing ? IN - 0.06 : OUT - 0.06,
            ease: closing ? EASE_IN : EASE_OUT,
            delay: i * SLAT_STAGGER,
          }}
          onAnimationComplete={() => !closing && i === SLATS - 1 && onDone()}
        />
      ))}
    </>
  );
}

export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (href === pathname) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault();
    document.dispatchEvent(
      new CustomEvent(EVENT, {
        detail: { href, x: e.clientX || window.innerWidth / 2, y: e.clientY || 0 },
      }),
    );
  };

  return <Link href={href} onClick={handle} {...props} />;
}
