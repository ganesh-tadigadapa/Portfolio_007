"use client";

import { ArrowUp, Check, Copy } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

/** Small icon button that copies a value (email, phone) and briefly shows a tick. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked: nothing to do, the link next to it still works.
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-secondary transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? <Check className="size-3.5 text-emerald-500" weight="bold" /> : <Copy className="size-3.5" />}
    </button>
  );
}

/** Current time in Hyderabad (IST), updated every 30 seconds. */
export function LocalTime() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return <span>--:--</span>;
  return (
    <span className="tabular-nums">
      {now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })}
    </span>
  );
}

export function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="group inline-flex items-center gap-1.5 text-[12.5px] font-medium text-secondary transition-colors hover:text-foreground"
    >
      Back to top
      <span className="inline-flex size-7 items-center justify-center rounded-full border border-border transition-transform group-hover:-translate-y-0.5">
        <ArrowUp className="size-3.5" />
      </span>
    </button>
  );
}
