"use client";

import { ArrowUp, Check, Copy } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

/** The email in large type: click to copy (with a brief "Copied"), or mail directly. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <a
        href={`mailto:${email}`}
        className="group text-lg font-medium tracking-tight underline decoration-border decoration-1 underline-offset-[6px] transition-colors hover:decoration-foreground sm:text-xl"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12px] font-medium text-secondary transition-colors hover:bg-muted hover:text-foreground"
      >
        {copied ? <Check className="size-3.5 text-emerald-500" weight="bold" /> : <Copy className="size-3.5" />}
        {copied ? "Copied" : "Copy email"}
      </button>
    </div>
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
