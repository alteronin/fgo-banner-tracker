"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppSwitcher } from "./AppSwitcher";
import { AccountButton } from "./AccountButton";
import { ThemeToggle } from "./ThemeToggle";
import { GameTabs } from "./GameTabs";
import { SearchBar } from "./SearchBar";
import { YearFilter } from "./YearFilter";
import { SvwbTypeFilter, type SvwbTypeFilterValue } from "./SvwbTypeFilter";
import { SvwbBannerCard } from "./SvwbBannerCard";
import { SvwbBannerDetail } from "./SvwbBannerDetail";
import {
  getSvwbBannerTitle,
  getSvwbBanners,
  getSvwbYears,
} from "@/lib/shadowverse-data";
import type { SvwbBanner } from "@/types/shadowverse";
import type { TrackedApp } from "@/lib/apps";

export function SvwbTracker({ app }: { app: TrackedApp }) {
  const banners = getSvwbBanners();
  const years = getSvwbYears();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<SvwbTypeFilterValue>("all");
  const [year, setYear] = useState("all");
  const [selectedBanner, setSelectedBanner] = useState<SvwbBanner | null>(null);

  const filteredBanners = useMemo(() => {
    const q = query.trim().toLowerCase();
    return banners.filter((banner) => {
      if (typeFilter !== "all" && banner.type !== typeFilter) return false;
      if (year !== "all" && !banner.startDate.startsWith(year)) return false;
      if (!q) return true;
      const haystack = [
        getSvwbBannerTitle(banner),
        banner.type,
        ...banner.featured5.map((f) => f.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [banners, query, typeFilter, year]);

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <AppSwitcher title={app.name} subtitle={app.tagline} />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <GameTabs game={app.slug} active="banners" />
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
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 space-y-4">
          <SearchBar
            value={query}
            onSearch={setQuery}
            placeholder="Search banners or leaders..."
          />
          <div className="flex flex-wrap items-center gap-3">
            <SvwbTypeFilter active={typeFilter} onChange={setTypeFilter} />
            <YearFilter years={years} selectedYear={year} onYearChange={setYear} />
          </div>
        </div>
        {filteredBanners.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No banners match the current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBanners.map((banner) => (
              <SvwbBannerCard
                key={banner.id}
                banner={banner}
                onClick={() => setSelectedBanner(banner)}
              />
            ))}
          </div>
        )}
      </main>
      {selectedBanner && (
        <SvwbBannerDetail
          banner={selectedBanner}
          onClose={() => setSelectedBanner(null)}
        />
      )}
    </div>
  );
}
