import type { SvwbBannerType } from "@/types/shadowverse";

export type SvwbTypeFilterValue = "all" | SvwbBannerType;

interface SvwbTypeFilterProps {
  active: SvwbTypeFilterValue;
  onChange: (value: SvwbTypeFilterValue) => void;
}

const OPTIONS: { value: SvwbTypeFilterValue; label: string }[] = [
  { value: "all", label: "All Banners" },
  { value: "set", label: "Card Set" },
  { value: "collab", label: "Collab" },
];

export function SvwbTypeFilter({ active, onChange }: SvwbTypeFilterProps) {
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
