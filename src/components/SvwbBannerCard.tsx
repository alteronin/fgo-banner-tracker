"use client";

import type { SvwbBanner, SvwbBannerType } from "@/types/shadowverse";
import {
  formatSvwbDateRange,
  getSvwbBannerTitle,
  isSvwbBannerActive,
} from "@/lib/shadowverse-data";
import { GenshinRateUpChip as RateUpChip } from "./GenshinRateUpChip";
import { ImageWithFallback } from "./ImageWithFallback";

interface SvwbBannerCardProps {
  banner: SvwbBanner;
  onClick?: () => void;
}

const TYPE_BADGE: Record<SvwbBannerType, { label: string; className: string }> =
  {
    set: { label: "Card Set", className: "bg-emerald-400/90 text-gray-950" },
    collab: { label: "Collab", className: "bg-pink-400/90 text-gray-950" },
  };

export function SvwbBannerCard({ banner, onClick }: SvwbBannerCardProps) {
  const active = isSvwbBannerActive(banner);
  const title = getSvwbBannerTitle(banner);
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
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
          {title}
        </h3>
        <div className="text-xs text-gray-400 mb-3">
          {formatSvwbDateRange(banner)}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {banner.featured5.map((rateUp) => (
            <RateUpChip key={rateUp.name} rateUp={rateUp} bannerStart={banner.startDate} />
          ))}
        </div>
      </div>
    </div>
  );
}
