import { Container } from "@/components/layout/container";

/**
 * Closing line: Bhagavad Gita 2.47 in English. Same width and card style as the
 * sections above it, with a thin accent rule on the left, quote left, source right.
 */
export function GitaQuote() {
  return (
    <Container>
      <figure
        data-reveal
        className="relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-card/70 py-4 pl-6 pr-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      >
        <span aria-hidden className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-amber-500/70" />
        <blockquote className="text-[15px] italic leading-relaxed text-foreground/85">
          &ldquo;Your right is to the work alone, never to its fruits.&rdquo;
        </blockquote>
        <figcaption className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-secondary">
          Bhagavad Gita &middot; 2.47
        </figcaption>
      </figure>
    </Container>
  );
}
