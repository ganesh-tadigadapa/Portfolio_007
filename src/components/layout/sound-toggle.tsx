"use client";

import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { isSoundOn, onSoundChange, playTick, setSoundOn } from "@/lib/theme-click-sound";
import { cn } from "@/lib/utils";

/** Small speaker button beside the theme toggle: turns the site's UI sounds on or off. */
export function SoundToggle({ className }: { className?: string }) {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    setOn(isSoundOn());
    return onSoundChange(() => setOn(isSoundOn()));
  }, []);

  if (on === null) {
    return <span className={cn("inline-flex size-8", className)} />;
  }

  return (
    <button
      type="button"
      aria-label={on ? "Turn sounds off" : "Turn sounds on"}
      aria-pressed={on}
      onClick={() => {
        setSoundOn(!on);
        if (!on) playTick();
      }}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary active:scale-95",
        className,
      )}
    >
      <span key={String(on)} className="theme-icon-in inline-flex">
        {on ? <SpeakerHigh className="size-4" /> : <SpeakerSlash className="size-4" />}
      </span>
    </button>
  );
}
