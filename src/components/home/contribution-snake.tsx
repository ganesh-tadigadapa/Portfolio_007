"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A thin trace that glides over the contribution grid and "eats" the filled squares,
 * nearest first. Eaten squares fade to empty; once everything is eaten the trace leaves
 * on the right, the grid fades back in, and it starts again.
 *
 * Decorative overlay on top of the server-rendered grid: nothing underneath changes.
 * The line is drawn as one SVG path updated every frame (no React render per frame),
 * so motion is continuous rather than square-by-square. Runs only while on screen and
 * never with reduced motion.
 */

type Point = { x: number; y: number };

const SPEED = 11; // squares per second
const LENGTH = 5.5; // trace length, in squares
const REST_MS = 1600; // pause on the full grid between runs

function walk(from: Point, to: Point): Point[] {
  const out: Point[] = [];
  let { x, y } = from;
  while (x !== to.x) {
    x += Math.sign(to.x - x);
    out.push({ x, y });
  }
  while (y !== to.y) {
    y += Math.sign(to.y - y);
    out.push({ x, y });
  }
  return out;
}

/** Enter from the left, always head for the nearest remaining square, exit right. */
function planRoute(food: Point[], columns: number): Point[] {
  const left = [...food];
  const start: Point = { x: -Math.ceil(LENGTH) - 1, y: 3 };
  let head = start;
  const route: Point[] = [start];
  while (left.length) {
    let best = 0;
    let bestDist = Infinity;
    left.forEach((p, i) => {
      const d = Math.abs(p.x - head.x) * 1.05 + Math.abs(p.y - head.y) + (p.x < head.x ? 0.5 : 0);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    const target = left.splice(best, 1)[0]!;
    route.push(...walk(head, target));
    head = target;
  }
  route.push(...walk(head, { x: columns + Math.ceil(LENGTH) + 1, y: head.y }));
  return route;
}

export function ContributionSnake({
  food,
  columns,
  cell,
  gap,
  emptyClass,
}: {
  food: Point[];
  columns: number;
  cell: number;
  gap: number;
  emptyClass: string;
}) {
  const route = useMemo(() => planRoute(food, columns), [food, columns]);
  // Route index at which each food square gets eaten.
  const eatAt = useMemo(() => {
    const keys = new Set(food.map((p) => `${p.x},${p.y}`));
    const at = new Map<string, number>();
    route.forEach((p, i) => {
      const k = `${p.x},${p.y}`;
      if (keys.has(k) && !at.has(k)) at.set(k, i);
    });
    return at;
  }, [food, route]);

  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const headRef = useRef<SVGCircleElement>(null);
  const [visible, setVisible] = useState(false);
  const [eatenUpTo, setEatenUpTo] = useState(-1); // route index reached; -1 = grid full

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e!.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || route.length < 2) return;
    const pitch = cell + gap;
    const centre = (v: number) => v * pitch + cell / 2;
    const at = (t: number): [number, number] => {
      const i = Math.max(0, Math.min(route.length - 1, Math.floor(t)));
      const a = route[i]!;
      const b = route[Math.min(route.length - 1, i + 1)]!;
      const f = t - Math.floor(t);
      return [centre(a.x + (b.x - a.x) * f), centre(a.y + (b.y - a.y) * f)];
    };

    let raf = 0;
    let restTimer = 0;
    let startTime = 0;
    let lastIndex = -1;
    const end = route.length - 1;

    const frame = (now: number) => {
      if (!startTime) startTime = now;
      const t = Math.min(end, ((now - startTime) / 1000) * SPEED);

      // Path from the tail to the head: interpolated ends, real corners in between.
      const tail = Math.max(0, t - LENGTH);
      const pts = [at(tail)];
      for (let i = Math.floor(tail) + 1; i <= Math.floor(t); i++) pts.push(at(i));
      pts.push(at(t));
      pathRef.current?.setAttribute("d", `M${pts.map((p) => p.join(" ")).join("L")}`);
      const [hx, hy] = at(t);
      headRef.current?.setAttribute("cx", String(hx));
      headRef.current?.setAttribute("cy", String(hy));

      const index = Math.floor(t);
      if (index !== lastIndex) {
        lastIndex = index;
        setEatenUpTo(index);
      }

      if (t < end) {
        raf = requestAnimationFrame(frame);
      } else {
        // Run finished: let the grid fade back, rest, then go again.
        setEatenUpTo(-1);
        restTimer = window.setTimeout(() => {
          startTime = 0;
          lastIndex = -1;
          raf = requestAnimationFrame(frame);
        }, REST_MS);
      }
    };
    restTimer = window.setTimeout(() => (raf = requestAnimationFrame(frame)), 400);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(restTimer);
    };
  }, [visible, route, cell, gap]);

  const pitch = cell + gap;
  const running = eatenUpTo >= 0;

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {food.map((p) => {
        const eaten = running && eatenUpTo >= (eatAt.get(`${p.x},${p.y}`) ?? Infinity);
        return (
          <div
            key={`${p.x},${p.y}`}
            className="absolute left-0 top-0 rounded-[3px] bg-background transition-opacity ease-out"
            style={{
              width: cell,
              height: cell,
              transform: `translate(${p.x * pitch}px, ${p.y * pitch}px)`,
              opacity: eaten ? 1 : 0,
              transitionDuration: eaten ? "450ms" : "900ms",
            }}
          >
            <div className={`size-full rounded-[3px] ${emptyClass}`} />
          </div>
        );
      })}

      <svg
        className="absolute inset-0 size-full overflow-visible text-foreground transition-opacity duration-500"
        style={{ opacity: running ? 1 : 0 }}
      >
        <path
          ref={pathRef}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.85}
          strokeWidth={cell * 0.42}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle ref={headRef} r={cell * 0.3} fill="currentColor" />
      </svg>
    </div>
  );
}
