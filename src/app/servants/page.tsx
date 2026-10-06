"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import { getServants } from "@/lib/data";
import { matchesFilterGroups } from "@/lib/units";
import { useServantStatus } from "@/contexts/ServantContext";
import { useSearchParam } from "@/hooks/useSearchParam";
import {
  getGrandsSnapshot,
  getGrandsServerSnapshot,
  subscribeGrands,
} from "@/lib/storage";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { AppSwitcher } from "@/components/AppSwitcher";
import { AccountButton } from "@/components/AccountButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FgoTabs } from "@/components/GameTabs";
import type { ServantStatus } from "@/types/banner";

type SortOption = "name-asc" | "status" | "class-asc";
type FilterOption = "all" | ServantStatus;

const CLASS_ORDER = [
  "Shielder",
  "Saber",
  "Archer",
  "Lancer",
  "Rider",
  "Caster",
  "Assassin",
  "Berserker",
  "Ruler",
  "Moon Cancer",
  "Alter Ego",
  "Foreigner",
  "Pretender",
  "Avenger",
  "Beast",
];

function classRank(className: string): number {
  const index = CLASS_ORDER.indexOf(className);
  return index === -1 ? CLASS_ORDER.length : index;
}

const STATUS_LABELS: Record<ServantStatus, string> = {
  none: "Not owned",
  owned: "Owned",
  planning: "Planning",
};

const STATUS_COLORS: Record<ServantStatus, { bg: string; border: string; text: string; dot: string }> = {
  none: { bg: "bg-gray-800", border: "border-gray-700", text: "text-gray-400", dot: "bg-gray-600" },
  owned: { bg: "bg-green-900/50", border: "border-green-600", text: "text-green-300", dot: "bg-green-500" },
  planning: { bg: "bg-blue-900/50", border: "border-blue-600", text: "text-blue-300", dot: "bg-blue-500" },
};

export default function ServantsPage() {
  const allServants = useMemo(() => getServants(), []);
  const { getStatus, toggleStatus } = useServantStatus();
  const grands = useSyncExternalStore(
    subscribeGrands,
    getGrandsSnapshot,
    getGrandsServerSnapshot
  );
  const grandSlugs = useMemo(
    () => new Set(Object.values(grands).filter(Boolean)),
    [grands]
  );

  const urlSearch = useSearchParam("search");
  const [searchOverride, setSearchOverride] = useState<string | null>(null);
  const search = searchOverride ?? urlSearch ?? "";
  const [filter, setFilter] = useState<FilterOption>("all");
  const [grandsOnly, setGrandsOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const toggleClass = (className: string) => {
    setSelectedClasses((prev) =>
      prev.includes(className)
        ? prev.filter((c) => c !== className)
        : [...prev, className]
    );
  };

  const filteredServants = useMemo(() => {
    let result = allServants;

    // Filter by status
    if (filter !== "all") {
      result = result.filter((s) => getStatus(s.slug) === filter);
    }

    if (grandsOnly) {
      result = result.filter((s) => grandSlugs.has(s.slug));
    }

    result = result.filter((s) =>
      matchesFilterGroups({ class: s.className }, { class: selectedClasses })
    );

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.className.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sort === "name-asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "class-asc") {
      result = [...result].sort((a, b) => {
        const ci = classRank(a.className) - classRank(b.className);
        return ci !== 0 ? ci : a.name.localeCompare(b.name);
      });
    } else if (sort === "status") {
      const statusOrder: Record<string, number> = { owned: 0, planning: 1, none: 2 };
      result = [...result].sort((a, b) => {
        const sa = statusOrder[getStatus(a.slug)] ?? 2;
        const sb = statusOrder[getStatus(b.slug)] ?? 2;
        return sa !== sb ? sa - sb : a.name.localeCompare(b.name);
      });
    }

    return result;
  }, [allServants, filter, grandsOnly, grandSlugs, search, sort, selectedClasses, getStatus]);

  const stats = useMemo(() => {
    const total = allServants.length;
    let owned = 0;
    let planning = 0;
    for (const s of allServants) {
      const st = getStatus(s.slug);
      if (st === "owned") owned++;
      else if (st === "planning") planning++;
    }
    return { total, owned, planning, unmarked: total - owned - planning };
  }, [allServants, getStatus]);

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <AppSwitcher
            title="Servant Collection"
            subtitle={`${stats.total} servants total`}
          />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <FgoTabs active="servants" />
            <AccountButton />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard label="Total" count={stats.total} color="gray" />
          <StatCard label="Owned" count={stats.owned} color="green" />
          <StatCard label="Planning" count={stats.planning} color="blue" />
          <StatCard label="Unmarked" count={stats.unmarked} color="gray" />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search servants..."
            value={search}
            onChange={(event) => setSearchOverride(event.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <div className="flex gap-2">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
              All
            </FilterButton>
            <FilterButton active={filter === "owned"} onClick={() => setFilter("owned")}>
              Owned
            </FilterButton>
            <FilterButton active={filter === "planning"} onClick={() => setFilter("planning")}>
              Planning
            </FilterButton>
            <FilterButton active={filter === "none"} onClick={() => setFilter("none")}>
              Unmarked
            </FilterButton>
            <FilterButton active={grandsOnly} onClick={() => setGrandsOnly((value) => !value)}>
              ★ Grands
            </FilterButton>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="status">Status</option>
            <option value="class-asc">Class</option>
          </select>
        </div>

        {/* Class filter */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="w-20 sm:w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Class
          </span>
          <FilterButton
            active={selectedClasses.length === 0}
            onClick={() => setSelectedClasses([])}
          >
            All
          </FilterButton>
          {CLASS_ORDER.map((className) => (
            <FilterButton
              key={className}
              active={selectedClasses.includes(className)}
              onClick={() => toggleClass(className)}
            >
              {className}
            </FilterButton>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Showing {filteredServants.length} of {allServants.length} servants
        </p>

        {/* Servant list */}
        <div className="space-y-2">
          {filteredServants.map((servant) => {
            const status = getStatus(servant.slug);
            const colors = STATUS_COLORS[status];
            return (
              <div
                key={servant.slug}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${colors.bg} ${colors.border}`}
              >
                <div className="w-10 h-10 relative overflow-hidden rounded-md bg-gray-800 flex-shrink-0">
                  <ImageWithFallback
                    src={servant.iconUrl}
                    alt={servant.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className={`text-sm font-medium truncate ${colors.text}`}>
                      {servant.name}
                    </p>
                    {grandSlugs.has(servant.slug) && (
                      <span
                        className="text-yellow-500 text-xs flex-shrink-0"
                        aria-label="In your Grand lineup"
                        title="In your Grand lineup"
                      >
                        ★
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{servant.className}</p>
                </div>
                <button
                  onClick={() => toggleStatus(servant.slug)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${colors.bg} ${colors.border} ${colors.text} hover:opacity-80`}
                >
                  {STATUS_LABELS[status]}
                </button>
              </div>
            );
          })}
        </div>

        {filteredServants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No servants found matching your criteria.
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
