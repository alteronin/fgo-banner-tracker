"use client";

import { useState, useMemo, useCallback } from "react";
import type { Banner, FilterOption } from "@/types/banner";
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

    return result;
  }, [banners, filter, searchQuery, getStatus]);

  return { filter, setFilter, searchQuery, handleSearch, filteredBanners };
}
