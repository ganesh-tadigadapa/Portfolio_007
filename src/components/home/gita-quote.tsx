import { Container } from "@/components/layout/container";

/**
 * Closing verse: Bhagavad Gita 2.47 in Devanagari, a transliteration, and an
 * English rendering. Quiet and centred, with a faint warm glow behind it.
 */
export function GitaQuote() {
  return (
    <Container>
      <figure
        data-reveal
        lang="en"
        className="relative overflow-hidden rounded-2xl border border-border bg-card/60 px-6 py-10 text-center sm:px-12 sm:py-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-3xl"
        />

        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-secondary">
          Bhagavad Gita &middot; 2.47
        </p>

        <blockquote className="relative mt-6">
          <p lang="sa" className="text-lg font-medium leading-relaxed tracking-wide text-foreground sm:text-xl">
            कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।
            <br />
            मा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥
          </p>

          <p lang="sa-Latn" className="mx-auto mt-4 max-w-xl text-[12.5px] italic leading-relaxed text-secondary">
            karmaṇy evādhikāras te mā phaleṣu kadācana
            <br />
            mā karma-phala-hetur bhūr mā te saṅgo &rsquo;stv akarmaṇi
          </p>

          <div aria-hidden className="mx-auto my-6 h-px w-12 bg-border" />

          <p className="mx-auto max-w-lg text-base leading-relaxed text-foreground/85 sm:text-lg">
            &ldquo;Your right is to the work alone, never to its fruits. Don&rsquo;t let results be
            your motive, and don&rsquo;t let that turn you away from doing your work.&rdquo;
          </p>
        </blockquote>
      </figure>
    </Container>
  );
}
