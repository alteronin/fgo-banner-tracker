import type { GenshinRateUp } from "@/types/genshin";
import { ImageWithFallback } from "./ImageWithFallback";

interface GenshinRateUpChipProps {
  rateUp: GenshinRateUp;
  linked?: boolean;
}

export function GenshinRateUpChip({ rateUp, linked = false }: GenshinRateUpChipProps) {
  const content = (
    <>
      {rateUp.image && (
        <ImageWithFallback
          src={rateUp.image}
          alt=""
          width={16}
          height={16}
          className="rounded-full object-cover shrink-0"
        />
      )}
      <span className="truncate">{rateUp.name}</span>
    </>
  );
  const baseClass =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-700 bg-gray-800 text-gray-300 max-w-full";

  if (linked && rateUp.url) {
    return (
      <a
        href={rateUp.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} hover:border-gray-500 transition-all`}
      >
        {content}
      </a>
    );
  }
  return <span className={baseClass}>{content}</span>;
}
