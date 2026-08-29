"use client";

import { useState } from "react";
import type { Banner } from "@/types/banner";
import { BannerCard } from "./BannerCard";
import { BannerDetail } from "./BannerDetail";
import { FilterBar } from "./FilterBar";
import { SearchBar } from "./SearchBar";
import { SortBar } from "./SortBar";
import { useBannerFilter } from "@/hooks/useBannerFilter";

interface BannerListProps {
  banners: Banner[];
}

export function BannerList({ banners }: BannerListProps) {
  const { filter, setFilter, handleSearch, sort, setSort, filteredBanners } =
    useBannerFilter(banners);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  return (
    <div>
      <div className="mb-6 space-y-4">
        <SearchBar onSearch={handleSearch} />
        <div className="flex flex-wrap items-center gap-3">
          <FilterBar activeFilter={filter} onFilterChange={setFilter} />
          <SortBar activeSort={sort} onSortChange={setSort} />
        </div>
      </div>
      {filteredBanners.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No banners match the current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBanners.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onClick={() => setSelectedBanner(banner)}
            />
          ))}
        </div>
      )}
      {selectedBanner && (
        <BannerDetail
          banner={selectedBanner}
          onClose={() => setSelectedBanner(null)}
        />
      )}
    </div>
  );
}
