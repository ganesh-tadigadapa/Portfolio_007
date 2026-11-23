"use client";

import {
  ArrowRight,
  ArrowUpRight,
  GithubLogo,
  Globe,
  X,
} from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useIsPresent,
  type Transition,
} from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { TechIcon, techTileClass } from "@/components/shared/tech-icon";
import type { Project } from "@/config/projects";
import { getTechIcon } from "@/lib/tech-icons";
import { cn } from "@/lib/utils";

/**
 * Projects as App Store–style cards. Each card is a tall cover with the title over it;
 * resting the mouse on it (or clicking / tapping) opens it into a full article: the card, cover and title morph into place
 * (shared layoutId), the page dims and blurs behind it, and the details fade in.
 * Moving the mouse off it, the ✕, Escape or a click outside closes it again.
 *
 * The previous grid (projects-grid.tsx) is kept as a fallback.
 */

const spring: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 40,
  mass: 0.8,
};

export function ProjectsShowcase({ projects }: { projects: Project[] }) {
  const [open, setOpen] = useState<Project | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Hover to open (mouse only): resting on a card for a moment opens it; moving off the
  // open article closes it. A short cooldown after closing stops the card now under the
  // pointer from popping straight open. Click / tap / keyboard still work everywhere.
  const openTimer = useRef<number | undefined>(undefined);
  const closeTimer = useRef<number | undefined>(undefined);
  const cooldownUntil = useRef(0);

  const close = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    cooldownUntil.current = Date.now() + 450;
    setOpen(null);
  }, []);
  const hoverOpen = useCallback((p: Project) => {
    window.clearTimeout(openTimer.current);
    const wait = Math.max(0, cooldownUntil.current - Date.now());
    openTimer.current = window.setTimeout(() => setOpen(p), wait + 380);
  }, []);
  const cancelHoverOpen = useCallback(
    () => window.clearTimeout(openTimer.current),
    [],
  );
  const leaveArticle = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(close, 250);
  }, [close]);
  const enterArticle = useCallback(
    () => window.clearTimeout(closeTimer.current),
    [],
  );
  useEffect(
    () => () => {
      window.clearTimeout(openTimer.current);
      window.clearTimeout(closeTimer.current);
    },
    [],
  );

  // While an article is open: lock page scroll (SmoothScroll pauses too) and listen for Escape.
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

  return (
    <>
      <ul className="grid gap-5 sm:grid-cols-2">
        {projects.map((p) => (
          <li key={p.slug} className="relative h-[400px] sm:h-[420px]">
            {open?.slug === p.slug ? null : (
              <CollapsedCard
                project={p}
                onOpen={() => {
                  cancelHoverOpen();
                  setOpen(p);
                }}
                onHoverStart={() => hoverOpen(p)}
                onHoverEnd={cancelHoverOpen}
              />
            )}
          </li>
        ))}
      </ul>

      {/* Rendered at the page root: an ancestor with a transform (scroll-reveal) would
          otherwise trap these fixed layers inside the section. */}
      {mounted &&
        createPortal(
          <>
            <AnimatePresence>
              {open && <Backdrop key="backdrop" onClose={close} />}
            </AnimatePresence>

            <AnimatePresence>
              {open && (
                <ExpandedCard
                  key={open.slug}
                  project={open}
                  onClose={close}
                  onPointerLeave={leaveArticle}
                  onPointerEnter={enterArticle}
                />
              )}
            </AnimatePresence>
          </>,
          document.body,
        )}
    </>
  );
}

/** Dims the page. While fading out it lets the pointer through to the cards. */
function Backdrop({ onClose }: { onClose: () => void }) {
  const isPresent = useIsPresent();
  return (
    <motion.div
      data-lenis-prevent
      className={cn(
        "fixed inset-0 z-[60] bg-black/70",
        !isPresent && "pointer-events-none",
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={onClose}
    />
  );
}

function CardEyebrow({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[10px] uppercase tracking-[0.2em]",
        className,
      )}
    >
      {project.tech[0]} &middot; {project.date}
    </p>
  );
}

function CollapsedCard({
  project,
  onOpen,
  onHoverStart,
  onHoverEnd,
}: {
  project: Project;
  onOpen: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  return (
    <motion.button
      type="button"
      layoutId={`card-${project.slug}`}
      transition={spring}
      onClick={onOpen}
      onPointerEnter={(e) => e.pointerType === "mouse" && onHoverStart()}
      onPointerLeave={onHoverEnd}
      aria-label={`Open ${project.title}`}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.975 }}
      className="group absolute inset-0 block overflow-hidden rounded-[22px] border border-foreground/10 bg-card text-left shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      style={{ borderRadius: 22 }}
    >
      <motion.div
        layoutId={`cover-${project.slug}`}
        transition={spring}
        className="absolute inset-0"
      >
        {project.cover ? (
          <Image
            src={project.cover}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 360px"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className={cn("absolute inset-0 bg-linear-to-br", project.gradient)}
          />
        )}
      </motion.div>

      {/* Legibility: a dark fade under the text. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-45% to-transparent to-75%"
      />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <motion.div layoutId={`title-${project.slug}`} transition={spring}>
          <CardEyebrow project={project} className="text-white/60" />
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
            {project.title}
          </h3>
        </motion.div>
        <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug text-white/70">
          {project.description}
        </p>
        <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-white/80 transition-colors group-hover:text-white">
          Open{" "}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </motion.button>
  );
}

function ExpandedCard({
  project,
  onClose,
  onPointerEnter,
  onPointerLeave,
}: {
  project: Project;
  onClose: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
}) {
  // While it shrinks back into its card, let the pointer pass through to the card.
  const isPresent = useIsPresent();
  return (
    <div
      data-lenis-prevent
      className="pointer-events-none fixed inset-0 z-[70] flex items-start justify-center overflow-hidden p-3 sm:p-6 sm:pt-[6vh]"
    >
      <motion.article
        layoutId={`card-${project.slug}`}
        transition={spring}
        role="dialog"
        aria-modal="true"
        aria-label={project.title}
        onPointerEnter={(e) => e.pointerType === "mouse" && onPointerEnter()}
        onPointerLeave={(e) => e.pointerType === "mouse" && onPointerLeave()}
        className={cn(
          isPresent ? "pointer-events-auto" : "pointer-events-none",
          "relative flex will-change-transform max-h-[calc(100dvh-24px)] w-full max-w-[720px] flex-col overflow-hidden border border-foreground/10 bg-card shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] sm:max-h-[88vh]",
        )}
        style={{ borderRadius: 26 }}
      >
        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {/* Cover + title, morphing from the card. */}
          <div className="relative h-[260px] shrink-0 sm:h-[340px]">
            <motion.div
              layoutId={`cover-${project.slug}`}
              transition={spring}
              className="absolute inset-0"
            >
              {project.cover ? (
                <Image
                  src={project.cover}
                  alt={`${project.title} screenshot`}
                  fill
                  sizes="720px"
                  className="object-cover object-top"
                />
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 bg-linear-to-br",
                    project.gradient,
                  )}
                />
              )}
              {project.preview && (
                // The live recording plays straight away in the open article.
                // eslint-disable-next-line @next/next/no-img-element
                <motion.img
                  src={project.preview}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 size-full object-cover object-top"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                />
              )}
            </motion.div>
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
              <motion.div
                layoutId={`title-${project.slug}`}
                transition={spring}
              >
                <CardEyebrow project={project} className="text-white/60" />
                <h3 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {project.title}
                </h3>
              </motion.div>
            </div>
          </div>

          {/* Details fade in once the card has opened. */}
          <motion.div
            className="p-5 sm:p-7"
            initial={{ opacity: 0, y: 14 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                delay: 0.18,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
          >
            <p className="text-[15px] leading-relaxed text-foreground/85 sm:text-base">
              {project.description}
            </p>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-secondary">
              Built with
            </p>
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
                        <TechIcon
                          icon={icon}
                          size={13}
                          className="size-[13px]"
                        />
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
                  <Globe className="size-4" weight="bold" /> Live site{" "}
                  <ArrowUpRight className="size-3.5" />
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

        <motion.button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 inline-flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-black/65"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1, transition: { delay: 0.2 } }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
        >
          <X className="size-4" weight="bold" />
        </motion.button>
      </motion.article>
    </div>
  );
}
