import Link from "next/link";
import {
  ArrowUpRight,
  Certificate,
  EnvelopeSimple,
  GithubLogo,
  GraduationCap,
  LinkedinLogo,
  Trophy,
} from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/layout/container";
import { HighlightedText } from "@/components/shared/highlighted-text";
import { SectionHeading } from "@/components/shared/section-heading";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { aboutConfig } from "@/config/about";
import { createPageMetadata, pageTitle } from "@/lib/metadata";

const connectIconMap = {
  mail: EnvelopeSimple,
  linkedin: LinkedinLogo,
  github: GithubLogo,
};

export const metadata = createPageMetadata({
  title: pageTitle("About"),
  description: aboutConfig.intro.replace(/\*\*/g, ""),
  path: "/about",
});

const card = "p-5 transition-transform duration-300 ease-out hover:-translate-y-0.5";

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-20 pt-8 sm:space-y-20">
      {/* Intro */}
      <Container>
        <div className="space-y-8">
          <div className="max-w-2xl space-y-4">
            <p data-reveal className="font-mono text-[11px] uppercase tracking-[0.22em] text-secondary">
              About me
            </p>
            <h1 data-reveal="blur" className="text-3xl font-bold tracking-tight sm:text-4xl">
              {aboutConfig.headline[0]}
              <br />
              {aboutConfig.headline[1]}
            </h1>
            <p data-reveal className="text-base leading-relaxed text-secondary sm:text-lg">
              <HighlightedText text={aboutConfig.intro} />
            </p>
          </div>

          <blockquote
            data-reveal
            className="max-w-2xl border-l-2 border-border pl-4 text-sm italic leading-relaxed text-secondary sm:text-base"
          >
            {aboutConfig.quote}
          </blockquote>

          {/* Quick stats */}
          <div data-reveal-stagger="80" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {aboutConfig.stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card/50 px-4 py-3">
                <p className="text-2xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-0.5 text-[12px] leading-snug text-secondary">{s.label}</p>
              </div>
            ))}
          </div>

          <div data-reveal-stagger="90" className="grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
            {aboutConfig.meta.map((item) => (
              <div key={item.label}>
                <p className="text-xs uppercase tracking-wider text-secondary">{item.label}</p>
                <p className="mt-1 text-sm font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Story */}
      <Container>
        <section>
          <SectionHeading eyebrow="Story" title={aboutConfig.story.title} />
          <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-secondary sm:text-base">
            {aboutConfig.story.paragraphs.map((paragraph) => (
              <p key={paragraph} data-reveal>
                <HighlightedText text={paragraph} />
              </p>
            ))}
          </div>
        </section>
      </Container>

      {/* Skills */}
      <Container>
        <section>
          <SectionHeading eyebrow="Toolbox" title="Skills" />
          <div className="divide-y divide-border rounded-2xl border border-border">
            {aboutConfig.skills.map((row) => (
              <div
                key={row.group}
                data-reveal
                className="grid gap-2 px-4 py-3.5 sm:grid-cols-[150px_1fr] sm:items-center sm:gap-4 sm:px-5"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-secondary">{row.group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {row.items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-[12.5px]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* Journey timeline */}
      <Container>
        <section>
          <SectionHeading eyebrow="2024 — now" title={aboutConfig.journey.title} />
          <ol className="relative ml-1.5 border-l border-border">
            {aboutConfig.journey.items.map((item) => (
              <li key={item.title} data-reveal className="relative pb-8 pl-6 last:pb-0">
                <span
                  aria-hidden
                  className="absolute -left-[5px] top-1.5 size-[9px] rounded-full border border-foreground/40 bg-background"
                />
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-secondary">{item.date}</p>
                <h3 className="mt-1 font-semibold">
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1 hover:underline hover:underline-offset-4"
                    >
                      {item.title}
                      <ArrowUpRight className="size-3.5 text-secondary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  ) : (
                    item.title
                  )}
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-secondary">{item.detail}</p>
              </li>
            ))}
          </ol>
        </section>
      </Container>

      {/* Certifications */}
      <Container>
        <section>
          <SectionHeading eyebrow="Verified" title="Certifications" />
          <div className="grid gap-3 sm:grid-cols-3">
            {aboutConfig.certifications.map((c) => (
              <LiquidGlassCard key={c.name} borderRadius="14px" className={`${card} animate-in-up-on-view`}>
                <Certificate className="size-5 text-secondary" />
                <p className="mt-3 text-sm font-semibold leading-snug">{c.name}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-secondary">
                  {c.issuer} · {c.date}
                </p>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-[12.5px] font-medium text-secondary transition-colors hover:text-foreground"
                >
                  Verify <ArrowUpRight className="size-3.5" />
                </a>
              </LiquidGlassCard>
            ))}
          </div>
        </section>
      </Container>

      {/* Achievements */}
      <Container>
        <section>
          <SectionHeading eyebrow="Wins" title="Achievements" />
          <div className="grid gap-3 sm:grid-cols-2">
            {aboutConfig.achievements.map((a) => (
              <div
                key={a.title}
                data-reveal
                className="flex items-start gap-3 rounded-xl border border-border bg-card/50 px-4 py-3.5"
              >
                <Trophy className="mt-0.5 size-4 shrink-0 text-amber-500/80" weight="fill" />
                <div>
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="text-[12.5px] text-secondary">{a.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* Education */}
      <Container>
        <section>
          <SectionHeading eyebrow="Education" title="Where I studied" />
          <div className="divide-y divide-border rounded-2xl border border-border">
            {aboutConfig.education.map((e) => (
              <div key={e.school} data-reveal className="flex items-start gap-3 px-4 py-4 sm:px-5">
                <GraduationCap className="mt-0.5 size-5 shrink-0 text-secondary" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <p className="font-semibold">{e.school}</p>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-secondary">{e.dates}</p>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-baseline justify-between gap-x-4 text-sm text-secondary">
                    <p>
                      {e.degree} · <span className="font-medium text-foreground">{e.score}</span>
                    </p>
                    <p className="text-[12.5px]">{e.place}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* Principles */}
      <Container>
        <section>
          <SectionHeading eyebrow="Principles" title={aboutConfig.principles.title} />
          <div className="grid gap-4 sm:grid-cols-2">
            {aboutConfig.principles.items.map((item) => (
              <LiquidGlassCard key={item.title} borderRadius="12px" className={`${card} animate-in-up-on-view`}>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-secondary">{item.description}</p>
              </LiquidGlassCard>
            ))}
          </div>
        </section>
      </Container>

      {/* Connect */}
      <Container>
        <LiquidGlassCard borderRadius="18px" className="space-y-4 p-6">
          <h2 className="text-xl font-bold tracking-tight">Let&apos;s connect</h2>
          <p className="text-sm leading-relaxed text-secondary sm:text-base">
            Open to internships and full-time roles in full-stack, cloud and DevOps. Whether it&apos;s a role, a
            project, or just a chat about systems — I&apos;d love to hear from you.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {aboutConfig.connectLinks.map((link) => {
              const Icon = connectIconMap[link.icon];
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <Icon className="size-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </LiquidGlassCard>
      </Container>
    </div>
  );
}
