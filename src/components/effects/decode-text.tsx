"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Text that decodes, letter by letter. Each letter that isn't revealed yet softly cycles
 * through a few dim characters at a calm pace (not every frame); when its turn comes it
 * settles into the real letter with a short blur-to-sharp lift. Letters resolve left to
 * right in a cascade. The real letter always occupies the space (the cycling glyph sits
 * on top of it), so the layout never jumps. Screen readers get the plain text.
 *
 * Plays once the intro on screen has finished (or straight away if there is none).
 */
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
const CYCLE_MS = 70; // how often an unrevealed letter changes
const STAGGER_MS = 45; // gap between letters resolving
const LEAD_MS = 220; // scramble time before the first letter resolves
const HEAT_MS = 260; // how far ahead of the resolving edge glyphs start to brighten

type State = { revealed: boolean; glyph: string; heat: number };

export function DecodeText({ text }: { text: string }) {
  const letters = [...text];
  const [states, setStates] = useState<State[] | null>(null);
  const raf = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rand = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]!;
    const scrambled = (): State[] => letters.map((ch) => ({ revealed: ch === " ", glyph: rand(), heat: 0 }));
    // How close a letter is to resolving: 0 far away → 1 at its turn. Drives the scan glow.
    const heatAt = (i: number, t: number) => Math.max(0, Math.min(1, 1 - (LEAD_MS + i * STAGGER_MS - t) / HEAT_MS));

    const run = () => {
      let start = 0;
      let lastCycle = 0;
      let current = scrambled();
      const tick = (now: number) => {
        if (!start) start = now;
        const t = now - start;
        let changed = false;
        const next = current.map((s, i) => {
          if (s.revealed) return s;
          if (t >= LEAD_MS + i * STAGGER_MS) {
            changed = true;
            return { revealed: true, glyph: letters[i]!, heat: 1 };
          }
          return s;
        });
        if (now - lastCycle > CYCLE_MS) {
          lastCycle = now;
          changed = true;
          next.forEach((s, i) => {
            if (!s.revealed) next[i] = { revealed: false, glyph: rand(), heat: heatAt(i, t) };
          });
        }
        if (changed) {
          current = next;
          setStates(next);
        }
        if (next.some((s) => !s.revealed)) raf.current = requestAnimationFrame(tick);
      };
      raf.current = requestAnimationFrame(tick);
    };

    const waitFor = document.querySelector("[data-build-intro]")
      ? "build-intro:finished"
      : document.querySelector(".site-intro") && !document.documentElement.hasAttribute("data-intro-done")
        ? "site-intro:done"
        : null;
    if (waitFor) {
      setStates(scrambled());
      document.addEventListener(waitFor, run, { once: true });
    } else {
      run();
    }
    return () => {
      cancelAnimationFrame(raf.current);
      if (waitFor) document.removeEventListener(waitFor, run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  if (!states) return <>{text}</>;

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="decode">
        {letters.map((ch, i) => {
          const s = states[i]!;
          return (
            <span key={i} className="decode-slot">
              {/* The real letter holds the space; it fades in when revealed. */}
              <span className={s.revealed ? "decode-real decode-in" : "decode-real decode-hidden"}>
                {ch === " " ? " " : ch}
              </span>
              {!s.revealed && (
                <span
                  className={s.heat > 0.55 ? "decode-glyph decode-glyph-hot" : "decode-glyph"}
                  style={{ opacity: 0.6 + 0.4 * s.heat }}
                >
                  {s.glyph}
                </span>
              )}
            </span>
          );
        })}
      </span>
    </>
  );
}
