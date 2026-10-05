"use client";

import Link from "next/link";
import { AppSwitcher } from "@/components/AppSwitcher";
import { AccountButton } from "@/components/AccountButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { TrackedApp } from "@/lib/apps";

export function ComingSoonApp({ app }: { app: TrackedApp }) {
  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <AppSwitcher title={app.name} subtitle={app.tagline} />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
            >
              FGO
            </Link>
            <AccountButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-2xl text-2xl font-bold text-gray-950 mb-6"
          style={{ backgroundColor: app.color }}
          aria-hidden="true"
        >
          {app.badge}
        </div>
        <h2 className="text-2xl font-bold text-white dark:text-white light:text-gray-900">
          {app.name} is coming soon
        </h2>
        <p className="mt-2 max-w-md text-gray-400 dark:text-gray-400 light:text-gray-600">
          This tracker isn&apos;t built yet. Switch back to the FGO JP Banner
          Tracker to keep planning your pulls.
        </p>
        <Link
          href="/"
          className="mt-6 px-4 py-2 rounded-full text-sm font-medium bg-amber-500 hover:bg-amber-400 text-gray-950 transition-all"
        >
          Back to FGO Tracker
        </Link>
      </main>
    </div>
  );
}
