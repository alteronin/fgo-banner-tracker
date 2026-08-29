"use client";

interface YearFilterProps {
  years: string[];
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export function YearFilter({ years, selectedYear, onYearChange }: YearFilterProps) {
  return (
    <select
      value={selectedYear}
      onChange={(e) => onYearChange(e.target.value)}
      className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-gray-500"
    >
      <option value="all">All Years</option>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
}
