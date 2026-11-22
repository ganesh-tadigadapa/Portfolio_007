import Image from "next/image";
import type { Project } from "@/config/projects";
import { cn } from "@/lib/utils";

/**
 * A project's cover: its screenshot when there is one, otherwise a designed
 * placeholder (project gradient, fine grid, name and stack) so every card
 * looks intentional.
 */
export function ProjectCover({
  project,
  sizes,
  priority = false,
  revealMedia = false,
  className,
  imageClassName,
}: {
  project: Pick<Project, "title" | "cover" | "gradient" | "tech">;
  sizes: string;
  priority?: boolean;
  /** Let ScrollReveal settle the image from a slight zoom when it appears */
  revealMedia?: boolean;
  className?: string;
  imageClassName?: string;
}) {
  if (project.cover) {
    return (
      <div className={cn("relative overflow-hidden bg-muted", className)}>
        <Image
          src={project.cover}
          alt={`${project.title} screenshot`}
          fill
          sizes={sizes}
          priority={priority}
          data-reveal-media={revealMedia || undefined}
          className={cn("object-cover object-top", imageClassName)}
        />
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${project.title} cover`}
      className={cn(
        "relative flex flex-col justify-end overflow-hidden bg-linear-to-br p-5 sm:p-6",
        project.gradient,
        className,
      )}
    >
      {/* fine grid + soft light, echoing the site background */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [background-image:linear-gradient(color-mix(in_srgb,var(--foreground)_9%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--foreground)_9%,transparent)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_70%_20%,black,transparent_75%)]"
      />
      <div
        aria-hidden
        className="absolute -right-16 -top-16 size-56 rounded-full bg-white/20 blur-3xl dark:bg-white/10"
      />
      <div data-reveal-media={revealMedia || undefined} className="relative origin-bottom-left">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/55">
          Repository
        </p>
        <p className="mt-1.5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {project.title}
        </p>
        <p className="mt-2 font-mono text-xs text-foreground/60">{project.tech.join("  ·  ")}</p>
      </div>
    </div>
  );
}
