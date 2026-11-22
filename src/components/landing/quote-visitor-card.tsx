"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/container";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { quoteConfig } from "@/config/quote";
import { getOrdinalSuffix } from "@/lib/ordinal";

export function QuoteVisitorCard() {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const key = "visitor-counted";
    const alreadyCounted = sessionStorage.getItem(key);

    const load = async () => {
      try {
        if (!alreadyCounted) {
          const res = await fetch("/api/visitors", { method: "POST" });
          if (!res.ok) throw new Error("count failed");
          const data = (await res.json()) as { count: number };
          sessionStorage.setItem(key, "true");
          setCount(data.count);
          return;
        }

        const res = await fetch("/api/visitors");
        if (!res.ok) throw new Error("count failed");
        const data = (await res.json()) as { count: number };
        setCount(data.count);
      } catch {
        setFailed(true);
      }
    };

    void load();
  }, []);

  return (
    <Container>
      <LiquidGlassCard
        glowIntensity="sm"
        shadowIntensity="md"
        borderRadius="20px"
        blurIntensity="md"
        className="animate-in-up-on-view"
      >
        <figure className="relative p-6 sm:p-10">
          <span
            aria-hidden
            className="pointer-events-none absolute right-6 top-4 select-none font-serif text-[7rem] leading-[0.8] text-foreground/[0.07] sm:right-10 sm:top-6"
          >
            &rdquo;
          </span>
          <blockquote className="relative max-w-2xl text-balance text-xl font-medium leading-snug tracking-tight text-foreground sm:text-2xl">
            {quoteConfig.text}
          </blockquote>
          <figcaption className="relative mt-8 flex flex-col gap-3 border-t border-border pt-5 text-sm text-secondary sm:flex-row sm:items-center sm:justify-between">
            <span>— {quoteConfig.author}</span>
            <span className="inline-flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-foreground/40 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-foreground/70" />
              </span>
              {count !== null ? (
                <span>
                  You&apos;re the{" "}
                  <strong className="font-semibold text-foreground">{count.toLocaleString()}</strong>
                  <sup className="ml-0.5 text-[10px]">{getOrdinalSuffix(count)}</sup> visitor
                </span>
              ) : failed ? (
                <span>Thanks for visiting</span>
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
