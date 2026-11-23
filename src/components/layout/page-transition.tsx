"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentProps, type MouseEvent } from "react";

/**
 * Header-nav page transition: quick and quiet, about half a second in total.
 *   1. The current page fades and lifts slightly (~180 ms).
 *   2. The route changes; a thin progress line glides across the top meanwhile.
 *   3. The new page fades up into place (~300 ms).
 * Going back in the nav order reverses the direction. Transform/opacity only
 * (styled in globals.css: html.pt-leaving / pt-enter-from / pt-entering).
 * Reduced motion: a plain instant navigation.
 */

const ORDER: Record<string, number> = { "/": 1, "/about": 2, "/projects": 3 };
const EVENT = "page-transition:go";
const LEAVE_MS = 180;

export function PageTransitionListener() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const waitingFor = useRef<string | null>(null);
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  useEffect(() => {
    const html = document.documentElement;
    const timers: number[] = [];
    const onGo = (e: Event) => {
      const { href } = (e as CustomEvent<{ href: string }>).detail;
      if (waitingFor.current) return;
      waitingFor.current = href;
      const back = (ORDER[href] ?? 9) < (ORDER[pathRef.current] ?? 0);
      html.classList.toggle("pt-back", back);
      html.classList.add("pt-leaving");
      setLoading(true);
      router.prefetch(href);
      timers.push(window.setTimeout(() => router.push(href, { scroll: false }), LEAVE_MS));
      // Safety net: never leave the page faded out.
      timers.push(
        window.setTimeout(() => {
          if (waitingFor.current !== href) return;
          waitingFor.current = null;
          html.classList.remove("pt-leaving", "pt-enter-from", "pt-back");
          setLoading(false);
        }, 3000),
      );
    };
    document.addEventListener(EVENT, onGo);
    return () => {
      document.removeEventListener(EVENT, onGo);
      timers.forEach(clearTimeout);
    };
  }, [router]);

  // New route rendered: start it just below its place, then let it glide up.
  useEffect(() => {
    if (!waitingFor.current || pathname !== waitingFor.current) return;
    waitingFor.current = null;
    const html = document.documentElement;
    window.scrollTo(0, 0);
    html.classList.remove("pt-leaving");
    html.classList.add("pt-enter-from");
    requestAnimationFrame(() => {
      html.classList.add("pt-entering");
      html.classList.remove("pt-enter-from");
      setLoading(false);
      window.setTimeout(() => html.classList.remove("pt-entering", "pt-back"), 400);
    });
  }, [pathname]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[2px] overflow-hidden">
      <div className={loading ? "pt-progress pt-progress-run" : "pt-progress pt-progress-done"} />
    </div>
  );
}

export function TransitionLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (href === pathname) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    e.preventDefault();
    document.dispatchEvent(new CustomEvent(EVENT, { detail: { href } }));
  };

  return <Link href={href} onClick={handle} {...props} />;
}
