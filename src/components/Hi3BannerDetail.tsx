"use client";

import type { Hi3Banner } from "@/types/hi3";
import { getHi3BannerTitle, isHi3BannerActive } from "@/lib/hi3-data";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import { GenshinRateUpChip as RateUpChip } from "./GenshinRateUpChip";
import { ImageWithFallback } from "./ImageWithFallback";

interface Hi3BannerDetailProps {
  banner: Hi3Banner;
  onClose: () => void;
}

export function Hi3BannerDetail({ banner, onClose }: Hi3BannerDetailProps) {
  useKeyboardNavigation({
    onEscape: onClose,
    enabled: true,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const active = isHi3BannerActive(banner);
  const title = getHi3BannerTitle(banner);
  const hasFeatured = banner.featured5.length > 0 || banner.featured4.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white z-10 p-1"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="aspect-video relative overflow-hidden rounded-t-xl">
          <ImageWithFallback
            src={banner.banners[0].image ?? ""}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-cover"
          />
          <span className="absolute top-3 left-3 sm:top-4 sm:left-4 text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1 rounded bg-red-500/90 text-gray-950">
            Battlesuit
          </span>
          {active && (
            <div className="absolute top-3 right-12 sm:top-4 sm:right-16 bg-green-500 text-white text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1 rounded">
              ACTIVE
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
            {title}
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-400 mb-4 sm:mb-6">
            <div>
              <span className="text-gray-500">Start:</span>{" "}
              {formatDate(banner.startDate)}
            </div>
            <div>
              <span className="text-gray-500">End:</span>{" "}
              {banner.endDate ? formatDate(banner.endDate) : "Ongoing"}
            </div>
            {banner.version !== null && (
              <div>
                <span className="text-gray-500">Version:</span> {banner.version}
              </div>
            )}
          </div>

          {!hasFeatured && (
            <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
              <p className="text-sm text-gray-500">
                No debut battlesuit listed for this version in the source data.
              </p>
            </div>
          )}

          {banner.featured5.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                Debut Battlesuits
              </h3>
              <div className="flex flex-wrap gap-2">
                {banner.featured5.map((rateUp) => (
                  <RateUpChip key={rateUp.name} rateUp={rateUp} bannerStart={banner.startDate} />
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            {banner.banners.map((b) =>
              b.url ? (
                <a
                  key={b.name}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-gray-300 mr-4"
                >
                  {b.name} on Fandom Wiki
                </a>
              ) : (
                <span key={b.name} className="mr-4">
                  {b.name}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
