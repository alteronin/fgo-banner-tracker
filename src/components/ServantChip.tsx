"use client";

import { useServantStatus } from "@/contexts/ServantContext";
import type { ServantStatus } from "@/types/banner";

interface ServantChipProps {
  name: string;
  slug: string;
}

const STATUS_CONFIG: Record<
  ServantStatus,
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

export function ServantChip({ name, slug }: ServantChipProps) {
  const { getStatus, toggleStatus } = useServantStatus();
  const status = getStatus(slug);
  const config = STATUS_CONFIG[status];

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleStatus(slug);
      }}
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        border transition-all duration-200
        ${config.bg} ${config.border} ${config.text}
        hover:opacity-80 cursor-pointer
      `}
      title={`Click to change: ${config.label}`}
    >
      {status === "owned" && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {status === "planning" && (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {name}
    </button>
  );
}
