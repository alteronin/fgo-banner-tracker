"use client";

import { useState, useMemo } from "react";
import type { Banner, FilterOption } from "@/types/banner";
import { useServantStatus } from "@/contexts/ServantContext";

export function useBannerFilter(banners: Banner[]) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const { getStatus } = useServantStatus();

  const filteredBanners = useMemo(() => {
    if (filter === "all") return banners;

    return banners.filter((banner) => {
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
  }, [banners, filter, getStatus]);

  return { filter, setFilter, filteredBanners };
}
