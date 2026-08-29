"use client";

import type { Banner } from "@/types/banner";
import { useServantStatus } from "@/contexts/ServantContext";

interface BannerIndicatorsProps {
  banner: Banner;
}

export function BannerIndicators({ banner }: BannerIndicatorsProps) {
  const { getStatus } = useServantStatus();

  const ownedCount = banner.servants.filter(
    (s) => getStatus(s.slug) === "owned"
  ).length;

  const planningCount = banner.servants.filter(
    (s) => getStatus(s.slug) === "planning"
  ).length;

  if (ownedCount === 0 && planningCount === 0) return null;

  return (
    <div className="absolute top-2 left-2 flex items-center gap-1.5">
      {ownedCount > 0 && (
        <div className="flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          {ownedCount}
        </div>
      )}
      {planningCount > 0 && (
        <div className="flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
              clipRule="evenodd"
            />
          </svg>
          {planningCount}
        </div>
      )}
    </div>
  );
}
