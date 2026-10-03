"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { getAppBySlug, type TrackedApp } from "@/lib/apps";
import { getUnitRows, getUnitsConfig } from "@/lib/units";
import { UnitProvider, useUnitStatus } from "@/contexts/UnitContext";
import {
  getFavesServerSnapshot,
  getFavesSnapshot,
  notifyFavesChange,
  setFave,
  subscribeFaves,
} from "@/lib/unitStorage";
import { ImageWithFallback } from "./ImageWithFallback";
import { AppSwitcher } from "./AppSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { GameTabs } from "./GameTabs";
import type { UnitGame, UnitRow, UnitsConfig } from "@/types/units";

export const FAVES_SLOT_COUNT = 9;

const FAVES_SLOTS: { id: string; label: string }[] = Array.from(
  { length: FAVES_SLOT_COUNT },
  (_, i) => ({ id: String(i + 1), label: `Favorite ${i + 1}` })
);

export function FavesPage({ game }: { game: UnitGame }) {
  const app = getAppBySlug(game);
  const config = getUnitsConfig(game);
  const rows = useMemo(() => getUnitRows(game), [game]);

  if (!app) return null;

  return (
    <UnitProvider game={game}>
      <FavesView app={app} config={config} rows={rows} />
    </UnitProvider>
  );
}

function FavesView({
  app,
  config,
  rows,
}: {
  app: TrackedApp;
  config: UnitsConfig;
  rows: UnitRow[];
}) {
  const { getStatus } = useUnitStatus();

  const store = useMemo(
    () => ({
      subscribe: (onChange: () => void) => subscribeFaves(app.slug, onChange),
      getSnapshot: () => getFavesSnapshot(app.slug),
      getServerSnapshot: getFavesServerSnapshot,
    }),
    [app.slug]
  );

  const selections = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const ownedRows = useMemo(
    () => rows.filter((row) => getStatus(row.id) === "owned"),
    [rows, getStatus]
  );

  const handleSelect = (slotId: string, unitId: string) => {
    const current = selections[slotId];
    if (current === unitId) {
      setFave(app.slug, slotId, "");
      notifyFavesChange(app.slug);
      return;
    }
    for (const slot of FAVES_SLOTS) {
      if (slot.id !== slotId && selections[slot.id] === unitId) {
        setFave(app.slug, slot.id, "");
        notifyFavesChange(app.slug);
      }
    }
    setFave(app.slug, slotId, unitId);
    notifyFavesChange(app.slug);
  };

  const selectedCount = Object.values(selections).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <AppSwitcher
            title={`${app.name} Favorites`}
            subtitle={`${selectedCount} of ${FAVES_SLOT_COUNT} selected`}
          />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <GameTabs game={app.slug} active="faves" />
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
            >
              FGO
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {ownedRows.length === 0 && (
          <div className="py-4 px-4 rounded-lg border border-gray-800 bg-gray-900/30">
            <p className="text-sm text-gray-500">
              No owned {config.noun} yet. Mark units as owned on the{" "}
              <Link
                href={`/${app.slug}/units`}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Units
              </Link>{" "}
              page to fill your favorites.
            </p>
          </div>
        )}

        {FAVES_SLOTS.map((slot) => {
          const selectedId = selections[slot.id] || "";
          const selectedRow = ownedRows.find((row) => row.id === selectedId);

          return (
            <div key={slot.id}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-700 uppercase tracking-wider">
                  {slot.label}
                </h2>
                {selectedRow && (
                  <span className="text-xs text-green-400">{selectedRow.name}</span>
                )}
              </div>

              {ownedRows.length === 0 ? (
                <div className="py-4 px-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <p className="text-sm text-gray-600">
                    No owned {config.noun}
                  </p>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {ownedRows.map((row) => {
                    const isSelected = row.id === selectedId;
                    return (
                      <button
                        key={row.id}
                        onClick={() => handleSelect(slot.id, row.id)}
                        className={`
                          flex-shrink-0 w-20 rounded-lg border p-2 transition-all cursor-pointer
                          flex flex-col items-center gap-1.5
                          ${
                            isSelected
                              ? "border-green-500 bg-green-900/30 ring-1 ring-green-500/50"
                              : "border-gray-800 bg-gray-900/50 hover:border-gray-600"
                          }
                        `}
                        title={row.name}
                      >
                        <div className="w-14 h-14 relative overflow-hidden rounded-md bg-gray-800">
                          <ImageWithFallback
                            src={row.imageUrl}
                            alt={row.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <p className="text-[10px] text-gray-400 text-center leading-tight line-clamp-2 w-full">
                          {row.name}
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
