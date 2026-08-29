"use client";

import type { Banner } from "@/types/banner";
import { BannerCard } from "./BannerCard";
import { FilterBar } from "./FilterBar";
import { useBannerFilter } from "@/hooks/useBannerFilter";

interface BannerListProps {
  banners: Banner[];
}

export function BannerList({ banners }: BannerListProps) {
  const { filter, setFilter, filteredBanners } = useBannerFilter(banners);

  return (
    <div>
      <div className="mb-6">
        <FilterBar activeFilter={filter} onFilterChange={setFilter} />
      </div>
      {filteredBanners.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No banners match the current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBanners.map((banner) => (
            <BannerCard key={banner.id} banner={banner} />
          ))}
        </div>
      )}
    </div>
  );
}
