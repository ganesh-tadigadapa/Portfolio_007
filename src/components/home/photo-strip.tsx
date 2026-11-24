"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { SongCard } from "@/components/home/song-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { photosConfig, type Photo } from "@/config/photos";

/**
 * A sideways row of photos that scrolls by itself, endlessly. Every photo has the same
 * height and keeps its own aspect ratio, with a small caption underneath. The list is
 * rendered twice and the track slides left by one copy, so the loop has no visible seam.
 * Hover or focus pauses it; with reduced motion it is a normal swipeable row.
 */

/** Random order where no two neighbours share a group (mountains next to mountains). */
function shuffleApart(list: Photo[]): Photo[] {
  for (let attempt = 0; attempt < 300; attempt++) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    const ok = a.every((p, i) => i === 0 || p.group !== a[i - 1].group);
    // The loop joins the last photo back to the first, so check that seam too.
    if (ok && a[0].group !== a[a.length - 1].group) return a;
  }
  return list;
}

export function PhotoStrip() {
  // Server render uses the configured order; each visit then gets a fresh shuffle.
  const [photos, setPhotos] = useState<Photo[]>(photosConfig.photos);
  useEffect(() => setPhotos(shuffleApart(photosConfig.photos)), []);
  const regionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  useMarquee(regionRef, trackRef, progressRef);

  if (photosConfig.photos.length === 0) return null;

  return (
    <Container>
      <SectionHeading eyebrow="Off the clock" title={photosConfig.title} />
      <p data-reveal className="text-secondary">
        {photosConfig.description}
      </p>

      <div className="group/strip relative mt-6">
      <div
        ref={regionRef}
        tabIndex={0}
        role="region"
        aria-label="Photographs"
        className="marquee relative overflow-hidden py-4 focus-visible:outline-none"
      >
        <ul ref={trackRef} className="marquee-track flex w-max gap-4">
          {[0, 1].map((copy) =>
            photos.map((photo, i) => (
              <li
                key={`${copy}-${photo.src}`}
                aria-hidden={copy === 1 || undefined}
                className="marquee-item shrink-0"
              >
                <figure>
                  <div className="marquee-frame h-40 overflow-hidden rounded-lg border border-border bg-muted sm:h-48">
                    <Image
                      src={photo.src}
                      alt={copy === 1 ? "" : photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes="(min-width: 640px) 420px, 300px"
                      loading={copy === 0 && i < 3 ? "eager" : "lazy"}
                      draggable={false}
                      className="marquee-img h-full w-auto max-w-none select-none"
                    />
                  </div>
                  <figcaption className="marquee-caption mt-2 w-0 min-w-full">
                    <span className="line-clamp-3 text-[12.5px] italic leading-snug text-foreground/85">
                      &ldquo;{photo.quote}&rdquo;
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[11px] uppercase tracking-wider text-secondary">
                      {photo.caption}
                    </span>
                  </figcaption>
                </figure>
              </li>
            )),
          )}
        </ul>
      </div>

      </div>

      <SongCard />
    </Container>
  );
}

/**
 * Drives the photo strip by hand (one transform per frame):
 * - auto: a calm drift to the left
 * - drag / swipe: grab and fling it; it keeps gliding with momentum, then eases back
 *   into the drift. Horizontal trackpad scrolling moves it the same way.
 * - arrows: glide one photo at a time
 * - page scrolling gives it a gentle push; hover eases it to a stop
 * - photos near the middle are brighter and sit a touch higher, images drift inside
 *   their frames for depth, the strip leans slightly with speed, and a thin progress
 *   line shows the position in the loop
 * With reduced motion it is a plain swipeable row. Returns `nudge(dir)` for the arrows.
 */
function useMarquee(
  regionRef: React.RefObject<HTMLDivElement | null>,
  trackRef: React.RefObject<HTMLUListElement | null>,
  progressRef: React.RefObject<HTMLDivElement | null>,
) {
  const api = useRef<{ nudge: (dir: 1 | -1) => void }>({ nudge: () => {} });

  useEffect(() => {
    const region = regionRef.current;
    const track = trackRef.current;
    if (!region || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const BASE = 34; // px per second
    let x = 0;
    let speed = BASE; // px/s, positive = moving left
    let held = false;
    let dragging = false;
    let raf = 0;
    let last = 0;
    let lastScroll = window.scrollY;
    let push = 0;
    let skew = 0;
    let idleUntil = 0; // after a manual move, wait before resuming the drift

    type Item = { el: HTMLElement; img: HTMLElement | null; left: number; width: number; tilt: number };
    let items: Item[] = [];
    // Alternating left/right tilts in degrees, varied so it never looks mechanical.
    const TILTS = [-2.4, 1.8, -1.2, 2.6, -2, 1.3, -2.8, 1.6, -1.5, 2.2];
    const measure = () => {
      items = Array.from(track.children).map((el, i) => ({
        tilt: TILTS[i % (track.children.length / 2 || 1) % TILTS.length]!,
        el: el as HTMLElement,
        img: (el as HTMLElement).querySelector<HTMLElement>(".marquee-img"),
        left: (el as HTMLElement).offsetLeft,
        width: (el as HTMLElement).offsetWidth,
      }));
    };
    measure();
    window.addEventListener("resize", measure);
    track.querySelectorAll("img").forEach((img) => img.addEventListener("load", measure));

    const loopWidth = () => track.scrollWidth / 2 + 8;
    const wrap = () => {
      const L = loopWidth();
      x = ((x % L) - L) % L;
    };

    const paint = (dt: number) => {
      const lean = Math.max(-2.5, Math.min(2.5, (speed - BASE) * -0.005));
      skew += (lean - skew) * Math.min(1, dt * 4);
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;

      const vc = region.clientWidth / 2;
      const span = region.clientWidth * 0.6;
      for (const it of items) {
        const off = x + it.left + it.width / 2 - vc;
        const f0 = 1 - Math.min(1, Math.abs(off) / span);
        const f = f0 * f0 * (3 - 2 * f0);
        // Loose-print look: each photo keeps its own small tilt, easing straighter as it
        // passes the middle.
        const tilt = it.tilt * (1 - 0.65 * f);
        it.el.style.transform = `translate3d(0, ${((1 - f) * 6).toFixed(2)}px, 0) rotate(${tilt.toFixed(2)}deg)`;
        it.el.style.opacity = (0.55 + 0.45 * f).toFixed(3);
        if (it.img) it.img.style.transform = `translate3d(${(-off * 0.016).toFixed(1)}px,0,0) scale(1.2)`;
      }
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${(-x / loopWidth()).toFixed(4)})`;
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;

      if (!dragging) {
        const scrolled = window.scrollY - lastScroll;
        push = Math.max(-260, Math.min(360, push + scrolled * 4));
        push *= Math.pow(0.15, dt);
        const resting = now < idleUntil;
        const target = held || resting ? 0 : BASE + push;
        // Momentum: speed glides toward the target, so flings coast and settle.
        speed += (target - speed) * Math.min(1, dt * (held || resting ? 2.4 : 1.6));
        x -= speed * dt;
        wrap();
      }
      lastScroll = window.scrollY;
      paint(dt);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (raf) return;
      last = 0;
      lastScroll = window.scrollY;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([entry]) => (entry!.isIntersecting ? start() : stop()));
    io.observe(region);

    // Drag / swipe with momentum.
    let startX = 0;
    let startPos = 0;
    let lastX = 0;
    let lastT = 0;
    let vel = 0; // px/s of the pointer
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      startX = lastX = e.clientX;
      startPos = x;
      lastT = performance.now();
      vel = 0;
      region.setPointerCapture(e.pointerId);
      region.classList.add("is-dragging");
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - lastT) / 1000;
      vel = vel * 0.6 + ((e.clientX - lastX) / dt) * 0.4;
      lastX = e.clientX;
      lastT = now;
      x = startPos + (e.clientX - startX);
      wrap();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      region.releasePointerCapture?.(e.pointerId);
      region.classList.remove("is-dragging");
      speed = Math.max(-2600, Math.min(2600, -vel)); // fling
      idleUntil = performance.now() + 1400;
    };
    region.addEventListener("pointerdown", onDown);
    region.addEventListener("pointermove", onMove);
    region.addEventListener("pointerup", onUp);
    region.addEventListener("pointercancel", onUp);

    // Horizontal trackpad / shift+wheel scrolling.
    const onWheel = (e: WheelEvent) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      x -= dx;
      wrap();
      speed = Math.max(-1800, Math.min(1800, dx * 18));
      idleUntil = performance.now() + 1200;
    };
    region.addEventListener("wheel", onWheel, { passive: false });

    // Hover eases it to a stop (not while dragging).
    const hold = () => (held = true);
    const release = () => (held = false);
    region.addEventListener("pointerenter", hold);
    region.addEventListener("pointerleave", release);
    region.addEventListener("focusin", hold);
    region.addEventListener("focusout", release);

    api.current.nudge = (dir) => {
      const step = (items[0]?.width ?? 220) + 16;
      // An impulse that coasts roughly one photo before settling.
      speed = dir * step * 2.2;
      idleUntil = performance.now() + 1400;
      start();
    };

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", measure);
      region.removeEventListener("pointerdown", onDown);
      region.removeEventListener("pointermove", onMove);
      region.removeEventListener("pointerup", onUp);
      region.removeEventListener("pointercancel", onUp);
      region.removeEventListener("wheel", onWheel);
      region.removeEventListener("pointerenter", hold);
      region.removeEventListener("pointerleave", release);
      region.removeEventListener("focusin", hold);
      region.removeEventListener("focusout", release);
    };
  }, [regionRef, trackRef, progressRef]);

  return (dir: 1 | -1) => api.current.nudge(dir);
}
