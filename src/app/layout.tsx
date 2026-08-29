import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServantProvider } from "@/contexts/ServantContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FGO JP Banner Tracker",
    template: "%s | FGO JP Banner Tracker",
  },
  description:
    "Track your Fate/Grand Order JP pulls and plan your quartz spending. Browse summoning banners, mark owned servants, and plan future pulls.",
  keywords: [
    "FGO",
    "Fate Grand Order",
    "banner tracker",
    "summon banner",
    "servant tracker",
    "quartz planner",
    "JP server",
  ],
  authors: [{ name: "FGO Banner Tracker" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fgo-banner-tracker.vercel.app",
    siteName: "FGO JP Banner Tracker",
    title: "FGO JP Banner Tracker",
    description:
      "Track your Fate/Grand Order JP pulls and plan your quartz spending.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FGO JP Banner Tracker",
    description:
      "Track your Fate/Grand Order JP pulls and plan your quartz spending.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-gray-950 text-white dark:bg-gray-950 dark:text-white light:bg-gray-50 light:text-gray-900">
        <ThemeProvider>
          <ServantProvider>{children}</ServantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
