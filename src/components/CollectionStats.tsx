"use client";

import { useMemo } from "react";
import { useServantStatus } from "@/contexts/ServantContext";
import { getBanners, getUniqueServants } from "@/lib/data";

export function CollectionStats() {
  const { statuses } = useServantStatus();

  const stats = useMemo(() => {
    const banners = getBanners();
    const allServants = getUniqueServants(banners);
    const totalServants = allServants.length;

    const ownedCount = Object.values(statuses).filter(
      (s) => s === "owned"
    ).length;
    const planningCount = Object.values(statuses).filter(
      (s) => s === "planning"
    ).length;

    const ownedPercentage =
      totalServants > 0 ? Math.round((ownedCount / totalServants) * 100) : 0;
    const planningPercentage =
      totalServants > 0
        ? Math.round((planningCount / totalServants) * 100)
        : 0;

    return {
      totalServants,
      ownedCount,
      planningCount,
      ownedPercentage,
      planningPercentage,
    };
  }, [statuses]);

  if (stats.ownedCount === 0 && stats.planningCount === 0) return null;

  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-gray-400">
          {stats.ownedCount}/{stats.totalServants} owned ({stats.ownedPercentage}%)
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="text-gray-400">
          {stats.planningCount} planning ({stats.planningPercentage}%)
        </span>
      </div>
    </div>
  );
}
