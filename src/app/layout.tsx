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
  title: "FGO JP Banner Tracker",
  description:
    "Track your Fate/Grand Order JP pulls and plan your quartz spending",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-gray-950 text-white dark:bg-gray-950 dark:text-white light:bg-gray-50 light:text-gray-900">
        <ThemeProvider>
          <ServantProvider>{children}</ServantProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
