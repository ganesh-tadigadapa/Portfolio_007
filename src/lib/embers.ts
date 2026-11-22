/**
 * Ember sparks on a canvas: glowing specks that rise like sparks off burning
 * wood, flickering, drifting and cooling as they climb.
 *
 *   const embers = startEmbers(canvas);
 *   embers.setIntensity(0..1)   // how hard the fire is burning
 *   embers.setSource(x, y)      // a point that sheds sparks (e.g. a progress bar tip), or null
 *   embers.burst(x, y, count)   // a one-off shower
 *   embers.stop()
 *
 * Coordinates are CSS pixels relative to the canvas.
 */

const SPARK_COLORS = ["#FFF1DC", "#FFD9A8", "#FBC17D", "#F6A35A", "#F0843A", "#E8622A"];

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  lift: number;
  drag: number;
  age: number;
  life: number;
  size: number;
  sprite: HTMLCanvasElement;
  wobAmp: number;
  wobFreq: number;
  phase: number;
  flick: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);
/** Roughly -1..1, weighted toward the centre. */
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

/** One pre-rendered glow per colour: far cheaper than a gradient per spark. */
function makeSprite(hex: string) {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const gr = (n >> 8) & 255;
  const b = n & 255;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255, 252, 245, 1)");
  grad.addColorStop(0.12, `rgba(${r}, ${gr}, ${b}, 1)`);
  grad.addColorStop(0.32, `rgba(${r}, ${gr}, ${b}, 0.42)`);
  grad.addColorStop(0.6, `rgba(${r}, ${Math.round(gr * 0.45)}, 0, 0.1)`);
  grad.addColorStop(1, "rgba(120, 20, 0, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export function startEmbers(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const sprites = SPARK_COLORS.map(makeSprite);
  const sparks: Spark[] = [];

  let W = 0;
  let H = 0;
  let intensity = 0.15;
  let source: { x: number; y: number } | null = null;
  let ambientAcc = 0;
  let sourceAcc = 0;
  let raf = 0;
  let last = performance.now();
  let running = true;

  const maxSparks = () => (W < 640 ? 260 : 520);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth;
    H = canvas.clientHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /** A spark rising from the fire along the bottom edge. */
  function spawnAmbient() {
    if (sparks.length >= maxSparks()) return;
    sparks.push({
      x: W / 2 + gauss() * W * 0.48,
      y: H * rand(0.9, 1.04),
      vx: rand(-12, 12),
      vy: -rand(40, 110) * (0.8 + intensity * 0.6),
      lift: rand(6, 18),
      drag: 0,
      age: 0,
      life: rand(2, 4.6),
      size: rand(0.8, 2.5),
      sprite: sprites[(Math.random() * sprites.length) | 0],
      wobAmp: rand(8, 26),
      wobFreq: rand(0.7, 2.4),
      phase: rand(0, Math.PI * 2),
      flick: rand(7, 18),
    });
  }

  /** A short, hot spark thrown off a point (bursts and the source). */
  function spawnThrown(x: number, y: number, power: number) {
    if (sparks.length >= maxSparks()) return;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.5;
    const speed = rand(60, 240) * power;
    sparks.push({
      x: x + rand(-3, 3),
      y: y + rand(-2, 2),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      lift: rand(14, 34),
      drag: rand(1.4, 2.6),
      age: 0,
      life: rand(0.6, 1.6),
      size: rand(0.7, 2.4),
      sprite: sprites[(Math.random() * 3) | 0], // hottest colours
      wobAmp: rand(4, 12),
      wobFreq: rand(1, 3),
      phase: rand(0, Math.PI * 2),
      flick: rand(10, 24),
    });
  }

  function frame(now: number) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); // clamp after tab switches
    last = now;
    ctx.clearRect(0, 0, W, H);

    // the fire burns harder as intensity rises
    ambientAcc += Math.max(14, (W / 1440) * 85) * (0.5 + intensity * 1.4) * dt;
    while (ambientAcc >= 1) {
      spawnAmbient();
      ambientAcc -= 1;
    }
    if (source) {
      sourceAcc += 34 * dt;
      while (sourceAcc >= 1) {
        spawnThrown(source.x, source.y, 0.55);
        sourceAcc -= 1;
      }
    }

    ctx.globalCompositeOperation = "lighter";
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.age += dt;
      if (p.age >= p.life || p.y < -30) {
        sparks[i] = sparks[sparks.length - 1];
        sparks.pop();
        continue;
      }
      if (p.drag) {
        const k = Math.exp(-p.drag * dt);
        p.vx *= k;
        p.vy *= k;
      }
      p.vy -= p.lift * dt; // heat keeps pushing sparks upward
      p.x += (p.vx + Math.sin(p.age * p.wobFreq + p.phase) * p.wobAmp) * dt;
      p.y += p.vy * dt;

      const t = p.age / p.life;
      const fadeIn = Math.min(1, p.age / 0.15);
      const fadeOut = Math.pow(1 - t, 1.4);
      let flicker = 0.62 + 0.38 * Math.sin(p.age * p.flick + p.phase);
      if (Math.random() < 0.025) flicker *= 0.25; // the odd sputter
      const alpha = fadeIn * fadeOut * flicker;
      if (alpha <= 0.01) continue;

      const s = p.size * 9 * (0.7 + 0.3 * (1 - t)); // sparks shrink as they cool
      ctx.globalAlpha = alpha;
      ctx.drawImage(p.sprite, p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(frame);
  }

  const onResize = () => resize();
  const onVisibility = () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else if (running) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  resize();
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);
  // pre-warm so sparks are already mid-flight on the first frame
  for (let i = 0; i < 18; i++) {
    spawnAmbient();
    const p = sparks[sparks.length - 1];
    if (p) {
      p.age = rand(0.3, p.life * 0.6);
      p.y = rand(H * 0.45, H);
    }
  }
  raf = requestAnimationFrame(frame);

  return {
    setIntensity(value: number) {
      intensity = Math.max(0, Math.min(1, value));
    },
    setSource(x: number | null, y?: number) {
      source = x === null || y === undefined ? null : { x, y };
    },
    burst(x: number, y: number, count: number, power = 1) {
      for (let i = 0; i < count; i++) spawnThrown(x, y, power);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}
