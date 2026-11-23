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
 *  - mouse: resting on a card opens the popup; moving off the popup closes it
 *  - click / tap / Enter: opens it too (links inside the card still work)
 *  - Escape, the ✕ or a click outside close it
 *
 * The popup fades and zooms in at a constant pace (a tween, not a spring), so it
 * feels the same every time. The live recording plays inside it.
 */

const OPEN_DELAY = 350; // ms resting on a card before it opens
const CLOSE_DELAY = 200; // ms off the popup before it closes
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type Ctx = {
  hoverStart: (p: Project) => void;
  hoverEnd: () => void;
  openNow: (p: Project) => void;
};
const PopupContext = createContext<Ctx | null>(null);

export function ProjectPopupRoot({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<Project | null>(null);
  const [mounted, setMounted] = useState(false);
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const closedAt = useRef(0);

  useEffect(() => setMounted(true), []);

  const close = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    window.clearTimeout(openTimer.current);
    closedAt.current = Date.now();
    setOpen(null);
  }, []);

  const ctx = useMemo<Ctx>(
    () => ({
      hoverStart: (p) => {
        window.clearTimeout(openTimer.current);
        // Just closed? Let the close finish first so it never flickers.
        const settle = Math.max(0, 260 - (Date.now() - closedAt.current));
        openTimer.current = window.setTimeout(() => setOpen(p), OPEN_DELAY + settle);
      },
      hoverEnd: () => window.clearTimeout(openTimer.current),
      openNow: (p) => {
        window.clearTimeout(openTimer.current);
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
      onPointerEnter={(e) => e.pointerType === "mouse" && ctx.hoverStart(project)}
      onPointerLeave={ctx.hoverEnd}
      onClick={(e) => {
        if (!clickToOpen) return;
        if ((e.target as HTMLElement).closest("a, button:not([data-popup-open])")) return;
        ctx.openNow(project);
      }}
    >
      {children}
    </div>
  );
}

function PopupLayer({
  project,
  onClose,
  onEnter,
  onLeave,
}: {
  project: Project;
  onClose: () => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  // While fading out, let the pointer straight through to the cards underneath.
  const isPresent = useIsPresent();
  const passThrough = !isPresent && "pointer-events-none";

  return (
    <>
      <motion.div
        data-lenis-prevent
        className={cn("fixed inset-0 z-[60] bg-black/70", passThrough)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }}
        exit={{ opacity: 0, transition: { duration: 0.22, ease: "easeIn" } }}
        onClick={onClose}
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
          onPointerLeave={(e) => e.pointerType === "mouse" && onLeave()}
          className={cn(
            isPresent ? "pointer-events-auto" : "pointer-events-none",
            "relative flex max-h-[calc(100dvh-24px)] w-full max-w-[720px] flex-col overflow-hidden rounded-[26px] border border-foreground/10 bg-card shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] sm:max-h-[88vh]",
          )}
          style={{ willChange: "transform, opacity" }}
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.42, ease: EASE_OUT } }}
          exit={{ opacity: 0, scale: 0.97, y: 10, transition: { duration: 0.2, ease: "easeIn" } }}
        >
          <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="relative aspect-[16/9] w-full shrink-0 bg-muted">
              {project.cover ? (
                <Image
                  src={project.cover}
                  alt={`${project.title} screenshot`}
                  fill
                  sizes="720px"
                  className="object-cover object-top"
                />
              ) : (
                <div className={cn("absolute inset-0 bg-linear-to-br", project.gradient)} />
              )}
              {project.preview && (
                // The live recording, playing as soon as it has loaded.
                // eslint-disable-next-line @next/next/no-img-element
                <motion.img
                  src={project.preview}
                  alt=""
                  aria-hidden
                  decoding="async"
                  className="absolute inset-0 size-full object-cover object-top"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 0.25, duration: 0.35 } }}
                />
              )}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  {project.tech[0]} &middot; {project.date}
                </p>
                <h3 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">{project.title}</h3>
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
              className="p-5 sm:p-7"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.35, ease: EASE_OUT } }}
            >
              <p className="text-[15px] leading-relaxed text-foreground/85 sm:text-base">{project.description}</p>

              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">Built with</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.tech.map((tech) => {
                  const icon = getTechIcon(tech);
                  return (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/50 py-1.5 pl-1.5 pr-2.5 text-[12.5px]"
                    >
                      {icon ? (
                        <span className={`size-6 rounded-md ${techTileClass}`}>
                          <TechIcon icon={icon} size={13} className="size-[13px]" />
                        </span>
                      ) : null}
                      {tech}
                    </span>
                  );
                })}
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
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
