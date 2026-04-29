import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const SITE_URL = "https://emericressy.com";
const TITLE = "Emeric Ressy — Motion Designer 3D & Art Direction";
const DESCRIPTION =
  "Portfolio motion design, 3D et direction artistique. Paris. Gaming, anime, pièces narratives.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Emeric Ressy",
  },
  description: DESCRIPTION,
  keywords: [
    "motion design",
    "3D",
    "art direction",
    "Paris",
    "Emeric Ressy",
    "Three.js portfolio",
    "anime",
    "esport",
  ],
  authors: [{ name: "Emeric Ressy" }],
  creator: "Emeric Ressy",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Emeric Ressy",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "Emeric Ressy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/logo.png"],
    creator: "@emericressy",
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
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink text-chrome">
        <a
          href="#main"
          className="sr-only focus:not-sr-only fixed top-4 left-4 z-[100] bg-ink text-chrome border border-cyanglitch rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.25em]"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
