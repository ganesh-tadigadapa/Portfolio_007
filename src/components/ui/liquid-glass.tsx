import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Intensity = "sm" | "md" | "lg";

const blurMap: Record<Intensity, string> = {
  sm: "18px",
  md: "28px",
  lg: "38px",
};

export function LiquidGlassCard({
  children,
  className,
  contentClassName,
  style,
  glowIntensity: _glowIntensity = "md",
  shadowIntensity: _shadowIntensity = "md",
  blurIntensity = "md",
  borderRadius = "16px",
  draggable = false,
  backdrop = false,
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
  glowIntensity?: Intensity;
  shadowIntensity?: Intensity;
  blurIntensity?: Intensity;
  borderRadius?: string;
  draggable?: boolean;
  /**
   * Blur what is behind the card. Only worth it when content actually moves behind it
   * (e.g. the fixed mobile nav): a backdrop blur is re-computed every scrolled frame,
   * and on cards sitting over the plain page background it costs a lot and shows nothing.
   */
  backdrop?: boolean;
}) {
  void _glowIntensity;
  void _shadowIntensity;

  return (
    <div
      draggable={draggable}
      className={cn(
        "relative overflow-hidden border border-black/15 ring-1 ring-white/20 dark:border-white/20 dark:ring-white/10",
        backdrop ? "bg-white/35 dark:bg-black/30" : "bg-white/60 dark:bg-white/[0.03]",
        className,
      )}
      style={{
        borderRadius,
        ...(backdrop && {
          backdropFilter: `blur(${blurMap[blurIntensity]}) saturate(1.8) contrast(1.04)`,
          WebkitBackdropFilter: `blur(${blurMap[blurIntensity]}) saturate(1.8) contrast(1.04)`,
        }),
        ...style,
      }}
    >
      <div className={cn("relative z-10 flex h-full flex-col", contentClassName)}>
        {children}
      </div>
    </div>
  );
}
