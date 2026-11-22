"use client";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/shared/section-heading";
import { TechIcon, techTileClass } from "@/components/shared/tech-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { techStack } from "@/config/tech-stack";
import { getTechIcon } from "@/lib/tech-icons";

export function TechStackGrid() {
  return (
    <Container>
      <SectionHeading title="Tech Stack" uppercase />
      <div data-reveal-stagger="35" className="flex flex-wrap gap-3">
        {techStack.map((name) => {
          const icon = getTechIcon(name);
          if (!icon) return null;
          return (
            <Tooltip key={name} delayDuration={0}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={name}
                  className={`size-[52px] rounded-xl ${techTileClass}`}
                >
                  <TechIcon icon={icon} size={24} className="size-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{name}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </Container>
  );
}
