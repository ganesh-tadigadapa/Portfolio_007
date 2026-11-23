import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/layout/container";

/**
 * Temporary page to compare three banner options side by side. Not linked anywhere
 * and kept out of search engines; delete once a banner is chosen.
 */
export const metadata: Metadata = {
  title: "Banner options",
  robots: { index: false, follow: false },
};

const OPTIONS = [
  {
    key: "A",
    name: "Taller banner, exact image (16:9)",
    note: "Your image exactly as it is, head to feet. Banner is 720 × 405 on a laptop.",
    aspect: "16 / 9",
    position: "50% 50%",
  },
  {
    key: "B",
    name: "Slim banner, same size as before (4:1)",
    note: "Banner keeps the original slim size (720 × 180). Him big, head and 殺 in view, legs cut.",
    aspect: "4 / 1",
    position: "50% 24%",
  },
  {
    key: "C",
    name: "Middle (2:1)",
    note: "A bit taller than before (720 × 360). Him big, head to about the knees.",
    aspect: "2 / 1",
    position: "50% 30%",
  },
];

export default function BannerLab() {
  return (
    <Container className="space-y-14 py-10">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-secondary">Temporary</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Pick a banner</h1>
        <p className="mt-2 text-sm text-secondary">Each is shown at the real size it would be on your homepage.</p>
      </header>

      {OPTIONS.map((o) => (
        <section key={o.key}>
          <p className="mb-3 text-sm">
            <span className="mr-2 inline-flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
              {o.key}
            </span>
            <span className="font-semibold">{o.name}</span>
          </p>
          <div
            className="relative w-full overflow-hidden rounded-2xl border border-foreground/10 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.45)]"
            style={{ aspectRatio: o.aspect }}
          >
            <Image
              src="/assets/header-close.jpg"
              alt={`Banner option ${o.key}`}
              fill
              sizes="(max-width: 640px) 100vw, 720px"
              className="object-cover"
              style={{ objectPosition: o.position }}
            />
          </div>
          <p className="mt-2 text-[13px] text-secondary">{o.note}</p>
        </section>
      ))}
    </Container>
  );
}
