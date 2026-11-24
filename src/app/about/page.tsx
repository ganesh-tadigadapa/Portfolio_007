import { ArrowUpRight, Certificate, GraduationCap } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/layout/container";
import { HighlightedText } from "@/components/shared/highlighted-text";
import { SectionHeading } from "@/components/shared/section-heading";
import { aboutConfig } from "@/config/about";
import { createPageMetadata, pageTitle } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: pageTitle("About"),
  description: aboutConfig.intro.replace(/\*\*/g, ""),
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-20 pt-8 sm:space-y-20">
      {/* Intro */}
      <Container>
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

        <div data-reveal-stagger="80" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {aboutConfig.stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card/50 px-4 py-3">
              <p className="text-2xl font-bold tracking-tight">{s.value}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-secondary">{s.label}</p>
            </div>
          ))}
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
                    <span key={item} className="rounded-md border border-border bg-background/60 px-2 py-0.5 text-[12.5px]">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>

      {/* Certifications */}
      <Container>
        <section>
          <SectionHeading eyebrow="Verified" title="Certifications" />
          <div className="grid gap-3 sm:grid-cols-3">
            {aboutConfig.certifications.map((c) => (
              <a
                key={c.name}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                data-reveal
                className="group flex flex-col rounded-2xl border border-border bg-card/50 p-5 transition-colors hover:border-foreground/25"
              >
                <Certificate className="size-5 text-secondary" />
                <p className="mt-3 text-sm font-semibold leading-snug">{c.name}</p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-secondary">
                  {c.issuer} · {c.date}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-[12.5px] font-medium text-secondary transition-colors group-hover:text-foreground">
                  Verify <ArrowUpRight className="size-3.5" />
                </span>
              </a>
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
                  <p className="mt-0.5 text-sm text-secondary">
                    {e.degree} · <span className="font-medium text-foreground">{e.score}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
