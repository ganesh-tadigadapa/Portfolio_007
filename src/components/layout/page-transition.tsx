"use client";

import { motion, type Transition } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";

/**
 * Header-nav page transition: a curved "liquid" wipe.
 *
 *   cover   a full-screen panel slides in, its leading edge a soft curve that flattens
 *           as it lands
 *   hold    the destination's name rises letter by letter while a hairline draws
 *           underneath; the route changes behind the panel
 *   reveal  the panel carries on out, its trailing edge bulging into a curve
 *
 * Going forward in the nav (Home → About → Projects) wipes upward; going back wipes
 * downward. The panel is the theme inverted (light on dark mode, dark on light mode),
 * like the monochrome theme toggle. Everything that moves is transform/opacity only,
 * so the GPU composites it and frames stay steady.
 * Reduced motion: a plain instant navigation.
 */

const ROUTES: Record<string, { label: string; index: number }> = {
  "/": { label: "Home", index: 1 },
  "/about": { label: "About", index: 2 },
  "/projects": { label: "Projects", index: 3 },
};

const EVENT = "page-transition:go";
const EASE: Transition["ease"] = [0.76, 0, 0.24, 1];
const COVER_S = 0.8;
const REVEAL_S = 0.85;
const HOLD_MS = 380; // minimum time the name is on screen

type Stage = "cover" | "reveal";
type Active = { href: string; label: string; index: number; dir: 1 | -1; stage: Stage; id: number };

export function PageTransitionListener() {
  const router = useRouter();
  const pathname = usePathname();
  const [active, setActive] = useState<Active | null>(null);
  const waitingFor = useRef<string | null>(null);
  const coveredAt = useRef(0);
  const timers = useRef<number[]>([]);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  useEffect(() => {
    const onGo = (e: Event) => {
      const { href } = (e as CustomEvent<{ href: string }>).detail;
      if (waitingFor.current) return;
      const to = ROUTES[href] ?? { label: "", index: 9 };
      const from = ROUTES[pathRef.current]?.index ?? 0;
      waitingFor.current = href;
      router.prefetch(href); // have the page ready by the time the screen is covered
      setActive({ href, ...to, dir: to.index >= from ? 1 : -1, stage: "cover", id: Date.now() });
      later(() => {
        coveredAt.current = Date.now();
        router.push(href, { scroll: false });
      }, COVER_S * 1000);
      later(() => {
        if (waitingFor.current === href) {
          waitingFor.current = null;
          setActive((a) => (a ? { ...a, stage: "reveal" } : a));
        }
      }, 3200);
    };
    document.addEventListener(EVENT, onGo);
    return () => {
      document.removeEventListener(EVENT, onGo);
      timers.current.forEach(clearTimeout);
    };
  }, [router]);

  // New route rendered behind the panel: go to its top, let the name breathe, reveal.
  useEffect(() => {
    if (!waitingFor.current || pathname !== waitingFor.current) return;
    waitingFor.current = null;
    window.scrollTo(0, 0);
    const wait = Math.max(0, HOLD_MS - (Date.now() - coveredAt.current));
    later(() => setActive((a) => (a ? { ...a, stage: "reveal" } : a)), wait);
  }, [pathname]);

  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    html.classList.add("modal-lock");
    return () => html.classList.remove("modal-lock");
  }, [active]);

  if (!active) return null;
  return <Wipe key={active.id} a={active} onDone={() => setActive(null)} />;
}

function Wipe({ a, onDone }: { a: Active; onDone: () => void }) {
  const up = a.dir === 1;
  const covering = a.stage === "cover";
  // Panel travel: enters from below (up) or above (down), exits the opposite side.
  const from = up ? "100%" : "-100%";
  const to = up ? "-100%" : "100%";

  return (
    <div aria-hidden data-lenis-prevent className="fixed inset-0 z-[200] overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-foreground text-background"
        style={{ willChange: "transform" }}
        initial={{ y: from }}
        animate={{ y: covering ? "0%" : to }}
        transition={{ duration: covering ? COVER_S : REVEAL_S, ease: EASE }}
        onAnimationComplete={() => !covering && onDone()}
      >
        {/* Leading curve: bulges out ahead of the panel, flattens as it lands. */}
        <motion.div
          className="absolute left-[-25%] h-[24vh] w-[150%] rounded-[50%] bg-foreground"
          style={{ [up ? "top" : "bottom"]: "-12vh", willChange: "transform" }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: COVER_S, ease: EASE }}
        />
        {/* Trailing curve: grows as the panel pulls away on the reveal. */}
        <motion.div
          className="absolute left-[-25%] h-[24vh] w-[150%] rounded-[50%] bg-foreground"
          style={{ [up ? "bottom" : "top"]: "-12vh", willChange: "transform" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: covering ? 0 : 1 }}
          transition={{ duration: REVEAL_S, ease: EASE }}
        />

        <Title a={a} />
      </motion.div>
    </div>
  );
}

function Title({ a }: { a: Active }) {
  if (!a.label) return null;
  const show = a.stage === "cover";
  const letters = [...a.label];
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
      <motion.p
        className="font-mono text-[11px] uppercase tracking-[0.4em] opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 0.5 : 0 }}
        transition={{ duration: show ? 0.4 : 0.2, delay: show ? 0.45 : 0 }}
      >
        {String(a.index).padStart(2, "0")} / {String(Object.keys(ROUTES).length).padStart(2, "0")}
      </motion.p>

      <p className="mt-3 flex overflow-hidden text-6xl font-semibold leading-[1.1] tracking-tight sm:text-8xl">
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block"
            style={{ willChange: "transform" }}
            initial={{ y: "110%" }}
            animate={{ y: show ? "0%" : "-110%" }}
            transition={{
              duration: show ? 0.7 : 0.4,
              ease: EASE,
              delay: show ? 0.35 + i * 0.035 : i * 0.02,
            }}
          >
            {ch}
          </motion.span>
        ))}
      </p>

      {/* Hairline that draws while the next page loads behind. */}
      <motion.span
        className="mt-6 block h-px w-40 origin-left bg-current opacity-40"
        style={{ willChange: "transform" }}
        initial={{ scaleX: 0 }}
        animate={show ? { scaleX: 1 } : { scaleX: 1, opacity: 0 }}
        transition={{ duration: show ? 0.9 : 0.25, ease: EASE, delay: show ? 0.5 : 0 }}
      />
    </div>
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
    document.dispatchEvent(new CustomEvent(EVENT, { detail: { href } }));
  };

  return <Link href={href} onClick={handle} {...props} />;
}
