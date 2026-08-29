"use client";

import type { Banner } from "@/types/banner";

interface RateUpIndicatorProps {
  banner: Banner;
}

export function RateUpIndicator({ banner }: RateUpIndicatorProps) {
  const hasSingleRateUp = banner.servants.some(
    (s) => s.rateUpType === "single"
  );
  const hasSharedRateUp = banner.servants.some(
    (s) => s.rateUpType === "shared"
  );

  if (!hasSingleRateUp && !hasSharedRateUp) return null;

  return (
    <div className="absolute bottom-2 left-2 flex items-center gap-1">
      {hasSingleRateUp && (
        <div className="bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
          S
        </div>
      )}
      {hasSharedRateUp && (
        <div className="bg-orange-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
          SH
        </div>
      )}
    </div>
  );
}
