"use client";

import { ArrowRight } from "@phosphor-icons/react";
import Image from "next/image";
import { PopupTrigger, ProjectPopupRoot } from "@/components/projects/project-popup";
import type { Project } from "@/config/projects";
import { cn } from "@/lib/utils";

/**
 * Projects as tall App Store–style cards: the cover fills the card with the title over
 * it. Resting the mouse on a card (or clicking / tapping it) opens the shared project
 * popup with the live recording (project-popup.tsx).
 */
export function ProjectsShowcase({ projects }: { projects: Project[] }) {
  return (
    <ProjectPopupRoot>
      <ul className="grid gap-5 sm:grid-cols-2">
        {projects.map((p) => (
          <li key={p.slug} className="h-[400px] sm:h-[420px]">
            <PopupTrigger project={p} className="size-full">
              <ShowcaseCard project={p} />
            </PopupTrigger>
          </li>
        ))}
      </ul>
    </ProjectPopupRoot>
  );
}

function ShowcaseCard({ project }: { project: Project }) {
  return (
    <button
      type="button"
      data-popup-open
      aria-label={`Open ${project.title}`}
      className="group relative block size-full overflow-hidden rounded-[22px] border border-foreground/10 bg-card text-left shadow-[0_18px_40px_-24px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-out hover:-translate-y-1 active:scale-[0.985] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
    >
      {project.cover ? (
        <Image
          src={project.cover}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 360px"
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <div className={cn("absolute inset-0 bg-linear-to-br", project.gradient)} />
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-45% to-transparent to-75%"
      />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
          {project.tech[0]} &middot; {project.date}
        </p>
        <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">{project.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-snug text-white/70">{project.description}</p>
        <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-white/80 transition-colors group-hover:text-white">
          Open <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}
