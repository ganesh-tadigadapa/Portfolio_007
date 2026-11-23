"use client";

import { Pause, Play, SkipBack, SkipForward } from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { isSoundOn, onSoundChange, setSoundOn } from "@/lib/theme-click-sound";
import { cn } from "@/lib/utils";

/**
 * Compact playlist card: a small cover with its record peeking out (it slides out and
 * spins while playing), title, artist, a thin progress line, and prev / play / next.
 * Lightly tinted by the cover's colour; the playlist line sits underneath in the same
 * caption style as the photos. When a song ends the next one starts.
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
    <figure data-reveal className="mt-8 w-full sm:max-w-md">
      <div
        className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card/60 py-2.5 pl-2.5 pr-2 transition-[background-image] duration-700"
        style={{ backgroundImage: `linear-gradient(90deg, rgb(${song.tint} / 0.14), transparent 55%)` }}
      >
        {/* Cover with its record peeking out; the record slides out and spins while playing. */}
        <div className="relative shrink-0" style={{ width: 64, height: 48 }}>
          <div
            className="absolute transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ left: 4, top: 4, width: 40, height: 40, transform: `translateX(${playing ? 20 : 10}px)` }}
          >
            <div className={cn("record size-full rounded-full", playing && "record-spin")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={`label-${song.art}`}
                src={song.art}
                alt=""
                aria-hidden
                className="absolute rounded-full object-cover"
                style={{ left: "32%", top: "32%", width: "36%", height: "36%" }}
              />
            </div>
          </div>
          <div
            className="absolute overflow-hidden rounded-md shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6)] ring-1 ring-black/10 dark:ring-white/10"
            style={{ left: 0, top: 0, width: 48, height: 48 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={`cover-${song.art}`} src={song.art} alt={`${song.title} cover`} className="song-fade size-full object-cover" />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p key={song.title} className="song-fade truncate text-sm font-semibold leading-tight">
              {song.title}
            </p>
            <span className="shrink-0 font-mono text-[9.5px] tabular-nums text-secondary">
              {String(index + 1).padStart(2, "0")}/{String(PLAYLIST.length).padStart(2, "0")}
            </span>
          </div>
          <p className="truncate text-[12px] text-secondary">{song.artist}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-foreground/10">
              <div ref={fill} className="absolute inset-0 rounded-full bg-foreground/70" style={{ clipPath: "inset(0 100% 0 0)" }} />
            </div>
            <span ref={clock} className="w-6 text-right font-mono text-[9.5px] tabular-nums text-secondary">
              0:00
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <IconButton label="Previous song" onClick={() => go(-1)}>
            <SkipBack className="size-3.5" weight="fill" />
          </IconButton>
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? `Pause ${song.title}` : `Play ${song.title} by ${song.artist}`}
            className="inline-flex size-8 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
          >
            {playing ? <Pause className="size-3.5" weight="fill" /> : <Play className="size-3.5 translate-x-px" weight="fill" />}
          </button>
          <IconButton label="Next song" onClick={() => go(1)}>
            <SkipForward className="size-3.5" weight="fill" />
          </IconButton>
        </div>
      </div>

      {/* Same caption style as the photos above. */}
      <figcaption className="mt-2 px-1">
        <span className="text-[12.5px] italic leading-snug text-foreground/85">&ldquo;{NOTE}&rdquo;</span>
        <span className="mt-0.5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-secondary">
          {playing ? "Now playing" : "On repeat"}
          <a href={song.link} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            · preview ↗
          </a>
        </span>
      </figcaption>

      <audio ref={audio} src={song.preview} preload="none" />
    </figure>
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
      className="inline-flex size-7 items-center justify-center rounded-full text-secondary transition-colors hover:bg-foreground/5 hover:text-foreground active:scale-95"
    >
      {children}
    </button>
  );
}
