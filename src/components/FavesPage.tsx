"use client";

import { useMemo, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import { getAppBySlug, type TrackedApp } from "@/lib/apps";
import { getUnitRows, getUnitsConfig } from "@/lib/units";
import { UnitProvider, useUnitStatus } from "@/contexts/UnitContext";
import {
  getFavesServerSnapshot,
  getFavesSnapshot,
  getFaveNotesServerSnapshot,
  getFaveNotesSnapshot,
  notifyFavesChange,
  notifyFaveNotesChange,
  setFave,
  setFaveNote,
  subscribeFaves,
  subscribeFaveNotes,
} from "@/lib/unitStorage";
import { ImageWithFallback } from "./ImageWithFallback";
import { AppSwitcher } from "./AppSwitcher";
import { AccountButton } from "./AccountButton";
import { ThemeToggle } from "./ThemeToggle";
import { GameTabs } from "./GameTabs";
import type { UnitGame, UnitRow, UnitsConfig } from "@/types/units";

export const FAVES_SLOT_COUNT = 9;

const FAVES_SLOTS: { id: string; label: string }[] = Array.from(
  { length: FAVES_SLOT_COUNT },
  (_, i) => ({ id: String(i + 1), label: `Favorite ${i + 1}` })
);

interface DragPayload {
  unitId: string;
  fromSlot: string | null;
}

function PencilIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.651-1.651a2 2 0 012.828 0l2.121 2.121a2 2 0 010 2.828l-1.652 1.652M16.862 4.487L19.5 7.125M16.862 4.487L7.173 14.176a4 4 0 00-.977 1.664l-.836 3.347a.5.5 0 00.606.606l3.347-.836a4 4 0 001.664-.977L19.5 7.125" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function rarityStars(row: UnitRow): string {
  return row.sortRarity >= 1 && row.sortRarity <= 5
    ? "★".repeat(row.sortRarity)
    : "";
}

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

  const notesStore = useMemo(
    () => ({
      subscribe: (onChange: () => void) =>
        subscribeFaveNotes(app.slug, onChange),
      getSnapshot: () => getFaveNotesSnapshot(app.slug),
      getServerSnapshot: getFaveNotesServerSnapshot,
    }),
    [app.slug]
  );

  const notes = useSyncExternalStore(
    notesStore.subscribe,
    notesStore.getSnapshot,
    notesStore.getServerSnapshot
  );

  const ownedRows = useMemo(
    () =>
      rows.filter(
        (row) =>
          getStatus(row.id) === "owned" && row.filters.type !== "Weapon"
      ),
    [rows, getStatus]
  );

  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [drag, setDrag] = useState<DragPayload | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

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

  const handleSwap = (slotA: string, slotB: string) => {
    if (slotA === slotB) return;
    const a = selections[slotA] || "";
    const b = selections[slotB] || "";
    if (a === b) return;
    setFave(app.slug, slotA, b);
    setFave(app.slug, slotB, a);
    notifyFavesChange(app.slug);
  };

  const startLabelEdit = (slotId: string, current: string) => {
    setLabelDraft(current);
    setEditingLabel(slotId);
  };

  const startNoteEdit = (slotId: string, current: string) => {
    setNoteDraft(current);
    setEditingNote(slotId);
  };

  const saveLabel = (slotId: string) => {
    setFaveNote(app.slug, slotId, { label: labelDraft });
    notifyFaveNotesChange(app.slug);
    setEditingLabel(null);
  };

  const saveNote = (slotId: string) => {
    setFaveNote(app.slug, slotId, { note: noteDraft });
    notifyFaveNotesChange(app.slug);
    setEditingNote(null);
  };

  const handleDrop = (slotId: string, event: React.DragEvent) => {
    event.preventDefault();
    const payload = drag;
    setDrag(null);
    setDragOver(null);
    if (!payload) return;
    if (payload.fromSlot && payload.fromSlot !== slotId) {
      handleSwap(payload.fromSlot, slotId);
    } else if (payload.unitId) {
      handleSelect(slotId, payload.unitId);
    }
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
            <AccountButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
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

        {FAVES_SLOTS.map((slot, index) => {
          const selectedId = selections[slot.id] || "";
          const selectedRow = ownedRows.find((row) => row.id === selectedId);
          const meta = notes[slot.id] || {};
          const displayLabel = meta.label || slot.label;
          const isDragOver = dragOver === slot.id;

          return (
            <section
              key={slot.id}
              data-testid={`fave-slot-${slot.id}`}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = drag?.fromSlot
                  ? "move"
                  : "copy";
                if (dragOver !== slot.id) setDragOver(slot.id);
              }}
              onDragLeave={() => {
                setDragOver((prev) => (prev === slot.id ? null : prev));
              }}
              onDrop={(event) => handleDrop(slot.id, event)}
              className={`rounded-xl border p-3 sm:p-4 transition-colors ${
                isDragOver
                  ? "border-blue-500 bg-blue-950/20"
                  : "border-gray-800 bg-gray-900/40"
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {editingLabel === slot.id ? (
                  <input
                    autoFocus
                    value={labelDraft}
                    onChange={(event) => setLabelDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveLabel(slot.id);
                      if (event.key === "Escape") setEditingLabel(null);
                    }}
                    onBlur={() => {
                      if (editingLabel === slot.id) saveLabel(slot.id);
                    }}
                    aria-label={`Label for ${slot.label}`}
                    maxLength={40}
                    className="px-2 py-1 rounded-md bg-gray-900 border border-gray-700 text-sm text-white focus:outline-none focus:border-gray-500 w-40"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => startLabelEdit(slot.id, displayLabel)}
                    aria-label={`Edit label for ${slot.label}`}
                    className="group flex items-center gap-1.5 min-w-0"
                  >
                    <h2 className="text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-700 uppercase tracking-wider truncate">
                      {displayLabel}
                    </h2>
                    <PencilIcon className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </button>
                )}
                <span className="text-xs text-gray-600">
                  {selectedRow ? "1 unit" : "empty"}
                </span>
                <div className="ml-auto flex items-center gap-1">
                  {selectedRow && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          const prev = FAVES_SLOTS[index - 1];
                          if (prev) handleSwap(prev.id, slot.id);
                        }}
                        disabled={index === 0}
                        aria-label={`Move ${selectedRow.name} to previous slot`}
                        className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronLeftIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const next = FAVES_SLOTS[index + 1];
                          if (next) handleSwap(slot.id, next.id);
                        }}
                        disabled={index === FAVES_SLOTS.length - 1}
                        aria-label={`Move ${selectedRow.name} to next slot`}
                        className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronRightIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSelect(slot.id, selectedId)}
                        aria-label={`Clear ${displayLabel}`}
                        className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
                      >
                        <ClearIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {selectedRow ? (
                <div
                  data-testid={`fave-featured-${slot.id}`}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", selectedRow.id);
                    setDrag({ unitId: selectedRow.id, fromSlot: slot.id });
                  }}
                  onDragEnd={() => {
                    setDrag(null);
                    setDragOver(null);
                  }}
                  className="flex items-start gap-3 rounded-lg border border-green-900/60 bg-green-950/20 p-3 cursor-grab active:cursor-grabbing"
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 relative overflow-hidden rounded-lg bg-gray-800 flex-shrink-0">
                    <ImageWithFallback
                      src={selectedRow.imageUrl}
                      alt={selectedRow.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">
                      {selectedRow.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {selectedRow.subtitle}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      {rarityStars(selectedRow) && (
                        <span className="text-xs text-yellow-500" aria-label={`${selectedRow.sortRarity} stars`}>
                          {rarityStars(selectedRow)}
                        </span>
                      )}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
                        {selectedRow.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <Link
                        href={`/${app.slug}?search=${encodeURIComponent(selectedRow.name)}`}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
                      >
                        Banners
                      </Link>
                      <a
                        href={selectedRow.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all"
                      >
                        Wiki
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-700 px-4 py-5 text-center text-xs text-gray-600">
                  {ownedRows.length === 0
                    ? `No owned ${config.noun} to pick from yet`
                    : "Empty — pick a unit below"}
                </div>
              )}

              <div className="mt-2">
                {editingNote === slot.id ? (
                  <input
                    autoFocus
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") saveNote(slot.id);
                      if (event.key === "Escape") setEditingNote(null);
                    }}
                    onBlur={() => {
                      if (editingNote === slot.id) saveNote(slot.id);
                    }}
                    aria-label={`Note for ${displayLabel}`}
                    placeholder="Add a note (e.g. save for anniversary)"
                    maxLength={140}
                    className="w-full px-2 py-1.5 rounded-md bg-gray-900 border border-gray-700 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-500"
                  />
                ) : meta.note ? (
                  <button
                    type="button"
                    onClick={() => startNoteEdit(slot.id, meta.note || "")}
                    aria-label={`Edit note for ${displayLabel}`}
                    className="group w-full text-left flex items-start gap-1.5"
                  >
                    <p className="text-xs text-gray-400 italic flex-1 min-w-0 line-clamp-2">
                      “{meta.note}”
                    </p>
                    <PencilIcon className="w-3.5 h-3.5 mt-0.5 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => startNoteEdit(slot.id, "")}
                    aria-label={`Add note for ${displayLabel}`}
                    className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
                  >
                    + Add a note
                  </button>
                )}
              </div>

              {ownedRows.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-1 mt-3 scrollbar-thin overscroll-x-contain">
                  {ownedRows.map((row) => {
                    const isSelected = row.id === selectedId;
                    return (
                      <button
                        key={row.id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "copy";
                          event.dataTransfer.setData("text/plain", row.id);
                          setDrag({ unitId: row.id, fromSlot: null });
                        }}
                        onDragEnd={() => {
                          setDrag(null);
                          setDragOver(null);
                        }}
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
                        title={
                          isSelected
                            ? `${row.name} (selected — click to remove)`
                            : row.name
                        }
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
                        {rarityStars(row) && (
                          <p className="text-[9px] text-yellow-600 leading-none">
                            {rarityStars(row)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
