"use client";

import Link from "next/link";
import { getBanners } from "@/lib/data";
import { BannerList } from "@/components/BannerList";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ImportExport } from "@/components/ImportExport";
import { CollectionStats } from "@/components/CollectionStats";
import { AboutHelp } from "@/components/AboutHelp";

export default function Home() {
  const banners = getBanners();

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white dark:text-white light:text-gray-900">
              FGO JP Banner Tracker
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
              Track your pulls and plan your quartz
            </p>
          </div>
          <div className="flex items-center gap-3">
            <CollectionStats />
            <Link
              href="/servants"
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
            >
              Servants
            </Link>
            <ImportExport />
            <AboutHelp />
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
