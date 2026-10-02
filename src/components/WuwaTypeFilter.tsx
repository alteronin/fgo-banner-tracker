import type { WuwaBannerType } from "@/types/wuwa";

export type WuwaTypeFilterValue = "all" | WuwaBannerType;

interface WuwaTypeFilterProps {
  active: WuwaTypeFilterValue;
  onChange: (value: WuwaTypeFilterValue) => void;
}

const OPTIONS: { value: WuwaTypeFilterValue; label: string }[] = [
  { value: "all", label: "All Banners" },
  { value: "resonator", label: "Resonator" },
  { value: "selector", label: "Selector" },
];

export function WuwaTypeFilter({ active, onChange }: WuwaTypeFilterProps) {
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
