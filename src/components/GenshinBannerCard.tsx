"use client";

import type { GenshinBanner, GenshinBannerType } from "@/types/genshin";
import {
  formatGenshinDateRange,
  getGenshinBannerTitle,
  isGenshinBannerActive,
} from "@/lib/genshin-data";
import { GenshinRateUpChip } from "./GenshinRateUpChip";
import { ImageWithFallback } from "./ImageWithFallback";

interface GenshinBannerCardProps {
  banner: GenshinBanner;
  onClick?: () => void;
}

const TYPE_BADGE: Record<GenshinBannerType, { label: string; className: string }> = {
  character: { label: "Character", className: "bg-teal-500/90 text-gray-950" },
  weapon: { label: "Weapon", className: "bg-sky-400/90 text-gray-950" },
  chronicled: { label: "Chronicled", className: "bg-violet-400/90 text-gray-950" },
};

export function GenshinBannerCard({ banner, onClick }: GenshinBannerCardProps) {
  const active = isGenshinBannerActive(banner);
  const title = getGenshinBannerTitle(banner);
  const badge = TYPE_BADGE[banner.type];

  return (
    <div
      className="group relative rounded-lg overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden">
        <ImageWithFallback
          src={banner.banners[0].image ?? ""}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span
          className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded ${badge.className}`}
        >
          {badge.label}
        </span>
        {active && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            ACTIVE
          </span>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 to-transparent px-3 pt-8 pb-2">
          <span className="text-xs font-medium text-white/90">
            Version {banner.version}
            {banner.phase !== null ? ` · Phase ${banner.phase}` : ""}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
          {title}
        </h3>
        <div className="text-xs text-gray-400 mb-3">
          {formatGenshinDateRange(banner)}
        </div>
        {banner.featured5.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {banner.featured5.map((rateUp) => (
              <GenshinRateUpChip key={rateUp.name} rateUp={rateUp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
