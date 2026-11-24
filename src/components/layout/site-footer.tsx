import { ArrowUpRight, EnvelopeSimple, GithubLogo, LinkedinLogo, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/layout/container";
import { BackToTop, CopyButton, LocalTime } from "@/components/layout/footer-bits";
import { TransitionLink } from "@/components/layout/page-transition";
import { siteConfig } from "@/config/meta";
import { headerNav } from "@/config/navigation";

const EMAIL = "ganeshtadigadapa1@gmail.com";
const PHONE_DISPLAY = "+91 89190 59541";
const PHONE_TEL = "+918919059541";

const profiles = [
  { name: "GitHub", href: `https://github.com/${siteConfig.githubUsername}`, icon: GithubLogo },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/ganesh-tadigadapa", icon: LinkedinLogo },
];

const heading = "font-mono text-[10.5px] uppercase tracking-[0.2em] text-secondary";
const link = "group text-foreground/80 transition-colors hover:text-foreground";

/**
 * Site footer: identity + availability on the left; navigate / profiles / contact
 * columns (email and phone each with a copy button, location with local time); and a
 * plain bottom line with copyright and back-to-top.
 */
export function SiteFooter() {
  return (
    <footer className="relative mt-8 pb-24 sm:pb-0">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/25 to-transparent" />
      <Container className="pt-12 sm:pt-14">
        {/* Identity */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-md">
            <p className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
              <YinYang />
              {siteConfig.name}
            </p>
            <p className="mt-0.5 text-sm text-secondary">Full-Stack &amp; Cloud Engineer</p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-secondary">
              B.Tech CSE at Lovely Professional University. Building full-stack products and the cloud
              infrastructure behind them.
            </p>
          </div>
          <p className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
              </span>
              Open to internships &amp; full-time roles
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 border-t border-border/60 pt-8 sm:grid-cols-[1fr_1fr_1.7fr]">
          {/* Navigate */}
          <div>
            <p className={heading}>Navigate</p>
            <ul className="mt-3 space-y-2 text-sm">
              {headerNav.map((item) => (
                <li key={item.href}>
                  <TransitionLink href={item.href} className={`${link} inline-flex items-center gap-2`}>
                    <span className="h-px w-2.5 bg-current opacity-40 transition-all duration-300 group-hover:w-4 group-hover:opacity-100" />
                    {item.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Profiles */}
          <div>
            <p className={heading}>Profiles</p>
            <ul className="mt-3 space-y-2 text-sm">
              {profiles.map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${link}`}>
                    <Icon className="size-4 text-secondary transition-colors group-hover:text-foreground" />
                    {name}
                    <ArrowUpRight className="size-3 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 sm:col-span-1">
            <p className={heading}>Contact</p>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-center gap-2">
                <EnvelopeSimple className="size-4 shrink-0 text-secondary" />
                <a href={`mailto:${EMAIL}`} className={`truncate ${link}`}>
                  {EMAIL}
                </a>
                <CopyButton value={EMAIL} label="Copy email" />
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-secondary" />
                <a href={`tel:${PHONE_TEL}`} className={`tabular-nums ${link}`}>
                  {PHONE_DISPLAY}
                </a>
                <CopyButton value={PHONE_DISPLAY} label="Copy phone number" />
              </li>
              <li className="flex items-center gap-2 text-foreground/80">
                <MapPin className="size-4 shrink-0 text-secondary" />
                Hyderabad, India
                <span className="text-secondary">
                  · <LocalTime /> IST
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-start gap-4 border-t border-border/60 py-6 text-[12.5px] text-secondary sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <BackToTop />
        </div>
      </Container>
    </footer>
  );
}

/** The site's yin-yang mark, matching the favicon. */
function YinYang() {
  return (
    <svg viewBox="-50 -50 100 100" className="size-[18px] shrink-0" aria-hidden>
      <circle r="48" fill="#fff" />
      <path d="M0,-48 A48,48 0 0 1 0,48 A24,24 0 0 1 0,0 A24,24 0 0 0 0,-48 Z" fill="#0a0a0a" />
      <circle cy="-24" r="6.5" fill="#0a0a0a" />
      <circle cy="24" r="6.5" fill="#fff" />
      <circle r="48" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="3" />
    </svg>
  );
}
