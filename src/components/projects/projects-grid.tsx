import Link from "next/link";
import { ArrowRight, GithubLogo, Globe } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { SpotlightCard } from "@/components/projects/spotlight-card";
import { TransitionLink } from "@/components/layout/page-transition";
import { ProjectCover } from "@/components/projects/project-cover";
import { ProjectsShowcase } from "@/components/projects/projects-showcase";
import { PopupTrigger, ProjectPopupRoot } from "@/components/projects/project-popup";
import { TechIcon, techTileClass } from "@/components/shared/tech-icon";
import { projects, type Project } from "@/config/projects";
import { getTechIcon } from "@/lib/tech-icons";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const detailHref = `/projects/${project.slug}`;
  const icons = project.tech.map((t) => [t, getTechIcon(t)] as const).filter(([, i]) => i);
  const shown = icons.slice(0, 5);
  const more = project.tech.length - shown.length;

  return (
    <SpotlightCard className="animate-in-up-on-view group flex w-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-border bg-card/60 transition-transform duration-300 ease-out hover:-translate-y-1">
      {/* Cover, with a tiny window bar and live tag floating on it */}
      <div className="relative overflow-hidden border-b border-border/70">
        <ProjectCover
          project={project}
          sizes="(max-width: 640px) 100vw, 360px"
          revealMedia
          className="aspect-[16/10]"
          imageClassName="transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-1 bg-gradient-to-b from-black/45 to-transparent px-2.5 pb-4 pt-2">
          <span className="size-2 rounded-full bg-white/50" />
          <span className="size-2 rounded-full bg-white/50" />
          <span className="size-2 rounded-full bg-white/50" />
          {project.website && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-black/45 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-white/90 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Live
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <Link href={detailHref} className="min-w-0 truncate text-xl font-semibold tracking-tight hover:text-secondary">
            {project.title}
          </Link>
          <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-[0.18em] text-secondary">
            {String(index + 1).padStart(2, "0")} · {project.date}
          </span>
        </div>
        <p className="mb-4 mt-1.5 line-clamp-2 min-h-[2lh] text-[14px] leading-relaxed text-secondary">{project.description}</p>

        <div className="mt-auto flex items-center gap-1.5 border-t border-border/60 pt-3.5">
          {shown.map(([tech, icon]) => (
            <span key={tech} title={tech} className={`size-7 rounded-md ${techTileClass}`}>
              <TechIcon icon={icon!} size={15} className="size-[15px]" />
            </span>
          ))}
          {more > 0 && <span className="font-mono text-[10.5px] text-secondary">+{more}</span>}
          <div className="ml-auto flex items-center gap-1">
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} on GitHub`}
              className="inline-flex size-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-muted hover:text-foreground"
            >
              <GithubLogo className="size-4" />
            </a>
            {project.website && (
              <a
                href={project.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${project.title}`}
                className="inline-flex size-8 items-center justify-center rounded-full text-secondary transition-colors hover:bg-muted hover:text-foreground"
              >
                <Globe className="size-4" />
              </a>
            )}
            <Link
              href={detailHref}
              aria-label={`${project.title} details`}
              className="inline-flex size-8 items-center justify-center rounded-full border border-border text-foreground/80 transition-all duration-300 hover:bg-foreground hover:text-background group-hover:-rotate-45"
            >
              <ArrowRight className="size-3.5" weight="bold" />
            </Link>
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

export function ProjectsGrid({
  items,
  limit,
  showHeading = true,
  showViewAll = false,
  variant = "classic",
}: {
  items?: Project[];
  limit?: number;
  showHeading?: boolean;
  showViewAll?: boolean;
  /**
   * "classic": the original glass cards (live recording plays on hover).
   * "showcase": tall App Store–style cards (projects-showcase.tsx).
   * Both open the same project popup when you rest the mouse on a card.
   */
  variant?: "classic" | "showcase";
}) {
  const source = items ?? projects;
  // The homepage shows the first N projects in the curated order (src/config/projects.ts).
  const list = source;
  const displayed = limit ? list.slice(0, limit) : list;

  return (
    <Container>
      {showHeading && (
        <SectionHeading eyebrow="Selected work" title="Featured projects" />
      )}

      {variant === "showcase" ? (
        <ProjectsShowcase projects={displayed} />
      ) : (
        <ProjectPopupRoot>
          <div className="grid auto-rows-fr gap-4 sm:grid-cols-2">
            {displayed.map((project, index) => (
              <PopupTrigger key={project.slug} project={project} className="flex h-full min-w-0">
                <ProjectCard project={project} index={index} />
              </PopupTrigger>
            ))}
          </div>
        </ProjectPopupRoot>
      )}

      {showViewAll && (
        <div className="mt-8 flex justify-center">
          <TransitionLink
            href="/projects"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/60 py-2 pl-5 pr-2 text-sm font-medium transition-colors hover:border-foreground/30"
          >
            View all projects
            <span className="font-mono text-[11px] text-secondary">{source.length}</span>
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-foreground text-background transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight className="size-3.5" weight="bold" />
            </span>
          </TransitionLink>
        </div>
      )}
    </Container>
  );
}
