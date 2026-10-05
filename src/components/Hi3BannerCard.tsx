"use client";

import type { Hi3Banner } from "@/types/hi3";
import {
  formatHi3DateRange,
  getHi3BannerTitle,
  isHi3BannerActive,
} from "@/lib/hi3-data";
import { GenshinRateUpChip as RateUpChip } from "./GenshinRateUpChip";
import { ImageWithFallback } from "./ImageWithFallback";

interface Hi3BannerCardProps {
  banner: Hi3Banner;
  onClick?: () => void;
}

export function Hi3BannerCard({ banner, onClick }: Hi3BannerCardProps) {
  const active = isHi3BannerActive(banner);
  const title = getHi3BannerTitle(banner);

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
        <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded bg-red-500/90 text-gray-950">
          Battlesuit
        </span>
        {active && (
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            ACTIVE
          </span>
        )}
        {banner.version !== null && (
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 to-transparent px-3 pt-8 pb-2">
            <span className="text-xs font-medium text-white/90">
              Version {banner.version}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
          {title}
        </h3>
        <div className="text-xs text-gray-400 mb-3">
          {formatHi3DateRange(banner)}
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
