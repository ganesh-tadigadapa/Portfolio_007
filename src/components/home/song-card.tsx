"use client";

import { Pause, Play } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { isSoundOn, onSoundChange, setSoundOn } from "@/lib/theme-click-sound";

/**
 * The song that goes with the photos: a small vinyl that spins while it plays, the
 * title, a thin progress line and a line about the playlist. Audio is the official
 * 30-second preview streamed from Apple (nothing hosted here), loaded only on play.
 */
const SONG = {
  title: "Softcore",
  artist: "The Neighbourhood",
  preview:
    "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1b/08/9e/1b089e17-1084-d825-d576-66d46ae1e243/mzaf_11823295334220528749.plus.aac.p.m4a",
  link: "https://music.apple.com/in/album/softcore/1440532502?i=1440532753",
  note: "Every frame here had a song playing in my head. This one never leaves the playlist.",
};

export function SongCard() {
  const audio = useRef<HTMLAudioElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    let raf = 0;
    const tick = () => {
      if (bar.current && a.duration) {
        bar.current.style.transform = `scaleX(${a.currentTime / a.duration})`;
      }
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      setPlaying(true);
      raf = requestAnimationFrame(tick);
    };
    const onStop = () => {
      setPlaying(false);
      cancelAnimationFrame(raf);
    };
    const onEnd = () => {
      onStop();
      if (bar.current) bar.current.style.transform = "scaleX(0)";
    };
    // The speaker button in the header mutes everything, the song included.
    const offSound = onSoundChange(() => {
      if (!isSoundOn()) a.pause();
    });
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onStop);
    a.addEventListener("ended", onEnd);
    return () => {
      cancelAnimationFrame(raf);
      offSound();
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onStop);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) {
      // Pressing play while sounds are off turns them back on.
      if (!isSoundOn()) setSoundOn(true);
      void a.play().catch(() => setPlaying(false));
    }
    else a.pause();
  };

  return (
    <div
      data-reveal
      className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5"
    >
      <div className="flex min-w-0 items-center gap-4 sm:w-64 sm:shrink-0">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause ${SONG.title}` : `Play ${SONG.title} by ${SONG.artist}`}
          className="group relative size-14 shrink-0 rounded-full"
        >
          {/* Vinyl: grooves, a soft sheen, and a small label in the middle. */}
          <span
            aria-hidden
            className="vinyl absolute inset-0 rounded-full shadow-[0_6px_18px_-8px_rgba(0,0,0,0.6)]"
            style={{ animationPlayState: playing ? "running" : "paused" }}
          />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-transform group-hover:scale-110">
              {playing ? <Pause className="size-3" weight="fill" /> : <Play className="size-3 translate-x-px" weight="fill" />}
            </span>
          </span>
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{SONG.title}</p>
          <p className="truncate text-[12.5px] text-secondary">{SONG.artist}</p>
          <div className="mt-2 h-[2px] overflow-hidden rounded-full bg-foreground/10">
            <div ref={bar} className="h-full origin-left scale-x-0 rounded-full bg-foreground/70" />
          </div>
        </div>
      </div>

      <div aria-hidden className="hidden h-10 w-px bg-border sm:block" />

      <p className="text-[13px] italic leading-relaxed text-foreground/80">
        &ldquo;{SONG.note}&rdquo;
        <a
          href={SONG.link}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 whitespace-nowrap font-mono text-[10px] not-italic uppercase tracking-wider text-secondary hover:text-foreground"
        >
          30s preview ↗
        </a>
      </p>

      <audio ref={audio} src={SONG.preview} preload="none" />
    </div>
  );
}
