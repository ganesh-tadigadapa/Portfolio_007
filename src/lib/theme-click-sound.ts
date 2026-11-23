/**
 * UI sounds, synthesised with Web Audio (no files), plus a site-wide sound switch that
 * is remembered per visitor. The same switch also mutes the song card.
 *
 * Each sound is a small recipe of layers: short filtered-noise bursts (clicks) and
 * sine tones, run through a gentle compressor. The theme toggle is a crisp two-part
 * switch click: a lower burst, then a brighter one 24 ms later.
 */

type Layer =
  | {
      kind: "noise";
      filter: BiquadFilterType;
      freq: number;
      q: number;
      offset?: number;
      attack: number;
      decay: number;
      peak: number;
    }
  | {
      kind: "tone";
      wave: OscillatorType;
      freq: number;
      glideTo?: number;
      offset?: number;
      attack: number;
      decay: number;
      peak: number;
    };

const RECIPES = {
  toggle: {
    gain: 0.4,
    layers: [
      { kind: "noise", filter: "bandpass", freq: 2200, q: 1.6, attack: 0.001, decay: 0.016, peak: 0.12 },
      { kind: "noise", filter: "bandpass", freq: 3800, q: 1.6, offset: 0.024, attack: 0.001, decay: 0.02, peak: 0.1 },
    ],
  },
  tick: {
    gain: 0.4,
    layers: [
      { kind: "noise", filter: "bandpass", freq: 5400, q: 1.8, attack: 0.001, decay: 0.018, peak: 0.14 },
      { kind: "tone", wave: "sine", freq: 2600, attack: 0.001, decay: 0.012, peak: 0.018 },
    ],
  },
} satisfies Record<string, { gain: number; layers: Layer[] }>;

type SoundName = keyof typeof RECIPES;

const STORAGE_KEY = "ui-sound";
const EVENT = "ui-sound-change";

let ctx: AudioContext | null = null;
let bus: GainNode | null = null;

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

function output(c: AudioContext): GainNode {
  if (bus) return bus;
  // Boost then compress, so tiny clicks are audible without ever clipping.
  const boost = c.createGain();
  boost.gain.value = 4;
  const comp = c.createDynamicsCompressor();
  comp.threshold.value = -8;
  comp.knee.value = 6;
  comp.ratio.value = 12;
  comp.attack.value = 0.002;
  comp.release.value = 0.08;
  boost.connect(comp).connect(c.destination);
  bus = boost;
  return boost;
}

function render(c: AudioContext, name: SoundName) {
  const recipe = RECIPES[name];
  const master = c.createGain();
  master.gain.value = recipe.gain;
  master.connect(output(c));
  const now = c.currentTime;

  for (const layer of recipe.layers as Layer[]) {
    const t = now + (layer.offset ?? 0);
    const env = c.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(layer.peak, t + layer.attack);
    env.gain.exponentialRampToValueAtTime(0.0001, t + layer.attack + layer.decay);
    env.connect(master);
    const length = layer.attack + layer.decay + 0.05;

    if (layer.kind === "tone") {
      const osc = c.createOscillator();
      osc.type = layer.wave;
      osc.frequency.setValueAtTime(layer.freq, t);
      if (layer.glideTo) {
        osc.frequency.exponentialRampToValueAtTime(layer.glideTo, t + layer.attack + layer.decay);
      }
      osc.connect(env);
      osc.start(t);
      osc.stop(t + length);
    } else {
      const frames = Math.max(1, Math.floor(length * c.sampleRate));
      const buffer = c.createBuffer(1, frames, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buffer;
      const filter = c.createBiquadFilter();
      filter.type = layer.filter;
      filter.frequency.value = layer.freq;
      filter.Q.value = layer.q;
      src.connect(filter).connect(env);
      src.start(t);
      src.stop(t + length);
    }
  }
  window.setTimeout(() => master.disconnect(), 400);
}

export function playSound(name: SoundName) {
  if (typeof window === "undefined" || !isSoundOn()) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "running") render(ctx, name);
    else void ctx.resume().then(() => ctx && render(ctx, name));
  } catch {
    // Audio blocked: stay silent.
  }
}

/** Theme switch click. */
export function playThemeClickSound() {
  playSound("toggle");
}

/** Small tick, e.g. confirming sounds were turned back on. */
export function playTick() {
  playSound("tick");
}
