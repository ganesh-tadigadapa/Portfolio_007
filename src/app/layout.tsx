import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CommandMenu } from "@/components/layout/command-menu";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { siteConfig } from "@/config/meta";
import { PersonJsonLd } from "@/components/shared/person-json-ld";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
import { PageTransitionListener } from "@/components/layout/page-transition";
import { SiteIntro, siteIntroBootScript } from "@/components/effects/site-intro";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Before first paint: hold scroll-reveal targets hidden until the intro finishes */}
        <script dangerouslySetInnerHTML={{ __html: siteIntroBootScript }} />
        <noscript>
          <style>{`.site-intro{display:none!important}`}</style>
        </noscript>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <PersonJsonLd />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <TooltipProvider>
            <SiteIntro />
            <SmoothScroll />
            <PageTransitionListener />
            <div className="relative flex min-h-screen flex-col bg-grid">
              <SiteHeader />
              <main className="page-content flex-1">{children}</main>
              <ScrollReveal />
              <SiteFooter />
              <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 h-[60px] bg-gradient-to-t from-background/80 to-transparent [mask-image:linear-gradient(to_top,black_50%,transparent)]" />
              <CommandMenu />
            </div>
            {process.env.VERCEL && <Analytics />}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
