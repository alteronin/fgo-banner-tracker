"use client";

import { useState, useMemo, useCallback, useSyncExternalStore } from "react";
import type { Banner, FilterOption } from "@/types/banner";
import type { SortOption } from "@/components/SortBar";
import { useServantStatus } from "@/contexts/ServantContext";

const urlListeners = new Set<() => void>();

function notifyUrlChange(): void {
  urlListeners.forEach((listener) => listener());
}

function subscribeUrl(onChange: () => void): () => void {
  urlListeners.add(onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    urlListeners.delete(onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function getUrlSearch(): string {
  return window.location.search;
}

function getServerUrlSearch(): string {
  return "";
}

function parseUrlState(search: string): {
  filter: FilterOption;
  year: string;
  search: string;
} {
  const params = new URLSearchParams(search);
  const rawFilter = params.get("filter");
  const filter =
    rawFilter && ["all", "owned", "planning", "either"].includes(rawFilter)
      ? (rawFilter as FilterOption)
      : "all";
  const rawYear = params.get("year");
  const year = rawYear && /^\d{4}$/.test(rawYear) ? rawYear : "all";
  const searchQuery = params.get("search") || "";
  return { filter, year, search: searchQuery };
}

export function useBannerFilter(banners: Banner[]) {
  const [searchOverride, setSearchOverride] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("date-desc");
  const urlSearch = useSyncExternalStore(
    subscribeUrl,
    getUrlSearch,
    getServerUrlSearch
  );
  const { filter, year, search: urlSearchQuery } = parseUrlState(urlSearch);
  const searchQuery = searchOverride ?? urlSearchQuery;
  const { getStatus } = useServantStatus();

  const availableYears = useMemo(() => {
    const years = [...new Set(banners.map((b) => b.startDate.slice(0, 4)))].sort();
    return years;
  }, [banners]);

  const setFilter = useCallback((newFilter: FilterOption) => {
    const url = new URL(window.location.href);
    if (newFilter === "all") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", newFilter);
    }
    window.history.replaceState({}, "", url.toString());
    notifyUrlChange();
  }, []);

  const setYear = useCallback((newYear: string) => {
    const url = new URL(window.location.href);
    if (newYear === "all") {
      url.searchParams.delete("year");
    } else {
      url.searchParams.set("year", newYear);
    }
    window.history.replaceState({}, "", url.toString());
    notifyUrlChange();
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchOverride(query);
  }, []);

  const filteredBanners = useMemo(() => {
    let result = banners;

    // Year filter
    if (year !== "all") {
      result = result.filter((banner) => banner.startDate.startsWith(year));
    }

    // Status filter
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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((banner) => {
        return banner.servants.some((servant) =>
          servant.name.toLowerCase().includes(query)
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
  }, [banners, filter, searchQuery, sort, year, getStatus]);

  return {
    filter,
    setFilter,
    searchQuery,
    handleSearch,
    sort,
    setSort,
    year,
    setYear,
    availableYears,
    filteredBanners,
  };
}
