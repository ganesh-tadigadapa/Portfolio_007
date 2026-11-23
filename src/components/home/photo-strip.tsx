"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { photosConfig, type Photo } from "@/config/photos";

/**
 * An endless, slowly drifting row of photos (a marquee). The list is rendered twice
 * side by side and the track slides left by exactly one copy, so the loop is seamless.
 * Hovering or focusing pauses it; with reduced motion it becomes a normal scroller.
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
    // The loop joins the last photo to the first, so check that seam too.
    if (ok && a[0].group !== a[a.length - 1].group) return a;
  }
  return list;
}

export function PhotoStrip() {
  // Server render uses the configured order; each visit then gets a fresh shuffle.
  const [photos, setPhotos] = useState<Photo[]>(photosConfig.photos);
  useEffect(() => setPhotos(shuffleApart(photosConfig.photos)), []);

  if (photosConfig.photos.length === 0) return null;

  // Roughly 7s per photo keeps the drift calm regardless of how many there are.
  const duration = `${photos.length * 7}s`;

  return (
    <section>
      <Container>
        <SectionHeading eyebrow="Off the clock" title={photosConfig.title} />
        <p data-reveal className="text-secondary">
          {photosConfig.description}
        </p>
      </Container>

      <div
        role="region"
        aria-label="Photographs"
        tabIndex={0}
        className="marquee group/marquee relative mx-auto mt-8 max-w-6xl overflow-hidden focus-visible:outline-none"
      >
        <ul
          className="marquee-track flex w-max gap-5 py-3"
          style={{ animationDuration: duration }}
        >
          {[0, 1].map((copy) =>
            photos.map((photo, i) => (
              <li
                key={`${copy}-${photo.src}`}
                aria-hidden={copy === 1 || undefined}
                className="w-[260px] shrink-0 sm:w-[300px]"
              >
                <figure>
                  <div className="aspect-[4/3] overflow-hidden rounded-[22px] bg-muted shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/5 dark:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.7)] dark:ring-white/10">
                    <Image
                      src={photo.src}
                      alt={copy === 1 ? "" : photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes="300px"
                      loading={copy === 0 && i < 4 ? "eager" : "lazy"}
                      className="h-full w-full object-cover transition-[filter,transform] duration-700 ease-out hover:scale-[1.04] dark:brightness-90 dark:hover:brightness-100"
                    />
                  </div>
                  <figcaption className="mt-3 px-1">
                    <span className="line-clamp-2 text-[13px] italic leading-relaxed text-foreground/80">
                      &ldquo;{photo.quote}&rdquo;
                    </span>
                    <span className="mt-1 block truncate font-mono text-[10.5px] uppercase tracking-[0.14em] text-secondary">
                      {photo.caption}
                    </span>
                  </figcaption>
                </figure>
              </li>
            )),
          )}
        </ul>

        {/* Soft fades on both edges so photos drift in and out gently. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent sm:w-32"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent sm:w-32"
        />
      </div>
    </section>
  );
}
