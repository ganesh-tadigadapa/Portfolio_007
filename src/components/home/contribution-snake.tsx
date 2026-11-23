"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * "Your commits are the snake": a small head glides over the contribution grid, and
 * every filled square it reaches lifts off the grid and joins its body, keeping its own
 * shade. The body is therefore a train of real contribution days. At the end it leaves
 * on the right, the squares settle back into the grid, and it starts again.
 *
 * Decorative overlay; the server-rendered grid underneath never changes. Positions are
 * written straight to the DOM each frame (no React render per frame). Runs only while
 * on screen, never with reduced motion.
 */

type Food = { x: number; y: number; level: number };
type Point = { x: number; y: number };

const SPEED = 9; // squares per second
const SPACING = 1; // squares between body segments
const MAX_BODY = 18; // segments shown; older ones drop back off the tail
const REST_MS = 1800;

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

function planRoute(food: Point[], columns: number, startColumn: number): Point[] {
  const left = [...food];
  const start: Point = { x: startColumn - 2, y: 3 };
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
  route.push(...walk(head, { x: columns + MAX_BODY * SPACING + 2, y: head.y }));
  return route;
}

export function ContributionSnake({
  food: allFood,
  columns,
  startColumn = 0,
  cell,
  gap,
  emptyClass,
  levelClasses,
}: {
  food: Food[];
  columns: number;
  /** Grid column (week) the snake enters at; squares left of it are left alone. */
  startColumn?: number;
  cell: number;
  gap: number;
  emptyClass: string;
  /** Classes for contribution levels 0–4, so body segments keep their real shade. */
  levelClasses: string[];
}) {
  const food = useMemo(() => allFood.filter((f) => f.x >= startColumn), [allFood, startColumn]);
  const route = useMemo(() => planRoute(food, columns, startColumn), [food, columns, startColumn]);
  // In eating order: which square, its shade, and the route index where it's eaten.
  const meals = useMemo(() => {
    const byKey = new Map(food.map((f) => [`${f.x},${f.y}`, f]));
    const out: (Food & { at: number })[] = [];
    route.forEach((p, i) => {
      const f = byKey.get(`${p.x},${p.y}`);
      if (f) {
        out.push({ ...f, at: i });
        byKey.delete(`${p.x},${p.y}`);
      }
    });
    return out;
  }, [food, route]);

  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const segRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState(false);
  const [eaten, setEaten] = useState(-1); // meals eaten so far; -1 = resting, grid full

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
    const at = (t: number): Point => {
      const c = Math.max(0, Math.min(route.length - 1, t));
      const i = Math.floor(c);
      const a = route[i]!;
      const b = route[Math.min(route.length - 1, i + 1)]!;
      const f = c - i;
      return { x: (a.x + (b.x - a.x) * f) * pitch, y: (a.y + (b.y - a.y) * f) * pitch };
    };

    let raf = 0;
    let timer = 0;
    let start = 0;
    let lastEaten = -1;
    const end = route.length - 1;

    const frame = (now: number) => {
      if (!start) start = now;
      const t = Math.min(end, ((now - start) / 1000) * SPEED);

      const head = at(t);
      if (headRef.current) {
        headRef.current.style.transform = `translate(${head.x}px, ${head.y}px)`;
      }

      let count = 0;
      while (count < meals.length && meals[count]!.at <= t) count++;

      // Newest meal sits right behind the head; each older one one step further back.
      for (let s = 0; s < MAX_BODY; s++) {
        const seg = segRefs.current[s];
        if (!seg) continue;
        const meal = meals[count - 1 - s];
        if (!meal) {
          seg.style.opacity = "0";
          continue;
        }
        // A freshly eaten square slides from its grid spot into its place in the body.
        const target = at(t - (s + 1) * SPACING);
        const age = Math.min(1, (t - meal.at) / 1.2);
        const ease = 1 - (1 - age) ** 3;
        const home = { x: meal.x * pitch, y: meal.y * pitch };
        const x = home.x + (target.x - home.x) * ease;
        const y = home.y + (target.y - home.y) * ease;
        const fade = s > MAX_BODY - 4 ? (MAX_BODY - s) / 4 : 1;
        seg.style.transform = `translate(${x}px, ${y}px) scale(${0.86 - s * 0.012})`;
        seg.style.opacity = String(fade);
        const fill = seg.firstElementChild as HTMLElement | null;
        if (fill) fill.className = `size-full rounded-[3px] ${levelClasses[meal.level] ?? levelClasses[4]}`;
      }

      if (count !== lastEaten) {
        lastEaten = count;
        setEaten(count);
      }

      if (t < end) {
        raf = requestAnimationFrame(frame);
      } else {
        setEaten(-1);
        timer = window.setTimeout(() => {
          start = 0;
          lastEaten = -1;
          raf = requestAnimationFrame(frame);
        }, REST_MS);
      }
    };
    timer = window.setTimeout(() => (raf = requestAnimationFrame(frame)), 400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [visible, route, meals, cell, gap, levelClasses]);

  const pitch = cell + gap;
  const running = eaten >= 0;

  return (
    <div ref={rootRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Holes left where squares lifted off; they fill back in after each run. */}
      {meals.map((m, i) => {
        const gone = running && i < eaten;
        return (
          <div
            key={`${m.x},${m.y}`}
            className="absolute left-0 top-0 rounded-[3px] bg-background transition-opacity ease-out"
            style={{
              width: cell,
              height: cell,
              transform: `translate(${m.x * pitch}px, ${m.y * pitch}px)`,
              opacity: gone ? 1 : 0,
              transitionDuration: gone ? "200ms" : "1100ms",
            }}
          >
            <div className={`size-full rounded-[3px] ${emptyClass}`} />
          </div>
        );
      })}

      <div className="transition-opacity duration-500" style={{ opacity: running ? 1 : 0 }}>
        {Array.from({ length: MAX_BODY }, (_, s) => (
          <div
            key={s}
            ref={(el) => {
              segRefs.current[s] = el;
            }}
            className="absolute left-0 top-0 rounded-[3px] bg-background opacity-0 shadow-sm"
            style={{ width: cell, height: cell }}
          >
            <div className="size-full rounded-[3px]" />
          </div>
        ))}
        {/* Head: a crisp square with a faint ring, so it reads as the leader. */}
        <div
          ref={headRef}
          className="absolute left-0 top-0 rounded-[4px] bg-foreground ring-2 ring-foreground/15"
          style={{ width: cell, height: cell }}
        />
      </div>
    </div>
  );
}
