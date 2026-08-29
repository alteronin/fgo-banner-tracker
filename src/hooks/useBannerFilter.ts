"use client";

import { useState, useMemo, useCallback } from "react";
import type { Banner, FilterOption } from "@/types/banner";
import { useServantStatus } from "@/contexts/ServantContext";

export function useBannerFilter(banners: Banner[]) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { getStatus } = useServantStatus();

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const filteredBanners = useMemo(() => {
    let result = banners;

    // Apply status filter
    if (filter !== "all") {
      result = result.filter((banner) => {
        return banner.servants.some((servant) => {
          const status = getStatus(servant.slug);
          switch (filter) {
            case "owned":
              return status === "owned";
            case "planning":
              return status === "planning";
            case "either":
              return status === "owned" || status === "planning";
            default:
              return true;
          }
        });
      });
    }

    // Apply search filter
    if (searchQuery) {
      result = result.filter((banner) => {
        return banner.servants.some((servant) =>
          servant.name.toLowerCase().includes(searchQuery)
        );
      });
    }

    return result;
  }, [banners, filter, searchQuery, getStatus]);

  return { filter, setFilter, searchQuery, handleSearch, filteredBanners };
}
