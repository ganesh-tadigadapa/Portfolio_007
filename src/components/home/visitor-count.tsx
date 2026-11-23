"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/container";

/** "st", "nd", "rd" or "th" for a number: 1st, 2nd, 3rd, 11th, 21st... */
function ordinalSuffix(n: number) {
  const lastTwo = n % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return "th";
  return ["th", "st", "nd", "rd"][n % 10] ?? "th";
}

export function VisitorCount() {
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

  return (
    <Container className="flex justify-center">
      <p
        data-reveal
        className="inline-flex items-center gap-2.5 rounded-full border border-border bg-background/40 py-1.5 pl-3 pr-4 text-sm text-secondary backdrop-blur-sm"
      >
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
      </p>
    </Container>
  );
}
