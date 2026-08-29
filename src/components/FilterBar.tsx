"use client";

import type { FilterOption } from "@/types/banner";

interface FilterBarProps {
  activeFilter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
}

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All Banners" },
  { value: "owned", label: "Has Owned" },
  { value: "planning", label: "Has Planning" },
  { value: "either", label: "Has Either" },
];

export function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${
              activeFilter === filter.value
                ? "bg-white text-gray-900"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
