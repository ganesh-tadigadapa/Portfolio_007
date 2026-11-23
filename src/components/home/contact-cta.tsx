import Link from "next/link";
import { ArrowUpRight, EnvelopeSimple, GithubLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/layout/container";
import { heroConfig, socialLinks } from "@/config/hero";

/** Closing call to action, so the page ends with a next step instead of a gap. */
export function ContactCta() {
  const linkedin = socialLinks.find((l) => l.icon === "linkedin")?.href;
  const github = socialLinks.find((l) => l.icon === "github")?.href;

  return (
    <Container>
      <div
        data-reveal
        className="relative overflow-hidden rounded-2xl border border-border bg-card/60 px-6 py-8 sm:px-10 sm:py-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary">What&rsquo;s next</p>
        <h2 className="mt-2 max-w-lg text-2xl font-bold tracking-tight sm:text-3xl">
          Have a role or a project in mind?
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-secondary sm:text-base">
          I&rsquo;m open to internships and full-time roles in full-stack, cloud and DevOps. Email is
          the fastest way to reach me.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`mailto:${heroConfig.email}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            <EnvelopeSimple className="size-4" weight="bold" />
            Email me
          </Link>
          {linkedin && (
            <Link
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <LinkedinLogo className="size-4" weight="bold" />
              LinkedIn
              <ArrowUpRight className="size-3.5 text-secondary" />
            </Link>
          )}
          {github && (
            <Link
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              <GithubLogo className="size-4" weight="bold" />
              GitHub
              <ArrowUpRight className="size-3.5 text-secondary" />
            </Link>
          )}
        </div>
      </div>
    </Container>
  );
}
