/** A real homepage element's box on screen, measured when the intro starts. */
export type Box = { x: number; y: number; w: number; h: number; r: number; circle?: boolean; text?: boolean };

/** Measure the main homepage pieces (used by the particle intro to know where to gather). */
export function measureHome(): Box[] {
  const vh = window.innerHeight;
  const pick: [string, Partial<Box>][] = [
    ['main [data-reveal="unveil"]', {}],
    ['main [data-reveal="scale"]', { circle: true }],
    ["main h1", { text: true }],
    ["main h1 + div", { text: true }],
    ["main h1 ~ div[data-reveal] > *", {}],
    ["main p.max-w-xl", { text: true }],
    ['header a[href="/"]', {}],
    ["header nav a", { text: true }],
  ];
  const out: Box[] = [];
  for (const [sel, extra] of pick) {
    document.querySelectorAll(sel).forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4 || r.top > vh || r.bottom < 0) return;
      const radius = extra.circle
        ? r.width / 2
        : Math.min(parseFloat(getComputedStyle(el).borderRadius) || 4, r.height / 2);
      out.push({ x: r.left, y: r.top, w: r.width, h: r.height, r: radius, ...extra });
    });
  }
  return out;
}

export const isDark = () => document.documentElement.classList.contains("dark");
