import {
  ArrowUpRight,
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
} from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/layout/container";
import { BackToTop, CopyEmail, LocalTime } from "@/components/layout/footer-bits";
import { TransitionLink } from "@/components/layout/page-transition";
import { siteConfig } from "@/config/meta";
import { headerNav } from "@/config/navigation";

const EMAIL = "ganeshtadigadapa1@gmail.com";

const connect = [
  { name: "GitHub", href: `https://github.com/${siteConfig.githubUsername}`, icon: GithubLogo },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/ganesh-tadigadapa", icon: LinkedinLogo },
  { name: "Email", href: `mailto:${EMAIL}`, icon: EnvelopeSimple },
];

/**
 * Site footer: a closing call to action (email with one-click copy, availability),
 * three small columns (navigate / connect / location with live local time), a bottom
 * bar with back-to-top, and an oversized faint wordmark to finish the page.
 */
export function SiteFooter() {
  return (
    <footer className="relative mt-8 overflow-hidden border-t border-border/60 pb-24 sm:pb-0">
      <Container className="pt-14 sm:pt-16">
        {/* Closing call to action */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11.5px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Available for internships &amp; full-time roles
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              Let&apos;s build something
              <br />
              <span className="text-secondary">together.</span>
            </h2>
          </div>
          <CopyEmail email={EMAIL} />
        </div>

        {/* Columns */}
        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-border/60 pt-8 sm:grid-cols-3">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-secondary">Navigate</p>
            <ul className="mt-3 space-y-2 text-sm">
              {headerNav.map((item) => (
                <li key={item.href}>
                  <TransitionLink
                    href={item.href}
                    className="text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-secondary">Connect</p>
            <ul className="mt-3 space-y-2 text-sm">
              {connect.map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground"
                  >
                    <Icon className="size-4 text-secondary transition-colors group-hover:text-foreground" />
                    {name}
                    <ArrowUpRight className="size-3 text-secondary opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-secondary">Based in</p>
            <p className="mt-3 text-sm text-foreground/80">Hyderabad, India</p>
            <p className="mt-1 text-sm text-secondary">
              <LocalTime /> <span className="text-secondary/70">· IST</span>
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col-reverse items-start gap-4 border-t border-border/60 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-[12.5px] text-secondary">
            <YinYang />
            <span>
              © {new Date().getFullYear()} {siteConfig.name}
            </span>
            <span aria-hidden className="hidden text-border sm:inline">
              |
            </span>
            <span className="hidden sm:inline">Designed &amp; built by me — Next.js, Motion, Vercel</span>
          </div>
          <BackToTop />
        </div>
      </Container>

      {/* Oversized faint wordmark */}
      <p
        aria-hidden
        className="pointer-events-none -mb-[0.22em] select-none whitespace-nowrap text-center text-[17vw] font-black leading-none tracking-tighter text-foreground/[0.045] sm:text-[13.5vw]"
      >
        TADIGADAPA
      </p>
    </footer>
  );
}

/** The site's yin-yang mark, small, matching the favicon. */
function YinYang() {
  return (
    <svg viewBox="-50 -50 100 100" className="size-4 shrink-0" aria-hidden>
      <circle r="48" fill="#fff" />
      <path d="M0,-48 A48,48 0 0 1 0,48 A24,24 0 0 1 0,0 A24,24 0 0 0 0,-48 Z" fill="#0a0a0a" />
      <circle cy="-24" r="6.5" fill="#0a0a0a" />
      <circle cy="24" r="6.5" fill="#fff" />
      <circle r="48" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="3" />
    </svg>
  );
}
