"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// The icon grid (and its tooltips) is only downloaded when it's about to scroll into view.
const TechStackGrid = dynamic(() =>
  import("./tech-stack-grid").then((module) => module.TechStackGrid),
);

export function TechStack() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: 160 }}>
      {visible ? (
        <TechStackGrid />
      ) : (
        <div className="mx-auto max-w-3xl px-4" aria-label="Loading tech stack">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="mt-5 h-[104px] rounded-xl bg-muted/40" />
        </div>
      )}
    </div>
  );
}
