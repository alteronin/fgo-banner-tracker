"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { getAppBySlug, type TrackedApp } from "@/lib/apps";
import { getUnitRows, getUnitsConfig, matchesFilterGroups } from "@/lib/units";
import { UnitProvider, useUnitStatus } from "@/contexts/UnitContext";
import {
  getFavesServerSnapshot,
  getFavesSnapshot,
  subscribeFaves,
} from "@/lib/unitStorage";
import { ImageWithFallback } from "./ImageWithFallback";
import { AppSwitcher } from "./AppSwitcher";
import { AccountButton } from "./AccountButton";
import { ThemeToggle } from "./ThemeToggle";
import { GameTabs } from "./GameTabs";
import type { UnitGame, UnitRow, UnitsConfig, UnitStatus } from "@/types/units";

type SortOption = "name-asc" | "status" | "category-asc" | "rarity-desc";
type FilterOption = "all" | UnitStatus;

const STATUS_LABELS: Record<UnitStatus, string> = {
  none: "Not owned",
  owned: "Owned",
  planning: "Planning",
};

const STATUS_COLORS: Record<
  UnitStatus,
  { bg: string; border: string; text: string; dot: string }
> = {
  none: {
    bg: "bg-gray-800",
    border: "border-gray-700",
    text: "text-gray-400",
    dot: "bg-gray-600",
  },
  owned: {
    bg: "bg-green-900/50",
    border: "border-green-600",
    text: "text-green-300",
    dot: "bg-green-500",
  },
  planning: {
    bg: "bg-blue-900/50",
    border: "border-blue-600",
    text: "text-blue-300",
    dot: "bg-blue-500",
  },
};

export function UnitsPage({ game }: { game: UnitGame }) {
  const app = getAppBySlug(game);
  const config = getUnitsConfig(game);
  const rows = useMemo(() => getUnitRows(game), [game]);

  if (!app) return null;

  return (
    <UnitProvider game={game}>
      <UnitsView app={app} config={config} rows={rows} />
    </UnitProvider>
  );
}

function UnitsView({
  app,
  config,
  rows,
}: {
  app: TrackedApp;
  config: UnitsConfig;
  rows: UnitRow[];
}) {
  const { getStatus, toggleStatus } = useUnitStatus();

  const faveStore = useMemo(
    () => ({
      subscribe: (onChange: () => void) => subscribeFaves(app.slug, onChange),
      getSnapshot: () => getFavesSnapshot(app.slug),
      getServerSnapshot: getFavesServerSnapshot,
    }),
    [app.slug]
  );
  const faves = useSyncExternalStore(
    faveStore.subscribe,
    faveStore.getSnapshot,
    faveStore.getServerSnapshot
  );
  const faveIds = useMemo(() => new Set(Object.values(faves)), [faves]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [favesOnly, setFavesOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [taxo, setTaxo] = useState<Record<string, string[]>>({});

  const toggleTaxo = (key: string, value: string) => {
    setTaxo((prev) => {
      const current = prev[key] ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const clearTaxo = (key: string) => {
    setTaxo((prev) => ({ ...prev, [key]: [] }));
  };

  const filteredRows = useMemo(() => {
    let result = rows;

    if (filter !== "all") {
      result = result.filter((r) => getStatus(r.id) === filter);
    }

    if (favesOnly) {
      result = result.filter((r) => faveIds.has(r.id));
    }

    result = result.filter((r) => matchesFilterGroups(r.filters, taxo));

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q)
      );
    }

    if (sort === "name-asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "category-asc") {
      result = [...result].sort((a, b) => {
        const ci = a.category.localeCompare(b.category);
        return ci !== 0 ? ci : a.name.localeCompare(b.name);
      });
    } else if (sort === "rarity-desc") {
      result = [...result].sort((a, b) => {
        const ri = b.sortRarity - a.sortRarity;
        return ri !== 0 ? ri : a.name.localeCompare(b.name);
      });
    } else if (sort === "status") {
      const statusOrder: Record<string, number> = { owned: 0, planning: 1, none: 2 };
      result = [...result].sort((a, b) => {
        const sa = statusOrder[getStatus(a.id)] ?? 2;
        const sb = statusOrder[getStatus(b.id)] ?? 2;
        return sa !== sb ? sa - sb : a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [rows, filter, favesOnly, faveIds, search, sort, taxo, getStatus]);

  const stats = useMemo(() => {
    const total = rows.length;
    let owned = 0;
    let planning = 0;
    for (const r of rows) {
      const st = getStatus(r.id);
      if (st === "owned") owned++;
      else if (st === "planning") planning++;
    }
    return { total, owned, planning, unmarked: total - owned - planning };
  }, [rows, getStatus]);

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <AppSwitcher
            title={`${app.name} Collection`}
            subtitle={`${stats.total} ${config.noun} total`}
          />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <GameTabs game={app.slug} active="units" />
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

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" count={stats.total} color="gray" />
          <StatCard label="Owned" count={stats.owned} color="green" />
          <StatCard label="Planning" count={stats.planning} color="blue" />
          <StatCard label="Unmarked" count={stats.unmarked} color="gray" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder={config.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <div className="flex gap-2">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterButton>
            <FilterButton
              active={filter === "owned"}
              onClick={() => setFilter("owned")}
            >
              Owned
            </FilterButton>
            <FilterButton
              active={filter === "planning"}
              onClick={() => setFilter("planning")}
            >
              Planning
            </FilterButton>
            <FilterButton
              active={filter === "none"}
              onClick={() => setFilter("none")}
            >
              Unmarked
            </FilterButton>
            <FilterButton
              active={favesOnly}
              onClick={() => setFavesOnly((value) => !value)}
            >
              ★ Faves
            </FilterButton>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="status">Status</option>
            <option value="category-asc">{config.categoryLabel}</option>
            {config.rarityLabel && (
              <option value="rarity-desc">{config.rarityLabel}</option>
            )}
          </select>
        </div>

        {config.filterGroups.length > 0 && (
          <div className="mb-6 space-y-3">
            {config.filterGroups.map((group) => {
              const active = taxo[group.key] ?? [];
              return (
                <div
                  key={group.key}
                  className="flex flex-wrap items-center gap-2"
                >
                  <span className="w-20 sm:w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    {group.label}
                  </span>
                  <FilterButton
                    active={active.length === 0}
                    onClick={() => clearTaxo(group.key)}
                  >
                    All
                  </FilterButton>
                  {group.values.map((value) => (
                    <FilterButton
                      key={value}
                      active={active.includes(value)}
                      onClick={() => toggleTaxo(group.key, value)}
                    >
                      {value}
                    </FilterButton>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredRows.length} of {rows.length} {config.noun}
        </p>

        <div className="space-y-2">
          {filteredRows.map((row) => {
            const status = getStatus(row.id);
            const colors = STATUS_COLORS[status];
            return (
              <div
                key={row.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${colors.bg} ${colors.border}`}
              >
                <div className="w-10 h-10 relative overflow-hidden rounded-md bg-gray-800 flex-shrink-0">
                  <ImageWithFallback
                    src={row.imageUrl}
                    alt={row.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className={`text-sm font-medium truncate ${colors.text}`}>
                      {row.name}
                    </p>
                    {faveIds.has(row.id) && (
                      <span
                        className="text-yellow-500 text-xs flex-shrink-0"
                        aria-label="In your favorites"
                        title="In your favorites"
                      >
                        ★
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{row.subtitle}</p>
                </div>
                <button
                  onClick={() => toggleStatus(row.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${colors.bg} ${colors.border} ${colors.text} hover:opacity-80`}
                >
                  {STATUS_LABELS[status]}
                </button>
              </div>
            );
          })}
        </div>

        {filteredRows.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No {config.noun} found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "gray" | "green" | "blue";
}) {
  const colorMap = {
    gray: "border-gray-700 text-gray-400",
    green: "border-green-700 text-green-400",
    blue: "border-blue-700 text-blue-400",
  };
  return (
    <div className={`rounded-lg border p-3 bg-gray-900/50 ${colorMap[color]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${colorMap[color].split(" ")[1]}`}>{count}</p>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? "bg-white text-gray-900"
          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}
