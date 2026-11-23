"use client";

import { Pause, Play, SkipBack, SkipForward } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { isSoundOn, onSoundChange, setSoundOn } from "@/lib/theme-click-sound";
import { cn } from "@/lib/utils";

/**
 * Playlist card: an album sleeve with its record peeking out. Press play and the record
 * slides further out and spins (the cover is its centre label). On the right, the title,
 * a waveform that fills as the song plays, and prev / play / next. The whole card is
 * tinted by the cover's colours. When a song ends the next one starts.
 *
 * Audio is each song's official 30-second preview streamed from Apple, loaded only
 * on play. The header sound switch mutes it like every other sound on the site.
 */
type Song = { title: string; artist: string; preview: string; art: string; link: string; tint: string };

const PLAYLIST: Song[] = [
  {
    title: "Softcore",
    artist: "The Neighbourhood",
    preview:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/1b/08/9e/1b089e17-1084-d825-d576-66d46ae1e243/mzaf_11823295334220528749.plus.aac.p.m4a",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/fc/d0/89/fcd0899c-2236-a726-9ce2-ebb110e2204d/886447414545.jpg/400x400bb.jpg",
    link: "https://music.apple.com/in/album/softcore/1440532502?i=1440532753",
    tint: "214 160 150", // dusty rose, from the cover
  },
  {
    title: "blue",
    artist: "yung kai",
    preview:
      "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/35/82/0f/35820f58-856a-3def-922c-d554152e0c0d/mzaf_3599226039290781217.plus.aac.p.m4a",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/33/62/62/33626226-0cf3-ff64-3296-b2355de71fac/0748777703419.jpg/400x400bb.jpg",
    link: "https://music.apple.com/in/album/blue/1776246883?i=1776246888",
    tint: "110 160 220", // sky blue, from the cover
  },
];

const NOTE = "Every frame here had a song playing in my head.";

// A fixed, natural-looking waveform (same every render, so no hydration mismatch).
const WAVE = Array.from({ length: 48 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 1.7) * 0.55 + Math.sin(i * 0.43) * 0.35 + Math.sin(i * 3.1) * 0.15);
  // Whole-number percentages, so server and browser render identical HTML.
  return Math.round((0.22 + Math.min(1, v) * 0.78) * 100);
});

const time = (s: number) =>
  Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00";

export function SongCard() {
  const audio = useRef<HTMLAudioElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const wantPlay = useRef(false);
  const song = PLAYLIST[index]!;

  const setProgress = (p: number) => {
    if (fill.current) fill.current.style.clipPath = `inset(0 ${100 - p * 100}% 0 0)`;
  };

  const go = useCallback((dir: 1 | -1) => {
    const a = audio.current;
    wantPlay.current = !!a && !a.paused;
    setIndex((i) => (i + dir + PLAYLIST.length) % PLAYLIST.length);
  }, []);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    setProgress(0);
    if (clock.current) clock.current.textContent = "0:00";
    if (wantPlay.current) void a.play().catch(() => setPlaying(false));
  }, [index]);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    let raf = 0;
    const tick = () => {
      if (a.duration) {
        setProgress(a.currentTime / a.duration);
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
      if (!isSoundOn()) setSoundOn(true);
      void a.play().catch(() => setPlaying(false));
    } else {
      a.pause();
    }
  };

  return (
    <div
      data-reveal
      className="relative mt-10 overflow-hidden rounded-3xl border border-border bg-card/70 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.6)] transition-[background-image] duration-700"
      style={{
        backgroundImage: `radial-gradient(120% 140% at 0% 50%, rgb(${song.tint} / 0.22), transparent 60%)`,
      }}
    >
      <div className="grid grid-cols-1 items-center gap-6 p-6 sm:grid-cols-[auto_1fr] sm:gap-9 sm:p-7">
        {/* Sleeve + record, sized inline so nothing can collapse it. */}
        <div className="relative mx-auto sm:mx-0" style={{ width: 204, height: 136 }}>
          <div
            className="absolute transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: 6, top: 6, width: 124, height: 124, transform: `translateX(${playing ? 74 : 44}px)` }}
          >
            <div className={cn("record size-full rounded-full", playing && "record-spin")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`label-${song.art}`}
                src={song.art}
                alt=""
                aria-hidden
                className="absolute rounded-full object-cover ring-2 ring-black/60"
                style={{ left: "31%", top: "31%", width: "38%", height: "38%" }}
              />
              <span
                className="absolute rounded-full bg-[#0b0b0d]"
                style={{ left: "calc(50% - 3px)", top: "calc(50% - 3px)", width: 6, height: 6 }}
              />
            </div>
          </div>
          <div
            className="absolute overflow-hidden rounded-xl shadow-[0_16px_30px_-12px_rgba(0,0,0,0.65)] ring-1 ring-black/10 dark:ring-white/10"
            style={{ left: 0, top: 0, width: 136, height: 136 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={`cover-${song.art}`} src={song.art} alt={`${song.title} cover`} className="song-fade size-full object-cover" />
          </div>
        </div>

        {/* Details */}
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-secondary">
            {playing ? "Now playing" : "On repeat"} &middot; {String(index + 1).padStart(2, "0")} /{" "}
            {String(PLAYLIST.length).padStart(2, "0")}
          </p>
          <h3 key={song.title} className="song-fade mt-1.5 truncate text-2xl font-semibold tracking-tight">
            {song.title}
          </h3>
          <p className="truncate text-sm text-secondary">{song.artist}</p>

          {/* Waveform: dim bars underneath, bright copy on top revealed as it plays. */}
          <div className="relative mt-4 h-7" aria-hidden>
            <Wave className="text-foreground/15" />
            <div ref={fill} className="absolute inset-0" style={{ clipPath: "inset(0 100% 0 0)" }}>
              <Wave className="text-foreground/80" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="font-mono text-[10px] tabular-nums text-secondary">
              <span ref={clock}>0:00</span> / 0:30
            </p>
            <div className="flex items-center gap-1">
              <IconButton label="Previous song" onClick={() => go(-1)}>
                <SkipBack className="size-4" weight="fill" />
              </IconButton>
              <button
                type="button"
                onClick={toggle}
                aria-label={playing ? `Pause ${song.title}` : `Play ${song.title} by ${song.artist}`}
                className="inline-flex size-11 items-center justify-center rounded-full bg-foreground text-background shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)] transition-transform hover:scale-105 active:scale-95"
              >
                {playing ? <Pause className="size-4" weight="fill" /> : <Play className="size-4 translate-x-px" weight="fill" />}
              </button>
              <IconButton label="Next song" onClick={() => go(1)}>
                <SkipForward className="size-4" weight="fill" />
              </IconButton>
            </div>
          </div>

          <p className="mt-4 text-[12.5px] italic text-foreground/65">
            &ldquo;{NOTE}&rdquo;
            <a
              href={song.link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 font-mono text-[9.5px] not-italic uppercase tracking-wider text-secondary/80 hover:text-foreground"
            >
              Preview ↗
            </a>
          </p>
        </div>
      </div>

      <audio ref={audio} src={song.preview} preload="none" />
    </div>
  );
}

function Wave({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 flex items-center justify-between", className)}>
      {WAVE.map((h, i) => (
        <span key={i} className="w-[2px] rounded-full bg-current" style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-full text-secondary transition-colors hover:bg-foreground/5 hover:text-foreground active:scale-95"
    >
      {children}
    </button>
  );
}
