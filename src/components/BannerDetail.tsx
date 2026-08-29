"use client";

import type { Banner } from "@/types/banner";
import { ServantChip } from "./ServantChip";

interface BannerDetailProps {
  banner: Banner;
  onClose: () => void;
}

export function BannerDetail({ banner, onClose }: BannerDetailProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "long",
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

  const singleRateUp = banner.servants.filter(
    (s) => s.rateUpType === "single"
  );
  const sharedRateUp = banner.servants.filter(
    (s) => s.rateUpType === "shared"
  );

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

        <div className="aspect-[480/173] relative overflow-hidden rounded-t-xl">
          <img
            src={banner.imageUrl}
            alt={banner.name}
            className="w-full h-full object-cover"
          />
          {active && (
            <div className="absolute top-3 right-12 sm:top-4 sm:right-16 bg-green-500 text-white text-xs sm:text-sm font-bold px-2 py-1 sm:px-3 sm:py-1 rounded">
              ACTIVE
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
            {banner.name}
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-400 mb-4 sm:mb-6">
            <div>
              <span className="text-gray-500">Start:</span>{" "}
              {formatDate(banner.startDate)}
            </div>
            <div>
              <span className="text-gray-500">End:</span>{" "}
              {formatDate(banner.endDate)}
            </div>
          </div>

          {singleRateUp.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                Single Rate-Up
              </h3>
              <div className="flex flex-wrap gap-2">
                {singleRateUp.map((servant) => (
                  <ServantChip
                    key={servant.slug}
                    name={servant.name}
                    slug={servant.slug}
                  />
                ))}
              </div>
            </div>
          )}

          {sharedRateUp.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                Shared Rate-Up
              </h3>
              <div className="flex flex-wrap gap-2">
                {sharedRateUp.map((servant) => (
                  <ServantChip
                    key={servant.slug}
                    name={servant.name}
                    slug={servant.slug}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500 mt-4">
            Click any servant to toggle status: None → Owned → Planning → None
          </div>
        </div>
      </div>
    </div>
  );
}
