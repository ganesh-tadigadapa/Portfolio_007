"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { photosConfig, type Photo } from "@/config/photos";
import { cn } from "@/lib/utils";

/**
 * A sideways-scrolling row of photos. Every photo has the same height and keeps
 * its own aspect ratio, with a small caption underneath. The edges fade out and
 * arrow buttons appear whenever there is more to scroll in that direction.
 */
/** Random order where no two neighbours share a group (mountains next to mountains). */
function shuffleApart(list: Photo[]): Photo[] {
  for (let attempt = 0; attempt < 300; attempt++) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.every((p, i) => i === 0 || p.group !== a[i - 1].group)) return a;
  }
  return list;
}

export function PhotoStrip() {
  const scroller = useRef<HTMLDivElement>(null);
  // Server render uses the configured order; each visit then gets a fresh shuffle.
  const [photos, setPhotos] = useState<Photo[]>(photosConfig.photos);
  useEffect(() => setPhotos(shuffleApart(photosConfig.photos)), []);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (photosConfig.photos.length === 0) return null;

  return (
    <Container>
      <SectionHeading title={photosConfig.title} />
      <p data-reveal className="text-secondary">
        {photosConfig.description}
      </p>

      <div className="relative mt-6">
        <div
          ref={scroller}
          tabIndex={0}
          role="region"
          aria-label="Photographs"
          className="overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex w-max gap-3">
            {photos.map((photo, i) => (
              <li key={photo.src} className="shrink-0">
                <figure>
                  <div className="h-40 overflow-hidden rounded-lg border border-border bg-muted sm:h-48">
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={photo.width}
                      height={photo.height}
                      sizes="(min-width: 640px) 420px, 300px"
                      loading={i < 3 ? "eager" : "lazy"}
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
            ))}
          </ul>
        </div>

        {/* Edge fades and arrows, shown only when there is more to see. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent transition-opacity duration-300",
            canLeft ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent transition-opacity duration-300",
            canRight ? "opacity-100" : "opacity-0",
          )}
        />
        <ArrowButton side="left" visible={canLeft} onClick={() => scrollBy(-1)} />
        <ArrowButton side="right" visible={canRight} onClick={() => scrollBy(1)} />
      </div>
    </Container>
  );
}

function ArrowButton({
  side,
  visible,
  onClick,
}: {
  side: "left" | "right";
  visible: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? CaretLeft : CaretRight;
  return (
    <button
      type="button"
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
      aria-label={side === "left" ? "Previous photos" : "More photos"}
      className={cn(
        "absolute top-20 -translate-y-1/2 rounded-full border border-border bg-background/80 p-1.5 text-secondary shadow-sm backdrop-blur transition-all duration-300 hover:text-foreground sm:top-24",
        side === "left" ? "left-2" : "right-2",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <Icon className="size-4" weight="bold" />
    </button>
  );
}
