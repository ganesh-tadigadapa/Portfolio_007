import { Code, GitCommit, RocketLaunch, Trophy } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/meta";
import { projects } from "@/config/projects";
import { techStack } from "@/config/tech-stack";
import { getGitHubContributions } from "@/lib/github";

/** A row of proof points under the hero. Every number comes from real data. */
export async function Highlights() {
  const gh = await getGitHubContributions(siteConfig.githubUsername);
  const live = projects.filter((p) => p.website).length;

  const items = [
    { icon: RocketLaunch, value: `${live}`, label: "Live projects", sub: "Deployed and open source" },
    gh && {
      icon: GitCommit,
      value: `${Math.floor(gh.total.lastYear / 50) * 50}+`,
      label: "Contributions",
      sub: "On GitHub in the last year",
    },
    { icon: Code, value: `${techStack.length}`, label: "Technologies", sub: "Web, cloud and data" },
    { icon: Trophy, value: "SIH", label: "Smart India Hackathon", sub: "Built RetinaX, AI eye screening" },
  ].filter(Boolean) as { icon: typeof Code; value: string; label: string; sub: string }[];

  return (
    <Container>
      <ul data-reveal-stagger="70" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map(({ icon: Icon, value, label, sub }) => (
          <li
            key={label}
            className="group relative overflow-hidden rounded-xl border border-border bg-card/60 p-4 transition-colors hover:border-foreground/20"
          >
            <Icon className="size-5 text-secondary transition-colors group-hover:text-foreground" weight="duotone" />
            <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight">{value}</p>
            <p className="text-sm font-medium">{label}</p>
            <p className="mt-0.5 text-xs leading-snug text-secondary">{sub}</p>
          </li>
        ))}
      </ul>
    </Container>
  );
}
