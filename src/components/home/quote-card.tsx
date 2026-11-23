"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/container";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { quoteConfig } from "@/config/quote";

/** "st", "nd", "rd" or "th" for a number: 1st, 2nd, 3rd, 11th, 21st... */
function ordinalSuffix(n: number) {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] ?? "th";
}

/** Splits the quote into words, marking the ones inside **double asterisks**. */
function quoteWords(text: string) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .flatMap((part) => {
      const highlighted = part.startsWith("**") && part.endsWith("**");
      const clean = highlighted ? part.slice(2, -2) : part;
      return clean
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => ({ word, highlighted }));
    });
}

const words = quoteWords(quoteConfig.text);

function useVisitorCount() {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Count each visitor once per browser tab; after that, just read the total.
    const COUNTED_KEY = "visitor-counted";
    const isNewVisit = !sessionStorage.getItem(COUNTED_KEY);

    const load = async () => {
      try {
        const res = await fetch("/api/visitors", { method: isNewVisit ? "POST" : "GET" });
        if (!res.ok) throw new Error("count failed");
        const data = (await res.json()) as { count: number };
        if (isNewVisit) sessionStorage.setItem(COUNTED_KEY, "true");
        setCount(data.count);
      } catch {
        setFailed(true);
      }
    };

    void load();
  }, []);

  return { count, failed };
}

export function QuoteCard() {
  const { count, failed } = useVisitorCount();
  const figureRef = useRef<HTMLElement>(null);

  // Words start hidden only once JavaScript is running, then reveal when the card scrolls in.
  useEffect(() => {
    const figure = figureRef.current;
    if (!figure) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    figure.classList.add("quote-armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        figure.classList.add("quote-in");
        observer.disconnect();
      },
      { threshold: 0.45 },
    );
    observer.observe(figure);
    return () => observer.disconnect();
  }, []);

  // A soft light that follows the pointer across the card.
  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - box.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - box.top}px`);
  };

  return (
    <Container>
      <LiquidGlassCard
        glowIntensity="sm"
        shadowIntensity="md"
        borderRadius="20px"
        blurIntensity="md"
        className="animate-in-up-on-view"
      >
        <figure
          ref={figureRef}
          onPointerMove={onPointerMove}
          className="quote-card relative overflow-hidden px-6 py-8 sm:px-12 sm:py-12"
        >
          <span aria-hidden className="quote-spotlight" />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[11rem] leading-none text-foreground/[0.05] sm:right-6 sm:text-[14rem]"
          >
            &rdquo;
          </span>

          <p
            lang="sa"
            className="quote-sanskrit relative text-sm tracking-wide text-secondary sm:text-base"
          >
            {quoteConfig.sanskrit}
          </p>

          <blockquote className="relative mt-5 max-w-2xl text-balance text-2xl font-medium leading-[1.35] tracking-tight text-foreground sm:text-[2rem]">
            {words.map(({ word, highlighted }, i) => (
              <span
                key={i}
                className={highlighted ? "quote-word quote-highlight" : "quote-word"}
                style={{ "--i": i } as React.CSSProperties}
              >
                {word}{" "}
              </span>
            ))}
          </blockquote>

          <figcaption className="quote-footer relative mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-3 text-sm">
              <span className="h-px w-8 bg-foreground/40" />
              <span className="font-medium text-foreground">{quoteConfig.source}</span>
              <span className="rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] text-secondary">
                {quoteConfig.verse}
              </span>
            </span>

            <span className="inline-flex w-fit items-center gap-2.5 rounded-full border border-border bg-background/40 py-1.5 pl-3 pr-4 text-sm text-secondary backdrop-blur-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/40 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-foreground/70" />
              </span>
              {count !== null ? (
                <span>
                  You&apos;re the{" "}
                  <strong className="font-semibold text-foreground">{count.toLocaleString()}</strong>
                  <sup className="ml-0.5 text-[10px]">{ordinalSuffix(count)}</sup> visitor
                </span>
              ) : failed ? (
                <span>Thanks for stopping by</span>
              ) : (
                <span>Counting visitors…</span>
              )}
            </span>
          </figcaption>
        </figure>
      </LiquidGlassCard>
    </Container>
  );
}
