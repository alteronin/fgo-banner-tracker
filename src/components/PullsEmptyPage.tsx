"use client";

import Link from "next/link";
import { TRACKED_APPS } from "@/lib/apps";
import { AppSwitcher } from "./AppSwitcher";
import { GameTabs, FgoTabs } from "./GameTabs";
import { AccountButton } from "./AccountButton";
import { ThemeToggle } from "./ThemeToggle";

export function PullsEmptyPage({ game }: { game: string }) {
  const app = TRACKED_APPS.find((entry) => entry.slug === game);
  if (!app) return null;

  const isFgo = game === "";

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <AppSwitcher title={`${app.name} Pulls`} subtitle="No pull history" />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {isFgo ? (
              <>
                <FgoTabs active="pulls" />
                <AccountButton />
                <ThemeToggle />
              </>
            ) : (
              <>
                <GameTabs game={app.slug} active="pulls" />
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
                >
                  FGO
                </Link>
                <AccountButton />
                <ThemeToggle />
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-6 space-y-2">
          <p className="text-sm font-medium text-gray-300">
            Pull history import is not available for {app.name} yet.
          </p>
          <p className="text-sm text-gray-500">
            No pull-history export format exists for this game, so there is
            nothing to import. Supported right now: Genshin Impact, Honkai: Star
            Rail, Zenless Zone Zero and Wuthering Waves.
          </p>
        </div>
      </main>
    </div>
  );
}
