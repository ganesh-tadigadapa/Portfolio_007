"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ComponentProps, type MouseEvent } from "react";
import { flushSync } from "react-dom";

/**
 * Page changes from the header nav use the View Transitions API with a "card stack"
 * animation (styled in globals.css under html[data-vt="nav"]): the current page sinks
 * back — shrinks, dims, rounds its corners — while the new page rises from the bottom
 * like a sheet. The header stays put above both. Deliberately unlike the theme toggle's
 * diagonal sweep.
 *
 * Browsers without View Transitions, and people who prefer reduced motion, get a normal
 * instant navigation.
 */

let finishNavigation: (() => void) | null = null;

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
    html.dataset.vt = "nav";

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
