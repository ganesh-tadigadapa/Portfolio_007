"use client";

import { useEffect, useRef, useState } from "react";
import { startEmbers } from "@/lib/embers";

/**
 * Full-screen intro shown on the first page load of a browser tab.
 *
 * A Japanese word rotates above a large 0–100% counter. The counter follows
 * real load signals (fonts, then the window load event), never Math.random.
 * A minimum duration means the sequence is always seen, and a failsafe means
 * a slow asset can never hold it open. At 100% it says "Welcome" and wipes
 * upward to reveal the site. Enter / Escape skips it.
 *
 * Ported from ganesh-intro-demo/intros.js (the Portfolio_007 intro loader).
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

const SEEN_KEY = "site-intro-seen";

/**
 * Runs before first paint (from <head>):
 * - marks <html> with reveal-pending so scroll-reveal targets start hidden
 *   (ScrollReveal takes over and plays them once the intro wipes away);
 * - if this tab has already seen the intro, marks <html> so CSS hides the
 *   overlay without a flash.
 */
export const siteIntroBootScript = `(function(){var d=document.documentElement;if(!matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("reveal-pending");try{if(sessionStorage.getItem("${SEEN_KEY}"))d.setAttribute("data-intro-seen","")}catch(e){}})()`;

export function SiteIntro() {
  const [mounted, setMounted] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);
  const kanjiRef = useRef<HTMLDivElement>(null);
  const meaningRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.hasAttribute("data-intro-seen")) {
      setMounted(false);
      return;
    }

    const root = rootRef.current!;
    const kanji = kanjiRef.current!;
    const meaning = meaningRef.current!;
    const num = numRef.current!;
    const fill = fillRef.current!;
    const tagState = stateRef.current!;
    const glow = glowRef.current!;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    let raf = 0;
    let disposed = false;

    html.classList.add("intro-lock");

    /* ---- the fire: sparks rise from the bottom and fly off the bar's tip ---- */
    const embers = reduced ? null : startEmbers(canvasRef.current!);
    const fireAt = (progress: number) => {
      embers?.setIntensity(progress);
      glow.style.opacity = (0.3 + progress * 0.7).toFixed(3);
    };
    fireAt(0);

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

    function paint([text, mean]: readonly [string, string]) {
      kanji.replaceChildren(
        ...[...text].map((ch, i) => {
          const s = document.createElement("span");
          s.textContent = ch;
          s.style.transitionDelay = `${i * 0.06}s`;
          return s;
        }),
      );
      meaning.textContent = mean;
      reveal();
    }

    let wi = 1;
    function nextWord() {
      kanji.classList.add("il-gone");
      meaning.classList.remove("il-show");
      later(() => {
        kanji.classList.remove("il-gone", "il-show");
        paint(WORDS[wi]);
        wi = (wi + 1) % WORDS.length;
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
      fireAt(shown / 100);
      if (embers && shown > 1) {
        const tip = fill.getBoundingClientRect();
        embers.setSource(tip.right, tip.top + tip.height / 2);
      }

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
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}

      num.textContent = "100";
      fill.style.width = "100%";
      tagState.textContent = "ready";

      // the fire flares: a shower off the full bar and the number
      fireAt(1);
      if (embers) {
        embers.setSource(null);
        const bar = fill.getBoundingClientRect();
        for (let i = 0; i <= 8; i++) embers.burst(bar.left + (bar.width * i) / 8, bar.top, 14, 0.9);
        const n = num.getBoundingClientRect();
        embers.burst(n.left + n.width / 2, n.top + n.height * 0.6, 70, 1.3);
      }

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

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") complete();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      disposed = true;
      embers?.stop();
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
      <div ref={glowRef} className="il-glow" />
      <canvas ref={canvasRef} className="il-embers" />
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
