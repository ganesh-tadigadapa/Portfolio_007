"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentProps, type MouseEvent } from "react";
import { flushSync } from "react-dom";

/**
 * Header-nav page transitions (View Transitions API), one per destination, each about
 * 0.6 s and styled in globals.css under html[data-vt]:
 *   /          "circle"  the new page opens as a circle from the exact click point
 *   /about     "door"    the current page swings open like a door, hinged on the left
 *   /projects  "box"     the new page grows out of a rounded box in the centre
 * (The diagonal "sweep" belongs to the theme toggle.) The header stays still.
 * Only transform / opacity / clip-path are animated — no filters — so it stays smooth.
 * Browsers without View Transitions, and reduced motion, get an instant navigation.
 */

type Variant = "circle" | "door" | "box";
const VARIANTS: Record<string, Variant> = { "/": "circle", "/about": "door", "/projects": "box" };

let finishNavigation: (() => void) | null = null;

/** Mount once (layout): tells a pending transition that the new route has rendered. */
export function PageTransitionListener() {
  const pathname = usePathname();
  useEffect(() => {
    if (!finishNavigation) return;
    window.scrollTo(0, 0);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        finishNavigation?.();
        finishNavigation = null;
      }),
    );
  }, [pathname]);
  return null;
}

export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();
  const pathname = usePathname();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (href === pathname) return;
    if (!document.startViewTransition) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault();
    const html = document.documentElement;
    html.dataset.vt = VARIANTS[href] ?? "box";
    html.style.setProperty("--vt-x", `${e.clientX || window.innerWidth / 2}px`);
    html.style.setProperty("--vt-y", `${e.clientY || 0}px`);
    router.prefetch(href);

    const transition = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          finishNavigation = resolve;
          flushSync(() => router.push(href, { scroll: false }));
          // Never hold the screen frozen if a route is slow.
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
