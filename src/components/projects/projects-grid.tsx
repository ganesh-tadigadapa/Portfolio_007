import Link from "next/link";
import { ArrowRight, GithubLogo, Globe } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { ProjectCover } from "@/components/projects/project-cover";
import { ProjectsShowcase } from "@/components/projects/projects-showcase";
import { PopupTrigger, ProjectPopupRoot } from "@/components/projects/project-popup";
import { TechIcon, techTileClass } from "@/components/shared/tech-icon";
import { projects, type Project } from "@/config/projects";
import { getTechIcon } from "@/lib/tech-icons";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const detailHref = `/projects/${project.slug}`;

  return (
    <LiquidGlassCard
      glowIntensity="sm"
      shadowIntensity="md"
      borderRadius="18px"
      blurIntensity="md"
      className="animate-in-up-on-view group flex min-w-0 flex-col transition-transform duration-300 ease-out hover:-translate-y-1"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <ProjectCover
        project={project}
        sizes="(max-width: 640px) 100vw, 360px"
        revealMedia
        className="aspect-[16/10] sm:aspect-[16/11]"
        imageClassName="transition-transform duration-500 group-hover:scale-[1.035]"
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={detailHref}
            className="min-w-0 text-xl font-bold tracking-tight transition-colors hover:text-secondary"
          >
            {project.title}
          </Link>
          <div className="flex shrink-0 items-center gap-1.5">
            {project.website && (
              <Link
                href={project.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${project.title}`}
                className="rounded-md p-1 text-secondary transition-colors hover:text-foreground"
              >
                <Globe className="size-5" />
              </Link>
            )}
            <Link
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} on GitHub`}
              className="rounded-md p-1 text-secondary transition-colors hover:text-foreground"
            >
              <GithubLogo className="size-5" />
            </Link>
          </div>
        </div>

        <p className="mt-4 flex-1 text-base leading-relaxed text-secondary">
          {project.description}
        </p>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-secondary">Technologies</p>
            <Link
              href={detailHref}
              className="group/details inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-secondary transition-colors hover:bg-muted hover:text-foreground"
            >
              View Details
              <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/details:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.tech.map((tech) => {
              const icon = getTechIcon(tech);
              return icon ? (
                <div
                  key={tech}
                  title={tech}
                  className={`size-7 rounded-md ${techTileClass}`}
                >
                  <TechIcon icon={icon} size={15} className="size-[15px]" />
                </div>
              ) : (
                <span
                  key={tech}
                  className="rounded-md border border-dashed border-border bg-background/50 px-2 py-1 font-mono text-[10px] text-secondary"
                >
                  {tech}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </LiquidGlassCard>
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
  const list = limit && !items ? source.filter((p) => p.featured) : source;
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
          <div className="grid gap-5 sm:grid-cols-2">
            {displayed.map((project, index) => (
              <PopupTrigger key={project.slug} project={project} className="flex min-w-0">
                <ProjectCard project={project} index={index} />
              </PopupTrigger>
            ))}
          </div>
        </ProjectPopupRoot>
      )}

      {showViewAll && (
        <div className="mt-10 flex justify-center">
          <Link
            href="/projects"
            className="rounded-lg border border-border bg-card px-5 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
          >
            Show all projects
          </Link>
        </div>
      )}
    </Container>
  );
}
