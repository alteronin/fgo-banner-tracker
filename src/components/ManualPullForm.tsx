"use client";

import { useMemo, useState } from "react";
import { pityByDrop } from "@/lib/pity";
import { PULL_MAPS } from "@/lib/pullMaps";
import {
  buildManualPull,
  categoryLabel,
  CATEGORY_ORDER,
  normalizeName,
} from "@/lib/pullImport";
import { notifyPullsChange, setPulls } from "@/lib/pullStorage";
import { fillOwnedUnits, notifyUnitStatusesChange } from "@/lib/unitStorage";
import type { GamePull, PullGame } from "@/types/pulls";

const MAX_RESULTS = 24;

interface MapChoice {
  itemId: string;
  name: string;
  rarity: number | null;
  unitId: string | null;
}

function rarityClass(rarity: number | null): string {
  if (rarity === 5) return "text-amber-400";
  if (rarity === 4) return "text-purple-400";
  if (rarity === 3) return "text-blue-300";
  return "text-gray-400";
}

const pad2 = (value: number) => String(value).padStart(2, "0");

function toLocalInput(ts: number): string {
  const date = new Date(ts);
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` +
    `T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
  );
}

function parseLocalInput(value: string): number | null {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?$/.exec(
      value
    );
  if (!match) return null;
  const ts = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    Number(match[6] ?? 0)
  ).getTime();
  return Number.isNaN(ts) ? null : ts;
}

const FIELD_CLASS =
  "w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500";

export function ManualPullForm({
  game,
  pulls,
  initial,
  onSaved,
  onCancel,
}: {
  game: PullGame;
  pulls: GamePull[];
  initial?: GamePull;
  onSaved: (message: string) => void;
  onCancel: () => void;
}) {
  const entries = useMemo(() => {
    const list: MapChoice[] = [];
    for (const [itemId, item] of Object.entries(PULL_MAPS[game].items)) {
      if (!item.name) continue;
      list.push({
        itemId,
        name: item.name,
        rarity: item.rarity,
        unitId: item.unit,
      });
    }
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }, [game]);

  const initialEntry = initial
    ? entries.find((entry) => entry.itemId === initial.itemId) ?? null
    : null;

  const [when, setWhen] = useState(() => toLocalInput(initial?.ts ?? Date.now()));
  const [category, setCategory] = useState(
    initial?.category ?? CATEGORY_ORDER[game][0]
  );
  const [choice, setChoice] = useState<MapChoice | null>(initialEntry);
  const [query, setQuery] = useState("");
  const [customName, setCustomName] = useState(
    initial && !initialEntry ? initial.name : ""
  );
  const [customRarity, setCustomRarity] = useState(
    initial?.rarity ?? 5
  );
  const [error, setError] = useState<string | null>(null);

  const scope = useMemo(
    () => (initial ? pulls.filter((pull) => pull.id !== initial.id) : pulls),
    [pulls, initial]
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const starts = entries.filter((entry) =>
      entry.name.toLowerCase().startsWith(needle)
    );
    const contains = entries.filter((entry) => {
      const label = entry.name.toLowerCase();
      return !label.startsWith(needle) && label.includes(needle);
    });
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [entries, query]);

  const ts = parseLocalInput(when);
  const trimmedName = customName.trim();
  const valid =
    ts !== null && category !== "" && (choice !== null || trimmedName !== "");

  const draft = useMemo(() => {
    if (ts === null || !category) return null;
    if (!choice && !trimmedName) return null;
    const itemId = choice
      ? choice.itemId
      : game === "wuwa"
        ? normalizeName(trimmedName)
        : `manual-${normalizeName(trimmedName)}`;
    return buildManualPull({
      game,
      ts,
      category,
      itemId,
      name: choice ? choice.name : trimmedName,
      rarity: choice ? choice.rarity : customRarity,
      unitId: choice ? choice.unitId : null,
      existing: scope,
      seq: initial?.seq,
    });
  }, [ts, category, choice, trimmedName, game, customRarity, scope, initial]);

  const preview = useMemo(() => {
    if (!draft) return null;
    const label = categoryLabel(game, draft.category);
    if (draft.rarity === 5) {
      const hypothetical = pityByDrop([...scope, draft], 5);
      const pity = hypothetical.get(draft.id);
      if (pity !== undefined) {
        return `Preview: this will be Pity ${pity} · ${label}`;
      }
    }
    return `Preview: ${draft.rarity ?? "?"}★ · ${label}`;
  }, [draft, scope, game]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) {
      setError(
        ts === null
          ? "Pick a valid date and time."
          : "Choose an item or type a name."
      );
      return;
    }
    const next = initial
      ? pulls.map((pull) => (pull.id === initial.id ? draft : pull))
      : [...pulls, draft];
    if (!setPulls(game, next)) {
      setError("Could not save: browser storage is full.");
      return;
    }
    notifyPullsChange(game);
    if (draft.unitId) {
      const filled = fillOwnedUnits(game, [draft.unitId]);
      if (filled > 0) notifyUnitStatusesChange(game);
    }
    onSaved(initial ? "Entry updated." : "Entry added.");
  };

  return (
    <form
      onSubmit={submit}
      aria-label={initial ? "Edit pull entry" : "Add pull entry"}
      className="rounded-lg border border-gray-800 bg-gray-900/60 p-4 space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-300">
          {initial ? "Edit entry" : "Add entry"}
        </p>
        {initial && !initial.manual && (
          <p className="text-xs text-amber-400">
            From your export — re-importing restores the original.
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="block space-y-1 text-xs text-gray-400">
          Date &amp; time
          <input
            type="datetime-local"
            step={1}
            value={when}
            onChange={(e) => setWhen(e.target.value)}
            className={FIELD_CLASS}
          />
        </label>
        <label className="block space-y-1 text-xs text-gray-400">
          Banner
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={FIELD_CLASS}
          >
            {CATEGORY_ORDER[game].map((key) => (
              <option key={key} value={key}>
                {categoryLabel(game, key)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-1 text-xs text-gray-400">
        <span>Item</span>
        {choice ? (
          <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-950 px-3 py-2">
            <span className="text-sm text-white truncate">{choice.name}</span>
            <span className={`text-xs shrink-0 ${rarityClass(choice.rarity)}`}>
              {choice.rarity !== null ? "★".repeat(choice.rarity) : "—"}
            </span>
            <button
              type="button"
              aria-label="Clear item"
              onClick={() => {
                setChoice(null);
                setQuery("");
              }}
              className="ml-auto px-2 py-0.5 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-800"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              aria-label="Search items"
              placeholder="Search items…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={FIELD_CLASS}
            />
            {query.trim() && (
              <div className="rounded-lg border border-gray-800 bg-gray-950 divide-y divide-gray-800 max-h-48 overflow-auto">
                {results.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-500">
                    No match — use the fields below.
                  </p>
                ) : (
                  results.map((entry) => (
                    <button
                      key={entry.itemId}
                      type="button"
                      onClick={() => {
                        setChoice(entry);
                        setQuery("");
                      }}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left text-gray-200 hover:bg-gray-900"
                    >
                      <span className="truncate">{entry.name}</span>
                      <span
                        className={`text-xs shrink-0 ${rarityClass(entry.rarity)}`}
                      >
                        {entry.rarity !== null ? "★".repeat(entry.rarity) : "—"}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {!choice && (
        <div className="grid sm:grid-cols-[1fr_8rem] gap-3">
          <label className="block space-y-1 text-xs text-gray-400">
            Custom item name
            <input
              type="text"
              placeholder="e.g. Dan Heng"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className={FIELD_CLASS}
            />
          </label>
          <label className="block space-y-1 text-xs text-gray-400">
            Rarity
            <select
              aria-label="Rarity"
              value={customRarity}
              onChange={(e) => setCustomRarity(Number(e.target.value))}
              className={FIELD_CLASS}
            >
              <option value={5}>5★</option>
              <option value={4}>4★</option>
              <option value={3}>3★</option>
            </select>
          </label>
        </div>
      )}

      {preview && <p className="text-xs text-amber-400">{preview}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!valid}
          className="px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
        >
          {initial ? "Save changes" : "Add entry"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
