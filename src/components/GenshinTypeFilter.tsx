import type { GenshinBannerType } from "@/types/genshin";

export type GenshinTypeFilterValue = "all" | GenshinBannerType;

interface GenshinTypeFilterProps {
  active: GenshinTypeFilterValue;
  onChange: (value: GenshinTypeFilterValue) => void;
}

const OPTIONS: { value: GenshinTypeFilterValue; label: string }[] = [
  { value: "all", label: "All Banners" },
  { value: "character", label: "Character" },
  { value: "weapon", label: "Weapon" },
  { value: "chronicled", label: "Chronicled" },
];

export function GenshinTypeFilter({ active, onChange }: GenshinTypeFilterProps) {
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
