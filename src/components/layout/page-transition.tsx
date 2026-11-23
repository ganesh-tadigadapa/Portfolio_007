"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentProps, type MouseEvent } from "react";
import { flushSync } from "react-dom";

/**
 * Page changes from the header nav use the View Transitions API, with a different
 * full-screen animation per destination (styled in globals.css under html[data-vt]):
 *   /          "iris"    — a circle opens from the exact point you clicked
 *   /about     "curtain" — the new page parts open from the centre, like curtains
 *   /projects  "sheet"   — the old page sinks back while the new one rises from below
 * The header stays put above all of them. Deliberately unlike the theme toggle's
 * diagonal sweep.
 *
 * Browsers without View Transitions, and people who prefer reduced motion, get a normal
 * instant navigation.
 */

let finishNavigation: (() => void) | null = null;

const VARIANTS: Record<string, "iris" | "curtain" | "sheet"> = {
  "/": "iris",
  "/about": "curtain",
  "/projects": "sheet",
};

/** Mount once (in the layout): tells a pending transition that the new page rendered. */
export function PageTransitionListener() {
  const pathname = usePathname();
  useEffect(() => {
    if (!finishNavigation) return;
    window.scrollTo(0, 0);
    // Two frames: let the new route paint before the "after" snapshot is taken.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      finishNavigation?.();
      finishNavigation = null;
    }));
  }, [pathname]);
  return null;
}

export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    // Let the browser handle new tabs, modified clicks and same-page clicks.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (href === pathname) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!document.startViewTransition || reduced) return;

    e.preventDefault();
    const html = document.documentElement;
    html.dataset.vt = VARIANTS[href] ?? "sheet";
    // Where the click happened (the iris opens from here).
    const x = e.clientX || window.innerWidth / 2;
    const y = e.clientY || 0;
    html.style.setProperty("--vt-x", `${x}px`);
    html.style.setProperty("--vt-y", `${y}px`);

    const transition = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          finishNavigation = resolve;
          flushSync(() => router.push(href, { scroll: false }));
          // Safety net: never hold the screen frozen if the route is slow.
          window.setTimeout(() => {
            if (finishNavigation === resolve) {
              finishNavigation = null;
              resolve();
            }
          }, 2500);
        }),
    );
    transition.finished.finally(() => {
      delete html.dataset.vt;
    });
  };

  return <Link href={href} onClick={handle} {...props} />;
}
