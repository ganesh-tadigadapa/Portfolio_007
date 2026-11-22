import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  GithubLogo,
} from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/container";
import { MdxContent } from "@/components/mdx-content";
import { ProjectCover } from "@/components/project-cover";
import { TechIcon } from "@/components/tech-icon";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { projects } from "@/config/projects";
import { getProjectPost, getProjectPosts } from "@/lib/mdx";
import { createPageMetadata, pageTitle } from "@/lib/metadata";
import { getTechIcon } from "@/lib/tech-icons";

export async function generateStaticParams() {
  const posts = await getProjectPosts();
  const slugs = new Set([
    ...projects.map((project) => project.slug),
    ...posts.map((post) => post.slug),
  ]);
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getProjectPost(slug);
  const project = projects.find((item) => item.slug === slug);
  if (!post && !project) return {};
  return createPageMetadata({
    title: pageTitle(post?.title ?? project?.title ?? "Project"),
    description: post?.description ?? project?.description ?? "",
    path: `/projects/${slug}`,
    type: "article",
  });
}

/** "09.2026" → "Sep 2026"; anything else is shown as-is. */
function formatDate(date: string) {
  const match = date.match(/^(\d{2})\.(\d{4})$/);
  if (!match) return date;
  const month = new Date(Number(match[2]), Number(match[1]) - 1).toLocaleString(
    "en",
    { month: "short" },
  );
  return `${month} ${match[2]}`;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getProjectPost(slug);
  const project = projects.find((item) => item.slug === slug);
  if (!post && !project) notFound();

  const title = post?.title ?? project?.title ?? "";
  const description = post?.description ?? project?.description ?? "";
  const date = post?.date ?? project?.date ?? "";
  const tech = post?.tech ?? project?.tech ?? [];
  const cover = post?.cover ?? project?.cover;
  const repoHref = project?.href;
  const websiteHref = project?.website;

  const index = projects.findIndex((item) => item.slug === slug);
  const prev = index > 0 ? projects[index - 1] : undefined;
  const next =
    index >= 0 && index < projects.length - 1 ? projects[index + 1] : undefined;

  const details = [
    { label: "Year", value: formatDate(date) },
    { label: "Status", value: websiteHref ? "Live" : "Open source" },
    {
      label: "Stack",
      value: `${tech.length} ${tech.length === 1 ? "technology" : "technologies"}`,
    },
  ];

  return (
    <div className="pb-20 pt-8">
      <Container>
        <Link
          data-reveal
          href="/projects"
          className="group inline-flex items-center gap-1.5 text-sm text-secondary transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          All projects
        </Link>

        <header className="mt-8">
          <p
            data-reveal
            className="text-xs font-bold uppercase tracking-[0.2em] text-secondary"
          >
            Project
          </p>
          <h1
            data-reveal="blur"
            className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl"
          >
            {title}
          </h1>
          <p
            data-reveal
            className="mt-4 max-w-2xl text-base leading-relaxed text-secondary sm:text-lg"
          >
            {description}
          </p>
          <div data-reveal className="mt-6 flex flex-wrap gap-2">
            {websiteHref && (
              <Link
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
              >
                Visit site
                <ArrowUpRight className="size-4" weight="bold" />
              </Link>
            )}
            {repoHref && (
              <Link
                href={repoHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                <GithubLogo className="size-4" weight="bold" />
                Source code
              </Link>
            )}
          </div>
        </header>

        <div data-reveal="unveil" className="mt-10">
          <LiquidGlassCard
            glowIntensity="sm"
            shadowIntensity="md"
            borderRadius="18px"
            blurIntensity="md"
          >
            <ProjectCover
              project={{
                title,
                cover,
                tech,
                gradient:
                  project?.gradient ?? "from-zinc-500/20 to-zinc-700/20",
              }}
              sizes="(max-width: 768px) 100vw, 720px"
              priority
              className="aspect-[16/9]"
            />
          </LiquidGlassCard>
        </div>

        <dl
          data-reveal-stagger="90"
          className="mt-10 grid gap-6 border-y border-border py-6 sm:grid-cols-3"
        >
          {details.map((item) => (
            <div key={item.label}>
              <dt className="text-xs uppercase tracking-wider text-secondary">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>

        {tech.length > 0 && (
          <section className="mt-12">
            <h2
              data-reveal
              className="text-xs font-bold uppercase tracking-[0.2em] text-secondary"
            >
              Built with
            </h2>
            <ul data-reveal-stagger="50" className="mt-4 flex flex-wrap gap-2">
              {tech.map((item) => {
                const icon = getTechIcon(item);
                return (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card/60 py-1.5 pl-1.5 pr-3 text-sm"
                  >
                    <span className="flex size-6 items-center justify-center rounded-md bg-background ring-1 ring-border/60 dark:bg-white/[0.06] dark:ring-white/10">
                      {icon ? (
                        <TechIcon icon={icon} size={14} className="size-3.5" />
                      ) : (
                        <span className="font-mono text-[10px] text-secondary">{item.slice(0, 2)}</span>
                      )}
                    </span>
                    {item}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {post && (
          <article className="prose prose-neutral dark:prose-invert mt-12 max-w-none">
            <MdxContent source={post.content} />
          </article>
        )}

        {(prev || next) && (
          <nav
            aria-label="More projects"
            className="mt-16 grid gap-4 sm:grid-cols-2"
          >
            {prev ? (
              <Link
                data-reveal
                href={`/projects/${prev.slug}`}
                className="group rounded-2xl border border-border p-5 transition-colors hover:bg-muted/60"
              >
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-secondary">
                  <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Previous
                </span>
                <span className="mt-2 block text-lg font-semibold tracking-tight">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link
                data-reveal
                href={`/projects/${next.slug}`}
                className="group rounded-2xl border border-border p-5 text-right transition-colors hover:bg-muted/60"
              >
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-secondary">
                  Next
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-2 block text-lg font-semibold tracking-tight">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        )}
      </Container>
    </div>
  );
}
