"use client";

import { useState, useMemo, useCallback } from "react";
import type { Banner, FilterOption } from "@/types/banner";
import type { SortOption } from "@/components/SortBar";
import { useServantStatus } from "@/contexts/ServantContext";

function getInitialFilter(): FilterOption {
  if (typeof window === "undefined") return "all";
  const params = new URLSearchParams(window.location.search);
  const urlFilter = params.get("filter") as FilterOption | null;
  if (urlFilter && ["all", "owned", "planning", "either"].includes(urlFilter)) {
    return urlFilter;
  }
  return "all";
}

export function useBannerFilter(banners: Banner[]) {
  const [filter, setFilterState] = useState<FilterOption>(getInitialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("date-desc");
  const { getStatus } = useServantStatus();

  const setFilter = useCallback((newFilter: FilterOption) => {
    setFilterState(newFilter);
    const url = new URL(window.location.href);
    if (newFilter === "all") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", newFilter);
    }
    window.history.replaceState({}, "", url.toString());
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query.toLowerCase());
  }, []);

  const filteredBanners = useMemo(() => {
    let result = banners;

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

    if (searchQuery) {
      result = result.filter((banner) => {
        return banner.servants.some((servant) =>
          servant.name.toLowerCase().includes(searchQuery)
        );
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "date-desc":
          return b.startDate.localeCompare(a.startDate);
        case "date-asc":
          return a.startDate.localeCompare(b.startDate);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "servants-desc":
          return b.servants.length - a.servants.length;
        case "servants-asc":
          return a.servants.length - b.servants.length;
        default:
          return 0;
      }
    });

    return result;
  }, [banners, filter, searchQuery, sort, getStatus]);

  return { filter, setFilter, searchQuery, handleSearch, sort, setSort, filteredBanners };
}
