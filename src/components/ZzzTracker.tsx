"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppSwitcher } from "./AppSwitcher";
import { AccountButton } from "./AccountButton";
import { ThemeToggle } from "./ThemeToggle";
import { GameTabs } from "./GameTabs";
import { SearchBar } from "./SearchBar";
import { useSearchParam } from "@/hooks/useSearchParam";
import { setShowReruns, useShowReruns } from "@/hooks/useShowReruns";
import { YearFilter } from "./YearFilter";
import { ZzzTypeFilter, type ZzzTypeFilterValue } from "./ZzzTypeFilter";
import { ZzzBannerCard } from "./ZzzBannerCard";
import { ZzzBannerDetail } from "./ZzzBannerDetail";
import { RerunToggle } from "./RerunToggle";
import { TrackerSort } from "./TrackerSort";
import { computeRerunIds } from "@/lib/rerun";
import { compareTrackerBanners, type TrackerSortOption } from "@/lib/trackerSort";
import {
  getZzzBannerTitle,
  getZzzBanners,
  getZzzYears,
} from "@/lib/zzz-data";
import type { ZzzBanner } from "@/types/zzz";
import type { TrackedApp } from "@/lib/apps";

export function ZzzTracker({ app }: { app: TrackedApp }) {
  const banners = getZzzBanners();
  const years = getZzzYears();
  const urlSearch = useSearchParam("search");
  const [queryOverride, setQueryOverride] = useState<string | null>(null);
  const query = queryOverride ?? urlSearch ?? "";
  const [typeFilter, setTypeFilter] = useState<ZzzTypeFilterValue>("all");
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState<TrackerSortOption>("date-desc");
  const showReruns = useShowReruns();
  const [selectedBanner, setSelectedBanner] = useState<ZzzBanner | null>(null);

  const rerunIds = useMemo(
    () =>
      computeRerunIds(banners, {
        idOf: (banner) => banner.id,
        dateOf: (banner) => banner.startDate,
        unitsOf: (banner) => [
          ...banner.featured5.map((f) => f.name),
          ...banner.featured4.map((f) => f.name),
        ],
      }),
    [banners]
  );

  const filteredBanners = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = banners.filter((banner) => {
      if (typeFilter !== "all" && banner.type !== typeFilter) return false;
      if (year !== "all" && !banner.startDate.startsWith(year)) return false;
      if (!showReruns && rerunIds.has(banner.id)) return false;
      if (!q) return true;
      const haystack = [
        getZzzBannerTitle(banner),
        banner.version ?? "collab",
        banner.type,
        ...banner.featured5.map((f) => f.name),
        ...banner.featured4.map((f) => f.name),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
    return filtered.sort((a, b) =>
      compareTrackerBanners(a, b, sort, {
        dateOf: (banner) => banner.startDate,
        titleOf: getZzzBannerTitle,
        featuredCountOf: (banner) =>
          banner.featured5.length + banner.featured4.length,
        idOf: (banner) => banner.id,
      })
    );
  }, [banners, query, typeFilter, year, showReruns, rerunIds, sort]);

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
            onSearch={setQueryOverride}
            placeholder="Search banners or characters..."
          />
          <div className="flex flex-wrap items-center gap-3">
            <ZzzTypeFilter active={typeFilter} onChange={setTypeFilter} />
            <YearFilter years={years} selectedYear={year} onYearChange={setYear} />
            <TrackerSort value={sort} onChange={setSort} />
            {rerunIds.size > 0 && (
              <RerunToggle show={showReruns} onChange={setShowReruns} />
            )}
          </div>
        </div>
        {filteredBanners.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No banners match the current filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBanners.map((banner) => (
              <ZzzBannerCard
                key={banner.id}
                banner={banner}
                onClick={() => setSelectedBanner(banner)}
              />
            ))}
          </div>
        )}
      </main>
      {selectedBanner && (
        <ZzzBannerDetail
          banner={selectedBanner}
          onClose={() => setSelectedBanner(null)}
        />
      )}
    </div>
  );
}
