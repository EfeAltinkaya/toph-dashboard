import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toph — Dashboard",
  description: "Farm activity dashboard for Toph.",
};

// Runs before React hydrates so a returning visitor's saved theme applies
// immediately, instead of flashing the default color first.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("toph-theme");
    if (theme) document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-neutral-50 text-neutral-900">
        {children}
      </body>
    </html>
  );
}
