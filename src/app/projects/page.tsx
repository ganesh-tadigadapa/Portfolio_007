import { Container } from "@/components/layout/container";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { projects } from "@/config/projects";
import { createPageMetadata, pageTitle } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: pageTitle("Projects"),
  description:
    "Full-stack products, cloud infrastructure, distributed systems and AI tools built by Ganesh Tadigadapa.",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <div className="space-y-10 pb-16 pt-8">
      <Container>
        <p data-reveal className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Work</p>
        <h1 data-reveal="blur" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Projects</h1>
        <p data-reveal className="mt-3 text-secondary">
          Full-stack products, cloud infrastructure, and distributed systems I&apos;ve built along the way.
        </p>
      </Container>
      <ProjectsGrid items={projects} showHeading={false} variant="showcase" />
    </div>
  );
}
