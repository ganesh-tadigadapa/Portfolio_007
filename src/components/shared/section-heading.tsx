import { cn } from "@/lib/utils";

/**
 * Section title. With an `eyebrow`, renders the home page's two-line heading
 * (small label above a bold title) so every section starts the same way.
 */
export function SectionHeading({
  title,
  eyebrow,
  className,
  uppercase = false,
}: {
  title: string;
  eyebrow?: string;
  className?: string;
  uppercase?: boolean;
}) {
  if (eyebrow) {
    return (
      <div data-reveal className={cn("mb-5", className)}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary">{eyebrow}</p>
        <h2 className="mt-1.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h2>
      </div>
    );
  }
  return (
    <div data-reveal className={cn("mb-4", className)}>
      <h2
        className={cn(
          "font-bold tracking-tight text-foreground",
          uppercase
            ? "text-xs uppercase tracking-[0.2em] text-secondary"
            : "text-xl",
        )}
      >
        {title}
      </h2>
    </div>
  );
}
