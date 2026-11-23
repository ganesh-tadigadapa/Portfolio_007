"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarBlank,
  GraduationCap,
  MapPin,
  EnvelopeSimple,
  FileText,
  GithubLogo,
  LinkedinLogo,
  MediumLogo,
  SealCheck,
  XLogo,
} from "@phosphor-icons/react";
import { ProfileAvatar } from "@/components/shared/profile-avatar";
import { Container } from "@/components/layout/container";
import { RotatingTitle } from "@/components/home/rotating-title";
import { TimezoneWidget } from "@/components/home/timezone-widget";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { heroConfig, socialLinks } from "@/config/hero";

const iconMap = {
  x: XLogo,
  linkedin: LinkedinLogo,
  github: GithubLogo,
  medium: MediumLogo,
  mail: EnvelopeSimple,
  resume: FileText,
};

export function Hero() {
  return (
    <Container className="pt-3 sm:pt-4">
      <div className="flex flex-col gap-5">
        <div
          data-reveal="unveil"
          className="relative h-[calc(var(--grid-cell-size)*4.5)] sm:h-[calc(var(--grid-cell-size)*6)]"
        >
          <div className="relative size-full overflow-hidden rounded-2xl border border-foreground/10 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.45)]">
          {/* Banner is 3:1 on desktop (720 x 240), filled edge to edge. Previous banner:
              /assets/header.jpeg. */}
          <Image
            src="/assets/header-wide.jpg"
            alt="Header banner"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 720px"
            className="hero-parallax object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
          </div>
        </div>

        <TimezoneWidget className="-mt-3 self-end" />

        <div className="-mt-[calc(var(--grid-cell-size)*2)] flex items-end gap-4">
          <div data-reveal="scale" className="relative z-30 shrink-0 rounded-full bg-background p-1">
            <ProfileAvatar />
          </div>
        </div>

        <div className="min-w-0">
            <h1 data-reveal="blur" className="flex items-center gap-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {heroConfig.name}
              <SealCheck
                className="size-6 shrink-0 text-[#1D9BF0] sm:size-7"
                weight="fill"
                aria-label="Verified"
              />
            </h1>
            <div data-reveal="blur">
              <RotatingTitle />
            </div>
            <div data-reveal className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-secondary sm:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-700 dark:text-emerald-400">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                </span>
                Open to opportunities
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" weight="bold" />
                {heroConfig.location}
              </span>
              <span className="inline-flex items-center gap-1">
                <GraduationCap className="size-3.5" weight="bold" />
                CS @ Lovely Professional University
              </span>
            </div>
            <div data-reveal className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href="/projects"
                className="group/cta inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 sm:text-sm"
              >
                View projects
                <ArrowRight className="size-3.5 transition-transform group-hover/cta:translate-x-0.5 sm:size-4" weight="bold" />
              </Link>
              <Link
                href={heroConfig.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted sm:text-sm"
              >
                <CalendarBlank className="size-3.5 sm:size-4" weight="bold" />
                Book a call
              </Link>
              <Link
                href={`mailto:${heroConfig.email}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted sm:text-sm"
              >
                <EnvelopeSimple className="size-3.5 sm:size-4" weight="bold" />
                Email me
              </Link>
            </div>
        </div>

        <p data-reveal className="max-w-xl text-sm leading-relaxed text-secondary sm:text-base">
          {heroConfig.bio}
        </p>

        <div data-reveal-stagger="70" className="-ml-1 flex flex-wrap gap-0.5">
          {socialLinks.map((link) => {
            const Icon = iconMap[link.icon];
            const external = link.href.startsWith("http") || link.href.startsWith("mailto:");

            return (
              <Tooltip key={link.name} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    aria-label={link.name}
                    className="flex items-center gap-2 p-1 text-secondary transition-colors hover:text-foreground"
                  >
                    <Icon className="size-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{link.name}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </Container>
  );
}
