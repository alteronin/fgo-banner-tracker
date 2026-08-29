"use client";

export type SortOption = "date-desc" | "date-asc" | "name-asc" | "name-desc" | "servants-desc" | "servants-asc";

interface SortBarProps {
  activeSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const SORTS: { value: SortOption; label: string }[] = [
  { value: "date-desc", label: "Newest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "servants-desc", label: "Most Servants" },
  { value: "servants-asc", label: "Least Servants" },
];

export function SortBar({ activeSort, onSortChange }: SortBarProps) {
  return (
    <select
      value={activeSort}
      onChange={(e) => onSortChange(e.target.value as SortOption)}
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
