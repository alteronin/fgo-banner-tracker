import type { ZzzBannerType } from "@/types/zzz";

export type ZzzTypeFilterValue = "all" | ZzzBannerType;

interface ZzzTypeFilterProps {
  active: ZzzTypeFilterValue;
  onChange: (value: ZzzTypeFilterValue) => void;
}

const OPTIONS: { value: ZzzTypeFilterValue; label: string }[] = [
  { value: "all", label: "All Banners" },
  { value: "agent", label: "Agent" },
  { value: "wengine", label: "W-Engine" },
];

export function ZzzTypeFilter({ active, onChange }: ZzzTypeFilterProps) {
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
