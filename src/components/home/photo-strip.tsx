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
  useMarquee(regionRef, trackRef);

  if (photosConfig.photos.length === 0) return null;

  return (
    <Container>
      <SectionHeading eyebrow="Off the clock" title={photosConfig.title} />
      <p data-reveal className="text-secondary">
        {photosConfig.description}
      </p>

      <div
        ref={regionRef}
        tabIndex={0}
        role="region"
        aria-label="Photographs"
        className="marquee relative mt-6 overflow-hidden focus-visible:outline-none"
      >
        <ul ref={trackRef} className="marquee-track flex w-max gap-3">
          {[0, 1].map((copy) =>
            photos.map((photo, i) => (
              <li
                key={`${copy}-${photo.src}`}
                aria-hidden={copy === 1 || undefined}
                className="shrink-0"
              >
                <figure>
                  <div className="h-40 overflow-hidden rounded-lg border border-border bg-muted sm:h-48">
                    <Image
                      src={photo.src}
                      alt={copy === 1 ? "" : photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes="(min-width: 640px) 420px, 300px"
                      loading={copy === 0 && i < 3 ? "eager" : "lazy"}
                      className="h-full w-auto max-w-none transition-[filter,transform] duration-500 hover:scale-[1.03] dark:brightness-90 dark:hover:brightness-100"
                    />
                  </div>
                  <figcaption className="mt-2 w-0 min-w-full">
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

        {/* Edge fades so photos slide in and out softly. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent"
        />
      </div>

      <SongCard />
    </Container>
  );
}

/**
 * Drives the photo marquee by hand (one transform per frame) so it can feel alive:
 * - a calm base drift to the left
 * - page scrolling pushes it: scrolling down speeds it up, scrolling up nudges it back
 * - hover or keyboard focus eases it to a stop, and leaving eases it back to speed
 * Speed always glides toward its target, so nothing ever jumps. It only runs while the
 * strip is on screen, and not at all with reduced motion (then it's a swipeable row).
 */
function useMarquee(
  regionRef: React.RefObject<HTMLDivElement | null>,
  trackRef: React.RefObject<HTMLUListElement | null>,
) {
  useEffect(() => {
    const region = regionRef.current;
    const track = trackRef.current;
    if (!region || !track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const BASE = 38; // px per second
    let x = 0;
    let speed = BASE;
    let held = false;
    let visible = false;
    let raf = 0;
    let last = 0;
    let lastScroll = window.scrollY;
    let push = 0; // extra speed from page scrolling, decays away

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;

      const scrolled = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      push = Math.max(-700, Math.min(900, push + scrolled * 9)); // down → faster left; up → drifts back
      push *= Math.pow(0.04, dt); // fade the push out over ~half a second

      const target = held ? 0 : BASE + push;
      speed += (target - speed) * Math.min(1, dt * (held ? 5 : 3.5));

      // One copy of the list (+ its trailing gap) is exactly half the track.
      const loopWidth = track.scrollWidth / 2 + 6;
      x = (((x - speed * dt) % loopWidth) - loopWidth) % loopWidth;
      track.style.transform = `translate3d(${x}px, 0, 0)`;

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

    const io = new IntersectionObserver(([entry]) => {
      visible = entry!.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(region);

    const hold = () => (held = true);
    const release = () => (held = false);
    region.addEventListener("pointerenter", hold);
    region.addEventListener("pointerleave", release);
    region.addEventListener("focusin", hold);
    region.addEventListener("focusout", release);

    return () => {
      stop();
      io.disconnect();
      region.removeEventListener("pointerenter", hold);
      region.removeEventListener("pointerleave", release);
      region.removeEventListener("focusin", hold);
      region.removeEventListener("focusout", release);
    };
  }, [regionRef, trackRef]);
}
