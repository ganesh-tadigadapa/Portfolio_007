"use client";

import { useEffect, useRef } from "react";
import { isDark, measureHome, type Box } from "./shared";

/**
 * Particle build intro (after the loader, homepage only), ~2 s. The page finishes from
 * inside the animation, element by element:
 *   1. dots, scattered across the screen, flow along soft curves to each element —
 *      its outline first, then its fill
 *   2. a crisp line traces around each element as its dots arrive
 *   3. in reading order, the backdrop opens in exactly that element's shape, so the real
 *      content appears inside its own outline while that element's dots melt into it
 *   4. the outlines fade and the last of the backdrop between elements dissolves
 * One canvas, one pre-rendered soft dot sprite.
 */

const TRAVEL = 0.62; // s per dot
const ARRIVE = 0.85; // by now (almost) every dot has landed
const TRACE = 0.38; // outline draw time per element
const OPEN = 0.34; // time for one element to open
const OPEN_SPREAD = 0.45; // first → last element opening
const TAIL = 0.32; // final backdrop dissolve

type P = { sx: number; sy: number; tx: number; ty: number; delay: number; bend: number; size: number; alpha: number; box: number };

function targetsFor(b: Box, n: number): [number, number, boolean][] {
  const out: [number, number, boolean][] = [];
  const edgeCount = Math.round(n * 0.4);
  for (let i = 0; i < n; i++) {
    const onEdge = i < edgeCount;
    if (b.circle) {
      const a = Math.random() * Math.PI * 2;
      const rad = onEdge ? b.w / 2 : Math.sqrt(Math.random()) * (b.w / 2) * 0.96;
      out.push([b.x + b.w / 2 + Math.cos(a) * rad, b.y + b.h / 2 + Math.sin(a) * rad, onEdge]);
    } else if (onEdge) {
      const per = 2 * (b.w + b.h);
      let d = Math.random() * per;
      if (d < b.w) out.push([b.x + d, b.y, true]);
      else if ((d -= b.w) < b.h) out.push([b.x + b.w, b.y + d, true]);
      else if ((d -= b.h) < b.w) out.push([b.x + b.w - d, b.y + b.h, true]);
      else out.push([b.x, b.y + b.h - (d - b.w), true]);
    } else if (b.text) {
      const rows = Math.max(1, Math.round(b.h / 8));
      out.push([b.x + Math.random() * b.w, b.y + ((Math.floor(Math.random() * rows) + 0.5) / rows) * b.h, false]);
    } else {
      out.push([b.x + Math.random() * b.w, b.y + Math.random() * b.h, false]);
    }
  }
  return out;
}

function makeSprite(rgb: string) {
  const s = document.createElement("canvas");
  s.width = s.height = 32;
  const g = s.getContext("2d")!;
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.35, `rgba(${rgb},0.85)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 32, 32);
  return s;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function shapePath(ctx: CanvasRenderingContext2D, b: Box, pad: number) {
  ctx.beginPath();
  if (b.circle) {
    ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + pad, 0, Math.PI * 2);
  } else {
    ctx.roundRect(b.x - pad, b.y - pad, b.w + pad * 2, b.h + pad * 2, b.r + pad);
  }
}

export function ParticlesIntro({ onDone }: { onDone: () => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = window.innerWidth;
    const H = window.innerHeight;
    c.width = W * dpr;
    c.height = H * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const dark = isDark();
    const ground = dark ? "10,10,11" : "250,250,249";
    const inkRgb = dark ? "255,255,255" : "18,18,20";
    const sprite = makeSprite(inkRgb);

    // Elements in reading order (top → bottom, left → right).
    const boxes = measureHome().sort((a, b) => (Math.abs(a.y - b.y) < 12 ? a.x - b.x : a.y - b.y));
    const nB = boxes.length;
    const step = nB > 1 ? Math.min(0.05, OPEN_SPREAD / (nB - 1)) : 0;
    const traceAt = (i: number) => 0.5 + i * step * 0.8;
    const openAt = (i: number) => ARRIVE + i * step;
    const lastOpen = openAt(Math.max(0, nB - 1)) + OPEN;
    const END = lastOpen + TAIL;

    const total = Math.min(1600, Math.max(850, Math.round((W * H) / 1050)));
    const weight = boxes.reduce((s, b) => s + Math.sqrt(b.w * b.h), 0) || 1;
    const ps: P[] = [];
    boxes.forEach((b, bi) => {
      const n = Math.max(16, Math.round((total * Math.sqrt(b.w * b.h)) / weight));
      for (const [tx, ty, edge] of targetsFor(b, n)) {
        ps.push({
          sx: -0.1 * W + Math.random() * 1.2 * W,
          sy: -0.1 * H + Math.random() * 1.2 * H,
          tx,
          ty,
          delay: (edge ? 0 : 0.12) + Math.random() * 0.12,
          bend: (Math.random() - 0.5) * 0.9,
          size: edge ? 2.2 + Math.random() * 1.1 : 1.7 + Math.random() * 1.3,
          alpha: edge ? 0.9 : 0.4 + Math.random() * 0.45,
          box: bi,
        });
      }
    });

    let start = 0;
    let raf = 0;

    const frame = (now: number) => {
      if (!start) start = now;
      const t = (now - start) / 1000;

      // 1. Backdrop (with light trails while dots are flying).
      const tail = easeOut(clamp01((t - lastOpen) / TAIL));
      if (t < ARRIVE - 0.15) {
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = `rgb(${ground})`;
        ctx.fillRect(0, 0, W, H);
      } else {
        ctx.clearRect(0, 0, W, H);
        ctx.globalAlpha = 1 - tail;
        ctx.fillStyle = `rgb(${ground})`;
        ctx.fillRect(0, 0, W, H);
        // 3. Open each element's window as its turn comes.
        ctx.globalCompositeOperation = "destination-out";
        boxes.forEach((b, i) => {
          const o = easeOut(clamp01((t - openAt(i)) / OPEN));
          if (o <= 0) return;
          ctx.globalAlpha = o;
          shapePath(ctx, b, 3);
          ctx.fill();
        });
        ctx.globalCompositeOperation = "source-over";
      }

      // 2. Outline traced around each element, fading as it opens.
      ctx.strokeStyle = `rgb(${inkRgb})`;
      ctx.lineWidth = 1;
      boxes.forEach((b, i) => {
        const tr = easeInOut(clamp01((t - traceAt(i)) / TRACE));
        if (tr <= 0) return;
        const fade = 1 - easeOut(clamp01((t - openAt(i) - OPEN * 0.4) / (OPEN * 0.9)));
        if (fade <= 0) return;
        const len = b.circle ? Math.PI * (b.w + 6) : 2 * (b.w + b.h + 12);
        ctx.setLineDash([len * tr, len]);
        ctx.globalAlpha = 0.55 * fade;
        shapePath(ctx, b, 3);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Dots: fly in, then melt into their element as it opens.
      for (const p of ps) {
        const k = easeInOut(clamp01((t - p.delay) / TRAVEL));
        const mx = (p.sx + p.tx) / 2 + (p.ty - p.sy) * p.bend * 0.3;
        const my = (p.sy + p.ty) / 2 + (p.sx - p.tx) * p.bend * 0.3;
        const x = (1 - k) * (1 - k) * p.sx + 2 * (1 - k) * k * mx + k * k * p.tx;
        const y = (1 - k) * (1 - k) * p.sy + 2 * (1 - k) * k * my + k * k * p.ty;
        const melt = easeOut(clamp01((t - openAt(p.box)) / (OPEN * 0.85)));
        const size = p.size * (0.7 + 0.3 * k) * (1 - melt);
        const alpha = p.alpha * clamp01(t / 0.12) * (0.45 + 0.55 * k) * (1 - melt);
        if (alpha < 0.02 || size < 0.2) continue;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, x - size, y - size, size * 2, size * 2);
      }
      ctx.globalAlpha = 1;

      if (t < END) raf = requestAnimationFrame(frame);
      else onDone();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return <canvas ref={canvas} className="absolute inset-0 size-full" />;
}
