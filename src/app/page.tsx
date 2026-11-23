import { Suspense } from "react";
import { GitHubContributions } from "@/components/home/github-contributions";
import { Hero } from "@/components/home/hero";
import { GitaQuote } from "@/components/home/gita-quote";
import { PhotoStrip } from "@/components/home/photo-strip";
import { VisitorCount } from "@/components/home/visitor-count";
import { TechStack } from "@/components/home/tech-stack";
import { ProjectsGrid } from "@/components/projects/projects-grid";
import { siteConfig } from "@/config/meta";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage() {
  return (
    <div className="space-y-12 pb-24 sm:space-y-16 sm:pb-20">
      <Hero />
      <TechStack />
      <ProjectsGrid limit={2} showViewAll />
      <Suspense
        fallback={
          <div
            className="mx-auto h-52 max-w-3xl rounded-xl bg-muted/40"
            aria-label="Loading GitHub activity"
          />
        }
      >
        <GitHubContributions />
      </Suspense>
      <PhotoStrip />
      <GitaQuote />
      <VisitorCount />
    </div>
  );
}
