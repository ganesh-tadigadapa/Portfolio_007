"use client";

import { Pause, Play, SkipBack, SkipForward } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { isSoundOn, onSoundChange, setSoundOn } from "@/lib/theme-click-sound";
import { cn } from "@/lib/utils";

/**
 * A small playlist player that sits with the photos: album art (with its colours
 * glowing softly behind the card), title, artist, progress, and prev / play / next.
 * When a song ends the next one starts. Audio is each song's official 30-second
 * preview streamed from Apple, loaded only when played. The header sound switch
 * mutes it like every other sound on the site.
 */
type Song = { title: string; artist: string; preview: string; art: string; link: string };

const PLAYLIST: Song[] = [
  {
    title: "Softcore",
    artist: "The Neighbourhood",
    preview:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1b/08/9e/1b089e17-1084-d825-d576-66d46ae1e243/mzaf_11823295334220528749.plus.aac.p.m4a",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/fc/d0/89/fcd0899c-2236-a726-9ce2-ebb110e2204d/886447414545.jpg/300x300bb.jpg",
    link: "https://music.apple.com/in/album/softcore/1440532502?i=1440532753",
  },
  {
    title: "blue",
    artist: "yung kai",
    preview:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/35/82/0f/35820f58-856a-3def-922c-d554152e0c0d/mzaf_3599226039290781217.plus.aac.p.m4a",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/33/62/62/33626226-0cf3-ff64-3296-b2355de71fac/0748777703419.jpg/300x300bb.jpg",
    link: "https://music.apple.com/in/album/blue/1776246883?i=1776246888",
  },
];

const NOTE = "Every frame here had a song playing in my head. These two never leave the playlist.";

const time = (s: number) =>
  Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";

export function SongCard() {
  const audio = useRef<HTMLAudioElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const wantPlay = useRef(false); // keep playing across track changes
  const song = PLAYLIST[index]!;

  const go = useCallback((dir: 1 | -1) => {
    const a = audio.current;
    wantPlay.current = !!a && !a.paused;
    setIndex((i) => (i + dir + PLAYLIST.length) % PLAYLIST.length);
  }, []);

  // New track loaded: reset progress, and carry on playing if we were.
  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    if (bar.current) bar.current.style.transform = "scaleX(0)";
    if (clock.current) clock.current.textContent = "0:00";
    if (wantPlay.current) void a.play().catch(() => setPlaying(false));
  }, [index]);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    let raf = 0;
    const tick = () => {
      if (a.duration) {
        if (bar.current) bar.current.style.transform = `scaleX(${a.currentTime / a.duration})`;
        if (clock.current) clock.current.textContent = time(a.currentTime);
      }
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      setPlaying(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(raf);
    };
    const onEnd = () => {
      wantPlay.current = true;
      setIndex((i) => (i + 1) % PLAYLIST.length);
    };
    const offSound = onSoundChange(() => {
      if (!isSoundOn()) a.pause();
    });
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnd);
    return () => {
      cancelAnimationFrame(raf);
      offSound();
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) {
      if (!isSoundOn()) setSoundOn(true); // pressing play turns sounds back on
      void a.play().catch(() => setPlaying(false));
    } else {
      a.pause();
    }
  };

  return (
    <div data-reveal className="relative mt-8 overflow-hidden rounded-2xl border border-border bg-card/70">
      {/* The cover's colours, blurred into a soft glow behind everything. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={song.art}
        src={song.art}
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-10 top-1/2 size-56 -translate-y-1/2 scale-125 opacity-25 blur-3xl transition-opacity duration-700 dark:opacity-30"
      />

      <div className="relative flex items-center gap-4 p-4 sm:gap-5 sm:p-5">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)] ring-1 ring-black/5 sm:size-[72px] dark:ring-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={song.art} src={song.art} alt={`${song.title} cover`} className="size-full object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-secondary">
            <Equalizer active={playing} />
            {playing ? "Now playing" : "On my playlist"} &middot; {index + 1}/{PLAYLIST.length}
          </p>
          <p className="mt-1 truncate text-[15px] font-semibold leading-tight">{song.title}</p>
          <p className="truncate text-[13px] text-secondary">{song.artist}</p>

          <div className="mt-2.5 flex items-center gap-2.5">
            <span ref={clock} className="w-7 font-mono text-[10px] tabular-nums text-secondary">
              0:00
            </span>
            <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-foreground/10">
              <div ref={bar} className="h-full origin-left scale-x-0 rounded-full bg-foreground/75" />
            </div>
            <span className="w-7 text-right font-mono text-[10px] tabular-nums text-secondary">0:30</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <ControlButton label="Previous song" onClick={() => go(-1)} className="hidden sm:inline-flex">
            <SkipBack className="size-4" weight="fill" />
          </ControlButton>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? `Pause ${song.title}` : `Play ${song.title} by ${song.artist}`}
            className="inline-flex size-10 items-center justify-center rounded-full bg-foreground text-background shadow-sm transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? <Pause className="size-4" weight="fill" /> : <Play className="size-4 translate-x-px" weight="fill" />}
          </button>
          <ControlButton label="Next song" onClick={() => go(1)}>
            <SkipForward className="size-4" weight="fill" />
          </ControlButton>
        </div>
      </div>

      <div className="relative flex items-center justify-between gap-4 border-t border-border/70 px-4 py-3 sm:px-5">
        <p className="text-[12.5px] italic leading-relaxed text-foreground/75">&ldquo;{NOTE}&rdquo;</p>
        <a
          href={song.link}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-secondary hover:text-foreground"
        >
          Preview ↗
        </a>
      </div>

      <audio ref={audio} src={song.preview} preload="none" />
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-foreground/5 hover:text-foreground active:scale-95",
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Three tiny bars that bounce while music plays, and rest flat when it doesn't. */
function Equalizer({ active }: { active: boolean }) {
  return (
    <span aria-hidden className="flex h-2.5 items-end gap-[2px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn("eq-bar w-[2px] rounded-full bg-current", active ? "eq-on" : "h-[3px]")}
          style={{ animationDelay: `${i * 0.18}s` }}
        />
      ))}
    </span>
  );
}
