import type { Metadata } from "next";
import { Amiri, Cormorant_Garamond, IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MD Gallery | Curated Art & Handcrafted Objects",
    template: "%s · MD Gallery",
  },
  description:
    "MD Gallery — a curated collection of paintings, handcrafted tables, crochet and decor. Prices in EGP, direct WhatsApp inquiries.",
  other: {
    // Keep the gallery's own palette intact — prevents Dark Reader from
    // rewriting inline styles before React hydrates (false mismatches).
    "darkreader-lock": "true",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${cormorant.variable} ${amiri.variable} ${plexArabic.variable} h-full`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-paper text-ink" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}