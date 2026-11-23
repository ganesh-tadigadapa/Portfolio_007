"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * A small snake that crawls over the contribution grid and eats the filled squares,
 * nearest first, growing a little with each one. When everything is eaten it leaves
 * on the right, the grid fills back in, and it starts again.
 *
 * It is a purely decorative overlay drawn on top of the server-rendered grid: eaten
 * squares are covered with an "empty" square, nothing underneath changes. It only runs
 * while the grid is on screen, and not at all with reduced motion.
 */

type Point = { x: number; y: number };

const STEP_MS = 85; // time per square moved
const START_LENGTH = 4;
const MAX_LENGTH = 9;
const REST_MS = 1400; // pause with the full grid before the next run

/** Walk from `from` to `to` one square at a time: across first, then up or down. */
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

/** The whole route: enter from the left, eat the nearest food each time, exit right. */
function planRoute(food: Point[], columns: number): Point[] {
  const left = [...food];
  let head: Point = { x: -START_LENGTH, y: 3 };
  const route: Point[] = [];
  while (left.length) {
    let best = 0;
    let bestDist = Infinity;
    left.forEach((p, i) => {
      // Slight preference for moving rightwards keeps the sweep tidy.
      const d =
        Math.abs(p.x - head.x) * 1.05 +
        Math.abs(p.y - head.y) +
        (p.x < head.x ? 0.5 : 0);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    const target = left.splice(best, 1)[0]!;
    route.push(...walk(head, target));
    head = target;
  }
  route.push(...walk(head, { x: columns + MAX_LENGTH, y: head.y }));
  return route;
}

export function ContributionSnake({
  food,
  columns,
  cell,
  gap,
  emptyClass,
}: {
  /** Grid squares that have contributions (week index, day index). */
  food: Point[];
  columns: number;
  cell: number;
  gap: number;
  /** Class for an empty square, so eaten squares look exactly like empty ones. */
  emptyClass: string;
}) {
  const route = useMemo(() => planRoute(food, columns), [food, columns]);
  const foodKeys = useMemo(
    () => new Set(food.map((p) => `${p.x},${p.y}`)),
    [food],
  );

  const [step, setStep] = useState(-1); // -1 = resting, grid full
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Only animate while the grid is on screen and motion is allowed.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry!.isIntersecting),
      {
        threshold: 0.2,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || route.length === 0) return;
    const timer = window.setTimeout(
      () => setStep((s) => (s + 1 >= route.length ? -1 : s + 1)),
      step === -1 ? REST_MS : STEP_MS,
    );
    return () => clearTimeout(timer);
  }, [visible, step, route.length]);

  // Which squares are eaten so far, and how long the snake has grown.
  const { eaten, body } = useMemo(() => {
    const eatenList: Point[] = [];
    const seen = new Set<string>();
    for (let i = 0; i <= step; i++) {
      const p = route[i]!;
      const k = `${p.x},${p.y}`;
      if (foodKeys.has(k) && !seen.has(k)) {
        seen.add(k);
        eatenList.push(p);
      }
    }
    const length = Math.min(
      MAX_LENGTH,
      START_LENGTH + Math.floor(eatenList.length / 2),
    );
    const segments: Point[] = [];
    for (let i = 0; i < length; i++) {
      const idx = step - i;
      segments.push(
        idx >= 0 ? route[idx]! : { x: -START_LENGTH - (i - step), y: 3 },
      );
    }
    return { eaten: eatenList, body: segments };
  }, [step, route, foodKeys]);

  const pitch = cell + gap;
  const pos = (p: Point) => `translate(${p.x * pitch}px, ${p.y * pitch}px)`;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {eaten.map((p) => (
        <div
          key={`e${p.x},${p.y}`}
          className="absolute left-0 top-0 rounded-[3px] bg-background"
          style={{ width: cell, height: cell, transform: pos(p) }}
        >
          <div className={`size-full rounded-[3px] ${emptyClass}`} />
        </div>
      ))}

      {step >= 0 &&
        body.map((p, i) => (
          <div
            key={i}
            className="absolute left-0 top-0 rounded-[4px] bg-foreground"
            style={{
              width: cell,
              height: cell,
              transform: `${pos(p)} scale(${i === 0 ? 1.08 : 1 - i * 0.045})`,
              opacity: i === 0 ? 1 : Math.max(0.25, 0.9 - i * 0.08),
              transition: `transform ${STEP_MS}ms linear`,
              boxShadow:
                i === 0
                  ? "0 0 10px 1px color-mix(in oklch, var(--foreground) 35%, transparent)"
                  : undefined,
            }}
          />
        ))}
    </div>
  );
}
