"use client";

import type { TrackerSortOption } from "@/lib/trackerSort";

const SORTS: { value: TrackerSortOption; label: string }[] = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "featured-desc", label: "Most Featured" },
  { value: "featured-asc", label: "Least Featured" },
];

interface TrackerSortProps {
  value: TrackerSortOption;
  onChange: (sort: TrackerSortOption) => void;
}

export function TrackerSort({ value, onChange }: TrackerSortProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as TrackerSortOption)}
      aria-label="Sort banners"
      className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-500"
    >
      {SORTS.map((sort) => (
        <option key={sort.value} value={sort.value}>
          {sort.label}
        </option>
      ))}
    </select>
  );
}
