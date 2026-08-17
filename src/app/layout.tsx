// Emericfolio — created by Tomi-Tom, 2026
// HTML shell of every page: fonts, site metadata, search-engine data and skip link
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { projects } from "@/data/projects";
import { contact, identite, libelles, partage } from "@/content/site";
import BackgroundShowreel from "@/components/BackgroundShowreel";
import DevErrorReporter from "@/components/DevErrorReporter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const SITE_URL = partage.url;
const TITLE = partage.titre;
const DESCRIPTION = partage.description;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s · ${identite.nom}`,
  },
  description: DESCRIPTION,
  keywords: partage.motsCles,
  authors: [{ name: identite.nom }],
  creator: identite.nom,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: identite.nom,
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: identite.nom,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
    creator: partage.compteX,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#08070C",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      // Extensions such as Dark Reader or password managers add attributes to
      // <html> before React boots, which would report as a hydration mismatch.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-chrome">
        {/* Without JS the loading screen never lifts, and the visitor faces a
            black page stuck at 008% instead of the site behind it. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html: '<style>[data-loader]{display:none !important}</style>',
          }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only fixed top-4 left-4 z-[100] bg-ink text-chrome border border-cyanglitch rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.25em]"
        >
          {libelles.allerAuContenu}
        </a>
        {process.env.NODE_ENV !== "production" && <DevErrorReporter />}
        <BackgroundShowreel />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            // `<` is escaped so a description holding "</script>" cannot close the tag.
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  name: identite.nom,
                  jobTitle: partage.metier,
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: partage.ville,
                  },
                  email: contact.email,
                  sameAs: contact.reseaux.map((r) => r.href),
                  image: `${SITE_URL}/logo.png`,
                  url: SITE_URL,
                },
                ...projects.map((p) => ({
                  "@type": "CreativeWork",
                  name: p.title,
                  dateCreated: p.year,
                  creator: {
                    "@type": "Person",
                    name: identite.nom,
                  },
                  image: `${SITE_URL}${p.posterUrl}`,
                  description: p.description,
                })),
              ],
            }).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
