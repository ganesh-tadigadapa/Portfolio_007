"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";

/**
 * Blueprint "construction" intro, played after the 0–100% loader, on the homepage only.
 *
 * It waits underneath the loader. On "site-intro:build" it measures the real homepage
 * elements (already laid out beneath it) and draws the build over them:
 *   1. blueprint guides draw across the screen, with corner build labels
 *   2. every element's outline draws itself in place — image slots get an X, text slots
 *      get hatching, key pieces get a small tag (BANNER, AVATAR, H1, CTA…)
 *   3. the blueprint background fades and the real content fills into its outlines
 *      (the page's own reveals start underneath), then the wireframe fades away
 * Skipped (instant handover) elsewhere and with reduced motion; site-intro.tsx checks
 * for [data-build-intro] to decide.
 */

type Kind = "image" | "circle" | "text" | "ui";
type Piece = { x: number; y: number; w: number; h: number; r: number; kind: Kind; tag?: string };

const TARGETS: [selector: string, kind: Kind, tag?: string, all?: boolean][] = [
  ['header a[href="/"]', "ui", "LOGO"],
  ["header nav a", "ui", undefined, true],
  ['header button[aria-label="Open command palette"]', "ui", "SEARCH"],
  ["header button[aria-pressed], header button[aria-label='Toggle theme']", "ui", undefined, true],
  ['main [data-reveal="unveil"]', "image", "BANNER"],
  ['main [data-reveal="scale"]', "circle", "AVATAR"],
  ["main h1", "text", "H1"],
  ["main h1 + div", "text"],
  ["main h1 ~ div[data-reveal] > *", "ui", undefined, true],
  ["main p.max-w-xl", "text", "BIO"],
  ['main [data-reveal-stagger="70"] > *', "ui", undefined, true],
  ['main [data-reveal-stagger="35"] > *', "ui", undefined, true],
];

function measure(): Piece[] {
  const out: Piece[] = [];
  const vh = window.innerHeight;
  let ctaTagged = false;
  let stackTagged = false;
  for (const [sel, kind, tag, all] of TARGETS) {
    const els = all ? Array.from(document.querySelectorAll(sel)) : [document.querySelector(sel)];
    els.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || r.top > vh - 8 || r.bottom < 0) return;
      const radius =
        kind === "circle"
          ? r.width / 2
          : Math.min(parseFloat(getComputedStyle(el).borderRadius) || 6, r.height / 2);
      let t = i === 0 ? tag : undefined;
      if (!t && !ctaTagged && sel.includes("h1 ~") && el.tagName === "A") {
        t = "CTA";
        ctaTagged = true;
      }
      if (!t && !stackTagged && sel.includes('"35"')) {
        t = "STACK";
        stackTagged = true;
      }
      out.push({ x: r.left, y: r.top, w: r.width, h: r.height, r: radius, kind, tag: t });
    });
  }
  return out;
}

const EASE = [0.65, 0, 0.35, 1] as const;

export function BuildIntro() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<"wait" | "build" | "fill" | "fade" | "gone">(
    pathname === "/" ? "wait" : "gone",
  );
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [guides, setGuides] = useState({ left: 0, right: 0, header: 56, banner: 0 });

  useEffect(() => {
    if (phase !== "wait") return;
    const html = document.documentElement;
    if (html.hasAttribute("data-intro-done") || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("gone");
      return;
    }
    const onBuild = () => {
      const banner = document.querySelector('main [data-reveal="unveil"]')?.getBoundingClientRect();
      setGuides({
        left: banner?.left ?? 0,
        right: banner?.right ?? window.innerWidth,
        header: document.querySelector("header")?.getBoundingClientRect().bottom ?? 56,
        banner: banner?.bottom ?? 0,
      });
      setPieces(measure());
      setPhase("build");
    };
    document.addEventListener("site-intro:build", onBuild, { once: true });
    const failsafe = window.setTimeout(() => setPhase("gone"), 9000);
    return () => {
      document.removeEventListener("site-intro:build", onBuild);
      window.clearTimeout(failsafe);
    };
  }, [phase]);

  useEffect(() => {
    let t = 0;
    if (phase === "build") {
      t = window.setTimeout(() => {
        // Content starts filling in underneath while the wireframe is still up.
        const html = document.documentElement;
        html.classList.remove("intro-lock");
        html.setAttribute("data-intro-done", "");
        document.dispatchEvent(new Event("site-intro:done"));
        setPhase("fill");
      }, 1700);
    } else if (phase === "fill") {
      t = window.setTimeout(() => setPhase("fade"), 750);
    } else if (phase === "fade") {
      t = window.setTimeout(() => setPhase("gone"), 550);
    }
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "gone") return null;
  const drawing = phase !== "wait";
  const filled = phase === "fill" || phase === "fade";
  const n = pieces.length;
  const step = n > 0 ? Math.min(0.045, 1.05 / n) : 0.04;
  const width = guides.right - guides.left;

  return (
    <div
      data-build-intro
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[99] overflow-hidden"
      style={{ position: "fixed" }}
    >
      {/* Blueprint ground: fades away so the real content shows through the outlines. */}
      <motion.div
        className="bg-grid absolute inset-0 bg-background"
        style={{ position: "absolute" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: filled ? 0 : 1 }}
        transition={{ duration: 0.6, ease: EASE }}
      />

      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "fade" ? 0 : 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {drawing && (
          <>
            {[guides.left, guides.right, (guides.left + guides.right) / 2].map((x, i) => (
              <motion.span
                key={`v${i}`}
                className="bp-guide-v absolute top-0 h-full"
                style={{ left: x, originY: 0 }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
              />
            ))}
            {[guides.header, guides.banner].map((y, i) => (
              <motion.span
                key={`h${i}`}
                className="bp-guide-h absolute left-0 w-full"
                style={{ top: y, originX: 0 }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.12 + i * 0.1 }}
              />
            ))}
            <Label style={{ left: 16, bottom: 12 }} delay={0.1} text="build 001 · page.tsx" />
            <Label
              style={{ right: 16, bottom: 12 }}
              delay={0.2}
              text={filled ? "rendered ✓" : `compiling · ${n} nodes`}
            />
            {width > 0 && (
              <Label
                style={{ left: guides.left, width, top: guides.banner + 8, textAlign: "center" }}
                delay={0.55}
                text={`← ${Math.round(width)}px →`}
              />
            )}
          </>
        )}

        {/* Wireframe of the real page */}
        <svg className="absolute inset-0 size-full" aria-hidden>
          <defs>
            <pattern id="bp-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="7" className="bp-hatch-line" strokeWidth="1.2" />
            </pattern>
          </defs>
          {drawing &&
            pieces.map((p, i) => {
              const d = 0.25 + i * step;
              return (
                <g key={i}>
                  {p.kind === "text" && (
                    <motion.rect
                      x={p.x}
                      y={p.y}
                      width={p.w}
                      height={p.h}
                      rx={p.r}
                      fill="url(#bp-hatch)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: filled ? 0 : 0.9 }}
                      transition={{ duration: 0.35, delay: filled ? 0 : d + 0.25 }}
                    />
                  )}
                  <motion.rect
                    x={p.x + 0.5}
                    y={p.y + 0.5}
                    width={Math.max(0, p.w - 1)}
                    height={Math.max(0, p.h - 1)}
                    rx={p.r}
                    className="bp-stroke"
                    fill="none"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: { duration: 0.55, ease: EASE, delay: d },
                      opacity: { duration: 0.1, delay: d },
                    }}
                  />
                  {p.kind === "image" &&
                    [
                      [p.x, p.y, p.x + p.w, p.y + p.h],
                      [p.x + p.w, p.y, p.x, p.y + p.h],
                    ].map(([x1, y1, x2, y2], k) => (
                      <motion.line
                        key={k}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        className="bp-stroke"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0.7 }}
                        animate={{ pathLength: 1, opacity: filled ? 0 : 0.7 }}
                        transition={{
                          pathLength: { duration: 0.5, ease: EASE, delay: d + 0.35 + k * 0.08 },
                          opacity: { duration: 0.3 },
                        }}
                      />
                    ))}
                  {p.kind === "circle" &&
                    [0, 1].map((k) => {
                      const cx = p.x + p.w / 2;
                      const cy = p.y + p.h / 2;
                      const o = (p.w / 2) * Math.SQRT1_2;
                      const s = k ? -1 : 1;
                      return (
                        <motion.line
                          key={k}
                          x1={cx - o}
                          y1={cy - s * o}
                          x2={cx + o}
                          y2={cy + s * o}
                          className="bp-stroke"
                          strokeWidth="1"
                          initial={{ pathLength: 0, opacity: 0.7 }}
                          animate={{ pathLength: 1, opacity: filled ? 0 : 0.7 }}
                          transition={{
                            pathLength: { duration: 0.4, ease: EASE, delay: d + 0.35 + k * 0.08 },
                            opacity: { duration: 0.3 },
                          }}
                        />
                      );
                    })}
                </g>
              );
            })}
        </svg>

        {drawing &&
          pieces.map((p, i) =>
            p.tag ? (
              <motion.span
                key={`t${i}`}
                className="bp-tag absolute font-mono text-[9.5px] uppercase tracking-[0.14em]"
                style={{ left: p.x, top: Math.max(2, p.y - 17) }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: filled ? 0 : 1, y: 0 }}
                transition={{ duration: 0.3, delay: filled ? 0 : 0.45 + i * step }}
              >
                {p.tag}
                {p.kind === "image" ? ` · ${Math.round(p.w)}×${Math.round(p.h)}` : ""}
              </motion.span>
            ) : null,
          )}
      </motion.div>
    </div>
  );
}

function Label({ text, style, delay }: { text: string; style: CSSProperties; delay: number }) {
  return (
    <motion.span
      className="bp-label absolute font-mono text-[10px] uppercase tracking-[0.2em]"
      style={style}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {text}
    </motion.span>
  );
}
