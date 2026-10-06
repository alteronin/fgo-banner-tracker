"use client";

import { getBanners } from "@/lib/data";
import { BannerList } from "@/components/BannerList";
import { AppSwitcher } from "@/components/AppSwitcher";
import { AccountButton } from "@/components/AccountButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FgoTabs } from "@/components/GameTabs";
import { ImportExport } from "@/components/ImportExport";
import { CollectionStats } from "@/components/CollectionStats";
import { AboutHelp } from "@/components/AboutHelp";

export default function Home() {
  const banners = getBanners();

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <AppSwitcher
            title="FGO JP Banner Tracker"
            subtitle="Track your pulls and plan your quartz"
          />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <CollectionStats />
            <FgoTabs active="banners" />
            <ImportExport />
            <AboutHelp />
            <AccountButton />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <BannerList banners={banners} />
      </main>
    </div>
  );
}
