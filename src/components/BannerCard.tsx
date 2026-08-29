"use client";

import type { Banner } from "@/types/banner";
import { ServantChip } from "./ServantChip";
import { BannerIndicators } from "./BannerIndicators";

interface BannerCardProps {
  banner: Banner;
  onClick?: () => void;
}

export function BannerCard({ banner, onClick }: BannerCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isCurrentlyActive = () => {
    const now = new Date();
    const start = new Date(banner.startDate + "T00:00:00");
    const end = new Date(banner.endDate + "T23:59:59");
    return now >= start && now <= end;
  };

  const active = isCurrentlyActive();

  return (
    <div
      className="group relative rounded-lg overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-600 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[480/173] relative overflow-hidden">
        <img
          src={banner.imageUrl}
          alt={banner.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <BannerIndicators banner={banner} />
        {active && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
            ACTIVE
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-white line-clamp-2 mb-2">
          {banner.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>{formatDate(banner.startDate)}</span>
          <span>{banner.servants.length} servants</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {banner.servants.map((servant) => (
            <ServantChip
              key={servant.slug}
              name={servant.name}
              slug={servant.slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
