import { Container } from "@/components/layout/container";
import { SectionHeading } from "@/components/shared/section-heading";

/**
 * A song on repeat, via Spotify's official embed player (plays a preview, or the full
 * track for visitors signed in to Spotify). Lazy-loaded so it costs nothing until
 * scrolled near.
 */
const TRACK_ID = "2K7xn816oNHJZ0aVqdQsha"; // Softcore — The Neighbourhood

export function NowPlaying() {
  return (
    <Container>
      <SectionHeading eyebrow="On repeat" title="What I code to" />
      <div
        data-reveal
        className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-[0_8px_30px_-16px_rgba(0,0,0,0.35)]"
      >
        <iframe
          title="Softcore by The Neighbourhood on Spotify"
          src={`https://open.spotify.com/embed/track/${TRACK_ID}?utm_source=generator&theme=0`}
          width="100%"
          height="152"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="block border-0"
        />
      </div>
    </Container>
  );
}
