"use client";

import { useSyncExternalStore } from "react";
import type { GenshinRateUp } from "@/types/genshin";
import type { UnitStatus } from "@/types/units";
import { useUnitStatus } from "@/contexts/UnitContext";
import { syntheticStatusKey } from "@/lib/unitResolve";
import { ImageWithFallback } from "./ImageWithFallback";

interface GenshinRateUpChipProps {
  rateUp: GenshinRateUp;
  bannerStart?: string | null;
}

const STATUS_CONFIG: Record<
  UnitStatus,
  { bg: string; border: string; text: string; label: string }
> = {
  none: {
    bg: "bg-gray-800",
    border: "border-gray-700",
    text: "text-gray-400",
    label: "Not owned",
  },
  owned: {
    bg: "bg-green-900/50",
    border: "border-green-600",
    text: "text-green-300",
    label: "Owned",
  },
  planning: {
    bg: "bg-blue-900/50",
    border: "border-blue-600",
    text: "text-blue-300",
    label: "Planning to pull",
  },
};

function StatusIcon({ status }: { status: UnitStatus }) {
  if (status === "owned") {
    return (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (status === "planning") {
    return (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  return null;
}

let cachedNow: number | null = null;

function subscribeNow(): () => void {
  return () => {};
}

function getNowSnapshot(): number | null {
  if (cachedNow === null) cachedNow = Date.now();
  return cachedNow;
}

function getServerNowSnapshot(): number | null {
  return null;
}

export function GenshinRateUpChip({
  rateUp,
  bannerStart,
}: GenshinRateUpChipProps) {
  const { getStatus, setStatus, toggleStatus, resolveName } = useUnitStatus();
  const now = useSyncExternalStore(
    subscribeNow,
    getNowSnapshot,
    getServerNowSnapshot
  );

  const unitId = resolveName(rateUp.name);
  const isFuture =
    now !== null &&
    bannerStart != null &&
    new Date(`${bannerStart}T00:00:00Z`).getTime() > now;
  const statusKey = unitId ?? syntheticStatusKey(rateUp.name);
  const status = getStatus(statusKey);
  const config = STATUS_CONFIG[status];
  const interactive = unitId !== null || isFuture;

  const content = (
    <>
      {rateUp.image && (
        <ImageWithFallback
          src={rateUp.image}
          alt=""
          width={16}
          height={16}
          className="rounded-full object-cover shrink-0"
        />
      )}
      {status !== "none" && <StatusIcon status={status} />}
      <span className="truncate">{rateUp.name}</span>
    </>
  );

  if (!interactive) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-700 bg-gray-800 text-gray-300 max-w-full"
        title="Not on the roster"
      >
        {content}
      </span>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unitId !== null) {
      if (isFuture) {
        setStatus(unitId, status === "planning" ? "none" : "planning");
      } else {
        toggleStatus(unitId);
      }
      return;
    }
    setStatus(statusKey, status === "planning" ? "none" : "planning");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 max-w-full hover:opacity-80 cursor-pointer ${config.bg} ${config.border} ${config.text}`}
      title={
        isFuture && unitId === null
          ? "Future banner: click to plan"
          : `Click to change: ${config.label}`
      }
    >
      {content}
    </button>
  );
}
