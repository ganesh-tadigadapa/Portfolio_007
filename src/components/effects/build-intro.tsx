"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * "Compile" intro, played after the 0–100% loader, on the homepage only.
 *
 * The homepage renders from its own source: at the exact position of every real
 * element, its JSX types itself out on a dark ground; then, one by one, each snippet
 * compiles — the code dissolves and the real element opens up in its place through a
 * window in the ground. A status line counts the render in the corner.
 *
 * The real page is revealed underneath first (hand-over at the start), so each window
 * shows finished content. Holes and text animate transform/opacity only.
 * Skipped (instant handover) elsewhere and with reduced motion; site-intro.tsx checks
 * for [data-build-intro] to decide.
 */

type Piece = { x: number; y: number; w: number; h: number; r: number; code: string };

const short = (s: string | null | undefined, n = 26) => {
  const t = (s ?? "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
};

/** Real elements, in build order, with the JSX shown for each. */
const TARGETS: [selector: string, code: (el: Element) => string, all?: boolean][] = [
  ['header a[href="/"]', () => "<Logo />"],
  ["header nav a", (el) => `<Link to="${el.getAttribute("href")}" />`, true],
  ['header button[aria-label="Open command palette"]', () => "<Search ⌘K />"],
  ["header button[aria-pressed], header button[aria-label='Toggle theme']", () => "", true],
  ['main [data-reveal="unveil"]', () => '<Banner src="header-banner.jpg" priority />'],
  ['main [data-reveal="scale"]', () => "<Avatar />"],
  ["main h1", (el) => `<h1>${short(el.textContent, 30)}</h1>`],
  ["main h1 + div", () => "<RotatingTitle />"],
  ["main h1 ~ div[data-reveal] > *", (el) => (el.tagName === "A" ? `<Button>${short(el.textContent, 16)}</Button>` : "<Badge />"), true],
  ["main p.max-w-xl", () => "<p>{profile.bio}</p>"],
  ['main [data-reveal-stagger="70"] > *', () => "", true],
  ['main [data-reveal-stagger="35"] > *', () => "", true],
];

function measure(): Piece[] {
  const out: Piece[] = [];
  const vh = window.innerHeight;
  for (const [sel, code, all] of TARGETS) {
    const els = all ? Array.from(document.querySelectorAll(sel)) : [document.querySelector(sel)];
    for (const el of els) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || r.top > vh - 4 || r.bottom < 0) continue;
      const round = parseFloat(getComputedStyle(el).borderRadius) || 6;
      out.push({ x: r.left, y: r.top, w: r.width, h: r.height, r: Math.min(round, r.height / 2), code: code(el) });
    }
  }
  return out;
}

const EASE = [0.22, 1, 0.36, 1] as const;
const TYPE_START = 0.55; // s (after the loader has wiped away)
const COMPILE_START = 1.55; // s
const PAD = 6; // px around each window

export function BuildIntro() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"wait" | "run" | "fade" | "gone">(pathname === "/" ? "wait" : "gone");
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (phase !== "wait") return;
    const html = document.documentElement;
    if (html.hasAttribute("data-intro-done") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("gone");
      return;
    }
    const onBuild = () => {
      setPieces(measure());
      // Reveal the real page underneath now; the windows open onto finished content.
      html.classList.remove("intro-lock");
      html.setAttribute("data-intro-done", "");
      document.dispatchEvent(new Event("site-intro:done"));
      setPhase("run");
    };
    document.addEventListener("site-intro:build", onBuild, { once: true });
    const failsafe = window.setTimeout(() => setPhase("gone"), 9000);
    return () => {
      document.removeEventListener("site-intro:build", onBuild);
      window.clearTimeout(failsafe);
    };
  }, [phase]);

  const n = pieces.length;
  const step = n > 0 ? Math.min(0.06, 1.15 / n) : 0.05;
  const compileEnd = COMPILE_START + n * step + 0.35;

  // Status counter + phase timing.
  useEffect(() => {
    if (phase !== "run") return;
    const timers: number[] = [];
    pieces.forEach((_, i) =>
      timers.push(window.setTimeout(() => setDone(i + 1), (COMPILE_START + i * step + 0.15) * 1000)),
    );
    timers.push(window.setTimeout(() => setPhase("fade"), compileEnd * 1000));
    return () => timers.forEach(clearTimeout);
  }, [phase, pieces, step, compileEnd]);

  useEffect(() => {
    if (phase !== "fade") return;
    const t = window.setTimeout(() => setPhase("gone"), 500);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;
  const running = phase !== "wait";

  return (
    <motion.div
      data-build-intro
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[99] overflow-hidden"
      style={{ position: "fixed" }}
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      {/* The ground, with a window opening over each element as it compiles. */}
      <svg className="absolute inset-0 size-full">
        <defs>
          <mask id="compile-mask" maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="white" />
            {running &&
              pieces.map((p, i) => (
                <motion.rect
                  key={i}
                  x={p.x - PAD / 2}
                  y={p.y - PAD / 2}
                  width={p.w + PAD}
                  height={p.h + PAD}
                  rx={p.r + PAD / 2}
                  fill="black"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: EASE, delay: COMPILE_START + i * step }}
                />
              ))}
          </mask>
        </defs>
        <rect width="100%" height="100%" className="compile-ground" mask="url(#compile-mask)" />
      </svg>

      {/* Source, typed in place, dissolving as each piece compiles. */}
      {running &&
        pieces.map((p, i) =>
          p.code ? (
            <motion.code
              key={i}
              className="compile-code absolute whitespace-nowrap font-mono"
              style={{
                left: p.x,
                top: p.y + p.h / 2,
                fontSize: p.h > 60 ? 13 : 11,
                maxWidth: p.w < 90 ? 140 : p.w,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 1, y: "-50%" }}
              animate={{
                clipPath: "inset(0 0% 0 0)",
                opacity: [1, 1, 0],
                y: ["-50%", "-50%", "-120%"],
                filter: ["blur(0px)", "blur(0px)", "blur(3px)"],
              }}
              transition={{
                clipPath: { duration: 0.5, ease: "linear", delay: TYPE_START + i * 0.035 },
                opacity: { duration: 0.35, times: [0, 0.4, 1], delay: COMPILE_START + i * step - 0.05 },
                y: { duration: 0.35, times: [0, 0.4, 1], delay: COMPILE_START + i * step - 0.05 },
                filter: { duration: 0.35, times: [0, 0.4, 1], delay: COMPILE_START + i * step - 0.05 },
              }}
            >
              <Highlighted code={p.code} />
            </motion.code>
          ) : null,
        )}

      {running && (
        <motion.p
          className="compile-status absolute bottom-4 left-4 font-mono text-[11px] tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="compile-accent">›</span> rendering page.tsx ·{" "}
          <span className="tabular-nums">
            {String(done).padStart(2, "0")}/{String(n).padStart(2, "0")}
          </span>
          {done === n && n > 0 ? <span className="compile-accent"> · ✓ ready</span> : null}
        </motion.p>
      )}
    </motion.div>
  );
}

/** Light JSX colouring: tags, attribute names, strings. */
function Highlighted({ code }: { code: string }) {
  const parts = code.split(/(<\/?[A-Za-z0-9]+|\/?>|"[^"]*"|\{[^}]*\}|\s[a-zA-Z]+=)/g).filter(Boolean);
  return (
    <>
      {parts.map((t, i) => {
        const cls = /^<\/?[A-Za-z]/.test(t) || /^\/?>$/.test(t)
          ? "compile-tag"
          : /^"/.test(t)
            ? "compile-str"
            : /^\{/.test(t)
              ? "compile-expr"
              : /=$/.test(t)
                ? "compile-attr"
                : "compile-text";
        return (
          <span key={i} className={cls}>
            {t}
          </span>
        );
      })}
    </>
  );
}
