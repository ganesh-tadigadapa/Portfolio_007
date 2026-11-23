import { Container } from "@/components/layout/container";

/** Closing line: Bhagavad Gita 2.47 in English, in a small quiet box. */
export function GitaQuote() {
  return (
    <Container>
      <figure
        data-reveal
        className="mx-auto max-w-md rounded-xl border border-border bg-card/60 px-5 py-4 text-center"
      >
        <blockquote className="text-sm italic leading-relaxed text-foreground/85">
          &ldquo;Your right is to the work alone, never to its fruits.&rdquo;
        </blockquote>
        <figcaption className="mt-2 text-[10.5px] font-medium uppercase tracking-[0.2em] text-secondary">
          Bhagavad Gita &middot; 2.47
        </figcaption>
      </figure>
    </Container>
  );
}
