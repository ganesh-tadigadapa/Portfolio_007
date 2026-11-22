import Image from "next/image";
import { cn } from "@/lib/utils";

/** Logos whose brand colour is black (or near it): drawn dark in light mode, white in dark mode. */
const MONO = new Set(["nextdotjs", "vercel", "render", "github", "gnubash"]);

function iconUrl(icon: string, color?: string) {
  if (icon.startsWith("/")) return icon;
  return `https://cdn.simpleicons.org/${icon}${color ? `/${color}` : ""}`;
}

/**
 * A technology logo from Simple Icons (or a local file), legible on both
 * themes: monochrome logos swap between near-black and white with the theme.
 */
export function TechIcon({
  icon,
  size,
  className,
}: {
  icon: string;
  size: number;
  className?: string;
}) {
  if (MONO.has(icon)) {
    return (
      <>
        <Image
          src={iconUrl(icon, "18181b")}
          alt=""
          width={size}
          height={size}
          unoptimized
          className={cn("shrink-0 dark:hidden", className)}
        />
        <Image
          src={iconUrl(icon, "fafafa")}
          alt=""
          width={size}
          height={size}
          unoptimized
          className={cn("hidden shrink-0 dark:block", className)}
        />
      </>
    );
  }

  return (
    <Image
      src={iconUrl(icon)}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={cn("shrink-0", className)}
    />
  );
}

/** Shared tile look: soft glass in dark mode, quiet card in light mode. */
export const techTileClass =
  "flex items-center justify-center border border-border bg-card/70 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 hover:border-foreground/25 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-white/25 dark:hover:bg-white/[0.08]";
