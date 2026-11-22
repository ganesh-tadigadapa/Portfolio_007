"use client";

import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { TechIcon, techTileClass } from "@/components/tech-icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { techStack } from "@/config/tech-stack";

export function TechStackSection() {
  return (
    <Container>
      <SectionHeading title="Tech Stack" uppercase />
      <div data-reveal-stagger="35" className="flex flex-wrap gap-3">
        {techStack.map((tech) => (
          <Tooltip key={tech.name} delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={tech.name}
                className={`size-[52px] rounded-xl ${techTileClass}`}
              >
                <TechIcon icon={tech.icon} size={24} className="size-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{tech.name}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </Container>
  );
}
