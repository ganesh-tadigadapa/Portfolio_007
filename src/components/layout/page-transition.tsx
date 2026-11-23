"use client";

import { motion, type Transition } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";

/**
 * Page transitions for the header nav: cover → swap → reveal.
 *
 * 1. Full-screen panels move in and cover the page, with the destination's name.
 * 2. The route changes underneath while covered (no half-rendered frame is ever seen).
 * 3. The panels move away and reveal the new page.
 *
 * Every moving piece animates only transform/opacity, which the GPU composites, so it
 * holds a steady frame rate. Each destination has its own move:
 *   /          "iris"    a circle grows from the click point, then shrinks back into it
 *   /about     "rows"    horizontal bars sweep across in a cascade
 *   /projects  "columns" vertical columns rise in a wave
 * The panels are a lifted charcoal with a faint light edge, in both themes.
 * Reduced motion: a plain instant navigation.
 */

type Variant = "iris" | "rows" | "columns";
type Detail = { href: string; x: number; y: number };

const ROUTES: Record<string, { variant: Variant; label: string; index: string }> = {
  "/": { variant: "iris", label: "Home", index: "01" },
  "/about": { variant: "rows", label: "About", index: "02" },
  "/projects": { variant: "columns", label: "Projects", index: "03" },
};

const EVENT = "page-transition:go";
const EASE: Transition["ease"] = [0.76, 0, 0.24, 1];
const COLUMNS = 6;
const ROWS = 5;
// How long the cover takes to close completely (last panel included), per variant.
const COVER_MS: Record<Variant, number> = { iris: 720, rows: 780, columns: 820 };

type Stage = "cover" | "reveal";
type Active = Detail & { variant: Variant; label: string; index: string; stage: Stage; id: number };

/** Mount once in the layout: renders the transition overlay and drives the sequence. */
export function PageTransitionListener() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<Active | null>(null);
  const waitingFor = useRef<string | null>(null);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  useEffect(() => {
    const onGo = (e: Event) => {
      const { href, x, y } = (e as CustomEvent<Detail>).detail;
      if (waitingFor.current) return; // one at a time
      const route = ROUTES[href] ?? { variant: "columns" as Variant, label: "", index: "" };
      waitingFor.current = href;
      setActive({ href, x, y, ...route, stage: "cover", id: Date.now() });
      // Once covered, swap the page underneath.
      later(() => router.push(href, { scroll: false }), COVER_MS[route.variant] + 60);
      // Safety net: never leave the screen covered.
      later(() => {
        if (waitingFor.current === href) {
          waitingFor.current = null;
          setActive((a) => (a ? { ...a, stage: "reveal" } : a));
        }
      }, 4000);
    };
    document.addEventListener(EVENT, onGo);
    return () => {
      document.removeEventListener(EVENT, onGo);
      timers.current.forEach(clearTimeout);
    };
  }, [router]);

  // The new route has rendered: jump to its top, give it a frame to paint, then reveal.
  useEffect(() => {
    if (!waitingFor.current || pathname !== waitingFor.current) return;
    waitingFor.current = null;
    window.scrollTo(0, 0);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setActive((a) => (a ? { ...a, stage: "reveal" } : a))),
    );
  }, [pathname]);

  // Lock scrolling while covered.
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    html.classList.add("modal-lock");
    return () => html.classList.remove("modal-lock");
  }, [active]);

  if (!active) return null;
  const done = () => setActive((a) => (a && a.stage === "reveal" ? null : a));

  return (
    <div
      key={active.id}
      aria-hidden
      data-lenis-prevent
      className="pointer-events-auto fixed inset-0 z-[200] overflow-hidden"
    >
      {active.variant === "iris" && <Iris a={active} onDone={done} />}
      {active.variant === "rows" && <Rows a={active} onDone={done} />}
      {active.variant === "columns" && <Columns a={active} onDone={done} />}
      <Label a={active} />
    </div>
  );
}

// Lifted charcoal with a faint light edge, so the panels read clearly over the dark theme too.
const PANEL = "absolute bg-[#16161a] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_0_0_1px_rgba(255,255,255,0.04)]";

function Columns({ a, onDone }: { a: Active; onDone: () => void }) {
  return (
    <>
      {Array.from({ length: COLUMNS }, (_, i) => (
        <motion.div
          key={i}
          className={PANEL}
          style={{
            left: `${(i * 100) / COLUMNS}%`,
            width: `calc(${100 / COLUMNS}% + 1px)`,
            top: 0,
            bottom: 0,
            willChange: "transform",
          }}
          initial={{ y: "100%" }}
          animate={a.stage === "cover" ? { y: "0%" } : { y: "-100%" }}
          transition={{
            duration: 0.62,
            ease: EASE,
            delay: a.stage === "cover" ? i * 0.04 : i * 0.035,
          }}
          onAnimationComplete={() => a.stage === "reveal" && i === COLUMNS - 1 && onDone()}
        />
      ))}
    </>
  );
}

function Rows({ a, onDone }: { a: Active; onDone: () => void }) {
  return (
    <>
      {Array.from({ length: ROWS }, (_, i) => (
        <motion.div
          key={i}
          className={PANEL}
          style={{
            top: `${(i * 100) / ROWS}%`,
            height: `calc(${100 / ROWS}% + 1px)`,
            left: 0,
            right: 0,
            willChange: "transform",
          }}
          initial={{ x: i % 2 ? "100%" : "-100%" }}
          animate={a.stage === "cover" ? { x: "0%" } : { x: i % 2 ? "-100%" : "100%" }}
          transition={{
            duration: 0.62,
            ease: EASE,
            delay: a.stage === "cover" ? i * 0.04 : i * 0.035,
          }}
          onAnimationComplete={() => a.stage === "reveal" && i === ROWS - 1 && onDone()}
        />
      ))}
    </>
  );
}

function Iris({ a, onDone }: { a: Active; onDone: () => void }) {
  // A circle big enough to cover the screen from the click point, grown with scale.
  const w = typeof window === "undefined" ? 1600 : window.innerWidth;
  const h = typeof window === "undefined" ? 900 : window.innerHeight;
  const r = Math.hypot(Math.max(a.x, w - a.x), Math.max(a.y, h - a.y)) + 4;
  return (
    <motion.div
      className="absolute rounded-full bg-[#16161a] shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_80px_rgba(0,0,0,0.6)]"
      style={{
        left: a.x - r,
        top: a.y - r,
        width: r * 2,
        height: r * 2,
        willChange: "transform",
      }}
      initial={{ scale: 0 }}
      animate={{ scale: a.stage === "cover" ? 1 : 0 }}
      transition={{ duration: a.stage === "cover" ? 0.7 : 0.75, ease: [0.65, 0, 0.35, 1] }}
      onAnimationComplete={() => a.stage === "reveal" && onDone()}
    />
  );
}

/** The destination's name, rising in once the screen is covered and lifting away before the reveal. */
function Label({ a }: { a: Active }) {
  if (!a.label) return null;
  const show = a.stage === "cover";
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="overflow-hidden px-6 text-center">
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/45"
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: show ? 0.45 : 0.22, ease: "easeOut", delay: show ? 0.38 : 0 }}
        >
          / {a.index}
        </motion.p>
        <div className="overflow-hidden">
          <motion.p
            className="mt-2 text-5xl font-bold tracking-tight text-white sm:text-7xl"
            style={{ willChange: "transform" }}
            initial={{ y: "110%" }}
            animate={show ? { y: "0%" } : { y: "-110%" }}
            transition={{ duration: show ? 0.6 : 0.35, ease: EASE, delay: show ? 0.32 : 0 }}
          >
            {a.label}
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Let the browser handle new tabs, modified clicks and same-page clicks.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (href === pathname) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault();
    document.dispatchEvent(
      new CustomEvent<Detail>(EVENT, {
        detail: { href, x: e.clientX || window.innerWidth / 2, y: e.clientY || 0 },
      }),
    );
  };

  return <Link href={href} onClick={handle} {...props} />;
}
