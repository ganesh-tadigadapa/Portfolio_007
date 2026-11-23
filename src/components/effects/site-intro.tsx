"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-screen intro shown on every full page load (including reloads).
 * Moving between pages inside the site does not replay it.
 *
 * A Japanese word rotates above a large 0–100% counter. The counter follows
 * real load signals (fonts, then the window load event), never Math.random.
 * A minimum duration means the sequence is always seen, and a failsafe means
 * a slow asset can never hold it open. At 100% it says "Welcome" and wipes
 * upward to reveal the site. Enter / Escape skips it.
 */

const WORDS: ReadonlyArray<readonly [string, string]> = [
  ["静寂", "Seijaku · Silence"],
  ["創造", "Souzou · Create"],
  ["未来", "Mirai · Future"],
  ["光", "Hikari · Light"],
  ["夢", "Yume · Dream"],
  ["情熱", "Jounetsu · Passion"],
];
const WELCOME = ["ようこそ", "Youkoso · Welcome"] as const;
const TAGS = { tl: "起動 / booting", bl: "IND · 12.97°N", br: "2026" };
const LABEL = "Loading Experience";
const MIN_DURATION_MS = 1600;
const WORD_INTERVAL_MS = 950;

/**
 * Runs before first paint (from <head>):
 * - turns off the browser's scroll restoration so every load starts at the top
 * - marks <html> with reveal-pending so scroll-reveal targets start hidden
 *   (ScrollReveal takes over and plays them once the intro wipes away).
 */
export const siteIntroBootScript = `(function(){try{history.scrollRestoration="manual";}catch(e){}window.scrollTo(0,0);var d=document.documentElement;if(!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("reveal-pending");})()`;

export function SiteIntro() {
  const [mounted, setMounted] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const kanjiRef = useRef<HTMLDivElement>(null);
  const meaningRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;

    const root = rootRef.current!;
    const kanji = kanjiRef.current!;
    const meaning = meaningRef.current!;
    const num = numRef.current!;
    const fill = fillRef.current!;
    const tagState = stateRef.current!;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    let raf = 0;
    let disposed = false;

    html.classList.add("intro-lock");
    window.scrollTo(0, 0);

    /* ---- rotating word, characters staggered in and out ---- */
    // Two frames so the hidden state is painted before the reveal transition starts.
    const reveal = () =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (disposed) return;
          kanji.classList.add("il-show");
          meaning.classList.add("il-show");
        }),
      );

    function paint([text, translation]: readonly [string, string]) {
      kanji.replaceChildren(
        ...[...text].map((char, i) => {
          const span = document.createElement("span");
          span.textContent = char;
          span.style.transitionDelay = `${i * 0.06}s`;
          return span;
        }),
      );
      meaning.textContent = translation;
      reveal();
    }

    let wordIndex = 1;
    function nextWord() {
      kanji.classList.add("il-gone");
      meaning.classList.remove("il-show");
      later(() => {
        kanji.classList.remove("il-gone", "il-show");
        paint(WORDS[wordIndex]);
        wordIndex = (wordIndex + 1) % WORDS.length;
      }, 420);
    }
    reveal(); // the first word is server-rendered hidden; slide it in
    const wordTimer = window.setInterval(nextWord, WORD_INTERVAL_MS);

    /* ---- progress driven by real load signals ---- */
    const MIN_MS = reduced ? 300 : MIN_DURATION_MS;
    const start = performance.now();
    let target = 8;
    let shown = 0;
    let finished = false;

    const stage = (to: number, label?: string) => {
      if (finished) return;
      target = Math.max(target, to);
      if (label) tagState.textContent = label;
    };

    if (document.fonts?.ready) document.fonts.ready.then(() => stage(58, "typefaces"));
    else stage(58, "typefaces");
    const assetsIn = () => stage(100, "assets");
    if (document.readyState === "complete") assetsIn();
    else window.addEventListener("load", assetsIn, { once: true });
    // failsafe: a slow or blocked asset must never hold the door shut
    later(() => stage(100, "assets"), MIN_MS + 3500);

    function frame(now: number) {
      const elapsed = now - start;
      const timeCap = (elapsed / MIN_MS) * 100; // never outruns MIN_MS
      const cap = Math.min(target, timeCap, 100);

      shown += (cap - shown) * 0.1; // eased chase, so the digits breathe
      if (cap - shown < 0.4) shown = cap;

      num.textContent = String(Math.floor(shown));
      fill.style.width = `${shown.toFixed(2)}%`;

      // done once the real signals are in AND the counter has caught up
      if (elapsed >= MIN_MS && target >= 100 && shown >= 99.4) return complete();
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    /* ---- finish: welcome word, then wipe upward ---- */
    function complete() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      clearInterval(wordTimer);
      window.removeEventListener("keydown", onKey);

      num.textContent = "100";
      fill.style.width = "100%";
      tagState.textContent = "ready";

      kanji.classList.add("il-gone");
      meaning.classList.remove("il-show");
      later(
        () => {
          kanji.classList.remove("il-gone", "il-show");
          paint(WELCOME);
        },
        reduced ? 0 : 420,
      );

      later(
        () => {
          // Every visit opens on the top of the homepage, never a remembered position.
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          root.classList.add("il-out");
          html.classList.remove("intro-lock");
          // Hand over to the page: ScrollReveal starts building the hero now.
          html.setAttribute("data-intro-done", "");
          document.dispatchEvent(new Event("site-intro:done"));
          later(() => setMounted(false), 1400); // stop it eating pointer events
        },
        reduced ? 120 : 700,
      );
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" || event.key === "Enter") complete();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      clearInterval(wordTimer);
      timers.forEach(clearTimeout);
      window.removeEventListener("load", assetsIn);
      window.removeEventListener("keydown", onKey);
      html.classList.remove("intro-lock");
    };
  }, []);

  if (!mounted) return null;

  const [firstText, firstMeaning] = WORDS[0];

  return (
    <div ref={rootRef} className="site-intro" aria-hidden="true">
      <span className="il-tag il-tl">{TAGS.tl}</span>
      <span ref={stateRef} className="il-tag il-tr">
        assets
      </span>
      <span className="il-tag il-bl">{TAGS.bl}</span>
      <span className="il-tag il-br">{TAGS.br}</span>

      <div className="il-inner">
        <div className="il-word">
          <div ref={kanjiRef} className="il-kanji" lang="ja">
            {[...firstText].map((ch, i) => (
              <span key={i} style={{ transitionDelay: `${i * 0.06}s` }}>
                {ch}
              </span>
            ))}
          </div>
          <div ref={meaningRef} className="il-meaning">
            {firstMeaning}
          </div>
        </div>
        <div className="il-counter">
          <span ref={numRef} className="il-num">
            0
          </span>
          <span className="il-pct">%</span>
        </div>
        <div className="il-barwrap">
          <div className="il-bar">
            <div ref={fillRef} className="il-fill" />
          </div>
          <div className="il-label">{LABEL}</div>
        </div>
      </div>
    </div>
  );
}
