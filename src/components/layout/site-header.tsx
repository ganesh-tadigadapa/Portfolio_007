"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, MagnifyingGlass } from "@phosphor-icons/react";
import { headerNav } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { SoundToggle } from "@/components/layout/sound-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LiquidGlassCard } from "@/components/ui/liquid-glass";
import { TransitionLink } from "@/components/layout/page-transition";

export function SiteHeader() {
  const pathname = usePathname();

  const openCommand = () => {
    document.dispatchEvent(new CustomEvent("open-command-menu"));
  };

  return (
    <>
      <header className="site-header sticky top-0 z-50 w-full border-b border-border/50 bg-background/75 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-(--portfolio-content-width) items-center justify-between gap-4 px-5 sm:px-0">
          <TransitionLink
            href="/"
            className="font-mono text-lg font-bold tracking-tight text-foreground hover:opacity-80"
          >
            GT
          </TransitionLink>

          <div className="flex items-center gap-3 sm:gap-5">
            <nav className="hidden items-center gap-4 text-sm font-medium sm:flex sm:gap-5">
              {headerNav.map((item) => (
                <TransitionLink
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    pathname === item.href
                      ? "font-semibold text-foreground"
                      : "text-secondary",
                  )}
                >
                  {item.label}
                </TransitionLink>
              ))}
            </nav>

            <button
              type="button"
              onClick={openCommand}
              aria-label="Open command palette"
              className="hidden h-8 items-center gap-2 rounded-full border border-border bg-card/80 px-3 text-sm text-secondary shadow-sm transition-colors hover:border-foreground/20 hover:text-foreground sm:inline-flex"
            >
              <MagnifyingGlass className="size-4" weight="bold" />
              <span className="hidden items-center gap-1 sm:inline-flex">
                <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px]">
                  ⌘
                </kbd>
                <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px]">
                  K
                </kbd>
              </span>
            </button>

            <div className="hidden h-4 w-px bg-border sm:block" />

            <div className="flex items-center gap-0.5">
              <SoundToggle />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:hidden">
        <LiquidGlassCard
          backdrop
          glowIntensity="sm"
          shadowIntensity="md"
          borderRadius="9999px"
          blurIntensity="md"
          className="p-1.5"
          contentClassName="flex flex-row items-center gap-2"
        >
          <Link
            href="/"
            aria-label="Home"
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full text-secondary",
              pathname === "/" && "bg-foreground text-background",
            )}
          >
            <House className="size-5" />
          </Link>
          <button
            type="button"
            onClick={openCommand}
            aria-label="Search portfolio"
            className="inline-flex h-10 min-w-40 items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-5 text-sm font-medium text-foreground shadow-inner backdrop-blur-md"
          >
            <MagnifyingGlass className="size-4" weight="bold" />
            Search
          </button>
        </LiquidGlassCard>
      </div>
    </>
  );
}
