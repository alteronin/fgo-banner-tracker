"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { getServantsByClassName } from "@/lib/data";
import { useServantStatus } from "@/contexts/ServantContext";
import {
  getGrandServants,
  setGrandServant,
} from "@/lib/storage";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ServantData } from "@/lib/data";

interface GrandSlot {
  id: string;
  label: string;
  classes: string[];
}

const GRAND_SLOTS: GrandSlot[] = [
  { id: "saber", label: "Saber", classes: ["Saber"] },
  { id: "archer", label: "Archer", classes: ["Archer"] },
  { id: "lancer", label: "Lancer", classes: ["Lancer"] },
  { id: "rider", label: "Rider", classes: ["Rider"] },
  { id: "caster", label: "Caster", classes: ["Caster"] },
  { id: "assassin", label: "Assassin", classes: ["Assassin"] },
  { id: "berserker", label: "Berserker", classes: ["Berserker"] },
  {
    id: "extra-i",
    label: "Extra I",
    classes: ["Shielder", "Ruler", "Avenger", "Moon Cancer"],
  },
  {
    id: "extra-ii",
    label: "Extra II",
    classes: ["Alter Ego", "Foreigner", "Pretender", "Beast"],
  },
];

export default function GrandsPage() {
  const { getStatus } = useServantStatus();
  const [selections, setSelections] = useState<Record<string, string>>(
    () => getGrandServants()
  );

  const slotsWithServants = useMemo(() => {
    return GRAND_SLOTS.map((slot) => {
      const allCandidates = getServantsByClassName(slot.classes);
      const owned = allCandidates.filter(
        (s) => getStatus(s.slug) === "owned"
      );
      return { ...slot, owned };
    });
  }, [getStatus]);

  const handleSelect = (slotId: string, slug: string) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[slotId] === slug) {
        delete next[slotId];
      } else {
        next[slotId] = slug;
      }
      setGrandServant(slotId, next[slotId] || "");
      return next;
    });
  };

  const selectedCount = Object.keys(selections).filter(
    (k) => selections[k]
  ).length;

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white dark:text-white light:text-gray-900">
              Grand Servant Lineup
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
              {selectedCount} of {GRAND_SLOTS.length} selected
            </p>
          </div>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
          >
            Banners
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {slotsWithServants.map((slot) => {
          const selectedSlug = selections[slot.id] || "";
          const selectedServant = slot.owned.find(
            (s) => s.slug === selectedSlug
          );

          return (
            <div key={slot.id}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-700 uppercase tracking-wider">
                  {slot.label}
                </h2>
                {selectedServant && (
                  <span className="text-xs text-green-400">
                    {selectedServant.name}
                  </span>
                )}
              </div>

              {slot.owned.length === 0 ? (
                <div className="py-4 px-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <p className="text-sm text-gray-600">No owned servants</p>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {slot.owned.map((servant) => {
                    const isSelected = servant.slug === selectedSlug;
                    return (
                      <button
                        key={servant.slug}
                        onClick={() => handleSelect(slot.id, servant.slug)}
                        className={`
                          flex-shrink-0 w-20 rounded-lg border p-2 transition-all cursor-pointer
                          flex flex-col items-center gap-1.5
                          ${
                            isSelected
                              ? "border-green-500 bg-green-900/30 ring-1 ring-green-500/50"
                              : "border-gray-800 bg-gray-900/50 hover:border-gray-600"
                          }
                        `}
                        title={servant.name}
                      >
                        <div className="w-14 h-14 relative overflow-hidden rounded-md bg-gray-800">
                          <ImageWithFallback
                            src={servant.iconUrl}
                            alt={servant.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 text-center leading-tight line-clamp-2 w-full">
                          {servant.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
