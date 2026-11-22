import Image from "next/image";
import { heroConfig } from "@/config/hero";
import { cn } from "@/lib/utils";

export function ProfileAvatar({ className }: { className?: string }) {
  return (
    <div className={cn("relative size-24 shrink-0 overflow-hidden rounded-full", className)}>
      <Image
        src={heroConfig.avatar}
        alt={`${heroConfig.name} profile`}
        width={192}
        height={192}
        className="size-full rounded-full object-cover"
        priority
      />
    </div>
  );
}
