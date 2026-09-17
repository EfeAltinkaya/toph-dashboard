import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, IBM_Plex_Mono } from "next/font/google";
import { ThemeInit } from "@/components/ThemeInit";
import { I18nProvider } from "@/i18n/I18nProvider";
import { getI18n } from "@/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Marketing-page-only typefaces (the dashboard app keeps Geist throughout).
// Fraunces is a display serif with real optical-size and italic character,
// used sparingly for headlines; Plex Mono carries nav labels and eyebrows,
// a quiet nod to Furrow's own monospace wordmark without copying it.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Toph — Dashboard",
  description: "Farm activity dashboard for Toph.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { lang } = await getI18n();

  return (
    <html
      // Screen readers pick their pronunciation from this, so it has to
      // follow the chosen language rather than always saying "en".
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        <ThemeInit />
        <I18nProvider lang={lang}>{children}</I18nProvider>
      </body>
    </html>
  );
}
