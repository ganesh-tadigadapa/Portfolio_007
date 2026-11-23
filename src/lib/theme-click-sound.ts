/**
 * UI sounds, synthesised with Web Audio (no files to load), plus a site-wide on/off
 * switch that is remembered per visitor.
 */

let audioContext: AudioContext | null = null;

const STORAGE_KEY = "ui-sound";
const EVENT = "ui-sound-change";

export function isSoundOn(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Storage blocked: the choice just won't be remembered.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function onSoundChange(fn: () => void) {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

function context(): AudioContext {
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

/**
 * The theme switch: a soft glassy shimmer that rises and fades over about the same
 * time as the screen sweep. A few bell-like sine partials, slightly detuned, each
 * entering a moment after the last, so it feels like it spreads.
 */
export function playThemeClickSound() {
  if (typeof window === "undefined" || !isSoundOn()) return;
  try {
    const ctx = context();
    const now = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.value = 0.16;
    master.connect(ctx.destination);

    // Partials of a struck glass, staggered to "spread" with the sweep.
    const partials: [number, number, number][] = [
      // [frequency Hz, start delay s, relative level]
      [1318.5, 0.0, 0.5],
      [1975.5, 0.05, 0.35],
      [2637.0, 0.11, 0.22],
      [3520.0, 0.18, 0.12],
    ];
    for (const [freq, delay, level] of partials) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + delay;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.detune.setValueAtTime((Math.random() - 0.5) * 8, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(level, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
      osc.connect(gain);
      gain.connect(master);
      osc.start(t);
      osc.stop(t + 0.8);
    }
  } catch {
    // Audio blocked: stay silent.
  }
}

/** A tiny tick, used to confirm the sound switch itself turning on. */
export function playTick() {
  if (typeof window === "undefined" || !isSoundOn()) return;
  try {
    const ctx = context();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.04);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    // ignore
  }
}
