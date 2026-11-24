"use client";

import { ArrowRight, ArrowUpRight, GithubLogo, Globe, X } from "@phosphor-icons/react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { TechIcon, techTileClass } from "@/components/shared/tech-icon";
import type { Project } from "@/config/projects";
import { getTechIcon } from "@/lib/tech-icons";
import { cn } from "@/lib/utils";

/**
 * A project popup shared by any set of cards. Wrap the cards in <ProjectPopupRoot> and
 * each card in <PopupTrigger project={...}>:
 *  - mouse: moving onto a card and resting there opens the popup (cards that merely
 *    scroll under a still cursor don't count); moving off the popup closes it
 *  - click / tap / Enter: opens it too (links inside the card still work)
 *  - Escape, the ✕ or a click outside close it
 *
 * The popup fades and zooms in at a constant pace (a tween, not a spring), so it
 * feels the same every time. The live recording plays inside it.
 */

const OPEN_DELAY = 200; // ms resting on a card before it opens
const CLOSE_DELAY = 200; // ms off the popup before it closes
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Where the hovered card sits on screen, so the popup can grow out of it. */
type Origin = { x: number; y: number; scale: number };
type Ctx = {
  hoverStart: (p: Project, el: HTMLElement) => void;
  hoverEnd: () => void;
  openNow: (p: Project, el: HTMLElement) => void;
};

function originOf(el: HTMLElement): Origin {
  const r = el.getBoundingClientRect();
  return {
    x: r.left + r.width / 2 - window.innerWidth / 2,
    y: r.top + r.height / 2 - window.innerHeight / 2,
    scale: Math.min(0.9, Math.max(0.35, r.width / Math.min(880, window.innerWidth - 24))),
  };
}
const PopupContext = createContext<Ctx | null>(null);

export function ProjectPopupRoot({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Project | null>(null);
  const origin = useRef<Origin>({ x: 0, y: 0, scale: 0.9 });
  const [mounted, setMounted] = useState(false);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const closedAt = useRef(0);
  const scrolledAt = useRef(0);
  const pending = useRef<string | null>(null);

  // Scrolling moves cards under a still cursor; that must not count as hovering.
  useEffect(() => {
    const onScroll = () => {
      scrolledAt.current = Date.now();
      window.clearTimeout(openTimer.current);
      pending.current = null;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onScroll);
    };
  }, []);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    closedAt.current = Date.now();
    setOpen(null);
  }, []);

  const ctx = useMemo<Ctx>(
    () => ({
      hoverStart: (p, el) => {
        // Ignore while (or just after) the page is scrolling, and don't restart a
        // timer that is already counting down for this card.
        if (Date.now() - scrolledAt.current < 250) return;
        if (pending.current === p.slug) return;
        window.clearTimeout(openTimer.current);
        pending.current = p.slug;
        // Just closed? Let the close finish first so it never flickers.
        const settle = Math.max(0, 180 - (Date.now() - closedAt.current));
        openTimer.current = window.setTimeout(() => {
          pending.current = null;
          origin.current = originOf(el);
          setOpen(p);
        }, OPEN_DELAY + settle);
      },
      hoverEnd: () => {
        window.clearTimeout(openTimer.current);
        pending.current = null;
      },
      openNow: (p, el) => {
        window.clearTimeout(openTimer.current);
        origin.current = originOf(el);
        setOpen(p);
      },
    }),
    [],
  );

  // While open: freeze page scroll and listen for Escape.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.classList.add("modal-lock");
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      html.classList.remove("modal-lock");
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );

  return (
    <PopupContext.Provider value={ctx}>
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <PopupLayer
                key={open.slug}
                project={open}
                origin={origin.current}
                onClose={close}
                onEnter={() => window.clearTimeout(closeTimer.current)}
                onLeave={() => {
                  window.clearTimeout(closeTimer.current);
                  closeTimer.current = window.setTimeout(close, CLOSE_DELAY);
                }}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </PopupContext.Provider>
  );
}

/** Makes its child card open the popup on hover (mouse), click/tap, or Enter. */
export function PopupTrigger({
  project,
  children,
  className,
  clickToOpen = true,
}: {
  project: Project;
  children: ReactNode;
  className?: string;
  /** Open on a plain click on the card (links and buttons inside still work normally). */
  clickToOpen?: boolean;
}) {
  const ctx = useContext(PopupContext);
  if (!ctx) return <>{children}</>;
  return (
    <div
      className={className}
      // Real mouse movement over the card starts the timer (a card scrolling under a
      // still cursor fires enter events but no movement).
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || (e.movementX === 0 && e.movementY === 0)) return;
        ctx.hoverStart(project, e.currentTarget);
      }}
      onPointerLeave={ctx.hoverEnd}
      onClick={(e) => {
        if (!clickToOpen) return;
        if ((e.target as HTMLElement).closest("a, button:not([data-popup-open])")) return;
        ctx.openNow(project, e.currentTarget);
      }}
    >
      {children}
    </div>
  );
}

function PopupLayer({
  project,
  origin,
  onClose,
  onEnter,
  onLeave,
}: {
  project: Project;
  origin: Origin;
  onClose: () => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  // While fading out, let the pointer straight through to the cards underneath.
  const isPresent = useIsPresent();
  const passThrough = !isPresent && "pointer-events-none";
  // While it flies out of the card, it slides away from under a still cursor; that must
  // not count as the mouse leaving. Only real movement after it has settled does.
  const settled = useRef(false);
  const leaveIfMoved = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !settled.current) return;
    if (e.movementX === 0 && e.movementY === 0) return;
    onLeave();
  };

  return (
    <>
      <motion.div
        data-lenis-prevent
        className={cn("fixed inset-0 z-[60] bg-black/70", passThrough)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.22, ease: "easeOut" } }}
        exit={{ opacity: 0, transition: { duration: 0.16, ease: "easeIn" } }}
        onClick={onClose}
        onPointerMove={leaveIfMoved}
      />
      <div
        data-lenis-prevent
        className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
      >
        <motion.article
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
          onPointerEnter={(e) => e.pointerType === "mouse" && onEnter()}
          onPointerLeave={(e) => e.pointerType === "mouse" && settled.current && onLeave()}
          onAnimationComplete={() => {
            settled.current = true;
          }}
          className={cn(
            isPresent ? "pointer-events-auto" : "pointer-events-none",
            "relative flex w-full max-w-[880px] flex-col overflow-hidden overscroll-none rounded-[26px] border border-foreground/10 bg-card shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)]",
          )}
          style={{ willChange: "transform, opacity" }}
          initial={{ opacity: 0, x: origin.x, y: origin.y, scale: origin.scale }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            transition: { duration: 0.42, ease: EASE_OUT, opacity: { duration: 0.2 } },
          }}
          exit={{
            opacity: 0,
            x: origin.x,
            y: origin.y,
            scale: origin.scale,
            transition: { duration: 0.28, ease: [0.4, 0, 0.6, 1], opacity: { duration: 0.22, delay: 0.06 } },
          }}
        >
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="relative h-[min(50vh,460px)] w-full shrink-0 bg-muted">
              {project.cover ? (
                <Image
                  src={project.cover}
                  alt={`${project.title} screenshot`}
                  fill
                  sizes="880px"
                  className="object-cover object-top"
                />
              ) : (
                <div className={cn("absolute inset-0 bg-linear-to-br", project.gradient)} />
              )}
              {project.preview && (
                // The live recording, playing as soon as it has loaded.
                <motion.img
                  src={project.preview}
                  alt=""
                  aria-hidden
                  decoding="async"
                  className="absolute inset-0 size-full object-cover object-top"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.3 } }}
                />
              )}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  {project.tech[0]} &middot; {project.date}
                </p>
                <h3 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-[44px] sm:leading-none">{project.title}</h3>
              </div>
              {project.preview && (
                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                  </span>
                  Live demo
                </span>
              )}
            </div>

            <motion.div
              className="px-5 py-4 sm:px-8 sm:py-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.35, ease: EASE_OUT } }}
            >
              <p className="line-clamp-3 text-[14.5px] leading-relaxed text-foreground/85">{project.description}</p>

              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">Built with</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {project.tech.map((tech) => {
                  const icon = getTechIcon(tech);
                  return (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/50 py-1 pl-1 pr-2 text-[12px]"
                    >
                      {icon ? (
                        <span className={`size-5 rounded-md ${techTileClass}`}>
                          <TechIcon icon={icon} size={12} className="size-3" />
                        </span>
                      ) : null}
                      {tech}
                    </span>
                  );
                })}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    <Globe className="size-4" weight="bold" /> Live site <ArrowUpRight className="size-3.5" />
                  </a>
                )}
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <GithubLogo className="size-4" weight="bold" /> Source{" "}
                  <ArrowUpRight className="size-3.5 text-secondary" />
                </a>
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Full details <ArrowRight className="size-3.5 text-secondary" />
                </Link>
              </div>
            </motion.div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65"
          >
            <X className="size-4" weight="bold" />
          </button>
        </motion.article>
      </div>
    </>
  );
}
