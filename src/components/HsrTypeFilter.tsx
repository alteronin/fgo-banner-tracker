import type { HsrBannerType } from "@/types/hsr";

export type HsrTypeFilterValue = "all" | HsrBannerType;

interface HsrTypeFilterProps {
  active: HsrTypeFilterValue;
  onChange: (value: HsrTypeFilterValue) => void;
}

const OPTIONS: { value: HsrTypeFilterValue; label: string }[] = [
  { value: "all", label: "All Banners" },
  { value: "character", label: "Character" },
  { value: "lightcone", label: "Light Cone" },
];

export function HsrTypeFilter({ active, onChange }: HsrTypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${
              active === option.value
                ? "bg-white text-gray-900"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
