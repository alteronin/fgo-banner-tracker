"use client";

import { useMemo, useState } from "react";
import { getServants, type ServantData } from "@/lib/data";
import {
  BUFF_CATEGORIES,
  BUFF_CATEGORY_LABELS,
  EFFECT_TARGETS,
  EFFECT_TARGET_LABELS,
  NP_CARD_LABELS,
  NP_TYPES,
  NP_TYPE_LABELS,
  getServantEffectEntries,
  matchesEffectFilters,
  matchingEffectRows,
} from "@/lib/servantEffects";
import { useServantStatus } from "@/contexts/ServantContext";
import { useSearchParam } from "@/hooks/useSearchParam";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { AppSwitcher } from "@/components/AppSwitcher";
import { AccountButton } from "@/components/AccountButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FgoTabs } from "@/components/GameTabs";
import type { ServantStatus } from "@/types/banner";
import type {
  BuffCategoryKey,
  EffectFilterCriteria,
  EffectRow,
  EffectTarget,
  NpType,
  ServantEffectEntry,
} from "@/types/servantEffects";

type SortOption = "name-asc" | "rarity-desc" | "class-asc";
type StatusOption = "all" | ServantStatus;
type MatchMode = "any" | "all";

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

const STATUS_COLORS: Record<
  ServantStatus,
  { bg: string; border: string; text: string }
> = {
  none: { bg: "bg-gray-800", border: "border-gray-700", text: "text-gray-400" },
  owned: {
    bg: "bg-green-900/50",
    border: "border-green-600",
    text: "text-green-300",
  },
  planning: {
    bg: "bg-blue-900/50",
    border: "border-blue-600",
    text: "text-blue-300",
  },
};

const NP_CARD_STYLES: Record<string, string> = {
  buster: "bg-red-900/60 border-red-700 text-red-300",
  arts: "bg-blue-900/60 border-blue-700 text-blue-300",
  quick: "bg-green-900/60 border-green-700 text-green-300",
};

interface JoinedRow {
  servant: ServantData;
  entry?: ServantEffectEntry;
}

interface ServantBuffPageProps {
  initialSearch?: string | null;
}

export function ServantBuffPage({
  initialSearch = null,
}: ServantBuffPageProps = {}) {
  const allServants = useMemo(() => getServants(), []);
  const entries = useMemo(() => getServantEffectEntries(), []);
  const { getStatus, toggleStatus } = useServantStatus();

  const urlSearch = useSearchParam("search");
  const [searchOverride, setSearchOverride] = useState<string | null>(null);
  const search = searchOverride ?? initialSearch ?? urlSearch ?? "";

  const [cats, setCats] = useState<BuffCategoryKey[]>([]);
  const [targets, setTargets] = useState<EffectTarget[]>([]);
  const [npTypes, setNpTypes] = useState<NpType[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [status, setStatus] = useState<StatusOption>("all");
  const [mode, setMode] = useState<MatchMode>("any");
  const [sort, setSort] = useState<SortOption>("name-asc");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const joined = useMemo<JoinedRow[]>(() => {
    const bySlug = new Map(entries.map((e) => [e.slug, e]));
    return allServants.map((servant) => ({
      servant,
      entry: bySlug.get(servant.slug),
    }));
  }, [allServants, entries]);

  const criteria = useMemo<EffectFilterCriteria>(
    () => ({ cats, targets, npTypes, mode }),
    [cats, targets, npTypes, mode]
  );

  const toggleIn = <T,>(list: T[], value: T): T[] =>
    list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];

  const filtered = useMemo(() => {
    let result = joined;

    if (status !== "all") {
      result = result.filter((r) => getStatus(r.servant.slug) === status);
    }

    if (selectedClasses.length > 0) {
      result = result.filter((r) =>
        selectedClasses.includes(r.servant.className)
      );
    }

    const hasEffectFilters =
      criteria.cats.length > 0 ||
      criteria.targets.length > 0 ||
      criteria.npTypes.length > 0;
    if (hasEffectFilters) {
      result = result.filter((r) => {
        if (!r.entry) return false;
        return matchesEffectFilters(r.entry, criteria);
      });
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.servant.name.toLowerCase().includes(q) ||
          r.servant.className.toLowerCase().includes(q)
      );
    }

    if (sort === "name-asc") {
      result = [...result].sort((a, b) =>
        a.servant.name.localeCompare(b.servant.name)
      );
    } else if (sort === "rarity-desc") {
      result = [...result].sort((a, b) => {
        const ri = (b.entry?.rarity ?? -1) - (a.entry?.rarity ?? -1);
        return ri !== 0
          ? ri
          : a.servant.name.localeCompare(b.servant.name);
      });
    } else if (sort === "class-asc") {
      result = [...result].sort((a, b) => {
        const ci =
          classRank(a.servant.className) - classRank(b.servant.className);
        return ci !== 0 ? ci : a.servant.name.localeCompare(b.servant.name);
      });
    }

    return result;
  }, [joined, status, selectedClasses, search, sort, getStatus, criteria]);

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

  const toggleExpanded = (slug: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <AppSwitcher
            title="Servant Buff Finder"
            subtitle={`${entries.length} servants indexed`}
          />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <FgoTabs active="buffs" />
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
            placeholder="Search servants..."
            value={search}
            onChange={(event) => setSearchOverride(event.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
          />
          <div className="flex gap-2">
            <FilterButton active={status === "all"} onClick={() => setStatus("all")}>
              All
            </FilterButton>
            <FilterButton
              active={status === "owned"}
              onClick={() => setStatus("owned")}
            >
              Owned
            </FilterButton>
            <FilterButton
              active={status === "planning"}
              onClick={() => setStatus("planning")}
            >
              Planning
            </FilterButton>
            <FilterButton
              active={status === "none"}
              onClick={() => setStatus("none")}
            >
              Unmarked
            </FilterButton>
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="rarity-desc">Rarity</option>
            <option value="class-asc">Class</option>
          </select>
        </div>

        <div className="mb-6 space-y-3">
          <FilterGroup
            label="Buff"
            activeValues={cats}
            values={BUFF_CATEGORIES.map((c) => ({ key: c.key, label: c.label }))}
            onToggle={(value) => setCats((prev) => toggleIn(prev, value as BuffCategoryKey))}
            onClear={() => setCats([])}
          />
          <FilterGroup
            label="Target"
            activeValues={targets}
            values={EFFECT_TARGETS.map((t) => ({ key: t.key, label: t.label }))}
            onToggle={(value) => setTargets((prev) => toggleIn(prev, value as EffectTarget))}
            onClear={() => setTargets([])}
          />
          <FilterGroup
            label="NP Type"
            activeValues={npTypes}
            values={NP_TYPES.map((t) => ({ key: t.key, label: t.label }))}
            onToggle={(value) => setNpTypes((prev) => toggleIn(prev, value as NpType))}
            onClear={() => setNpTypes([])}
          />
          <FilterGroup
            label="Class"
            activeValues={selectedClasses}
            values={CLASS_ORDER.map((c) => ({ key: c, label: c }))}
            onToggle={(value) => setSelectedClasses((prev) => toggleIn(prev, value))}
            onClear={() => setSelectedClasses([])}
          />
        </div>

        {cats.length >= 2 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="w-20 sm:w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Match
            </span>
            <FilterButton active={mode === "any"} onClick={() => setMode("any")}>
              Any buff
            </FilterButton>
            <FilterButton active={mode === "all"} onClick={() => setMode("all")}>
              All buffs
            </FilterButton>
            <span className="text-xs text-gray-500">
              {mode === "any"
                ? "servants with at least one of the selected buffs"
                : "servants with every selected buff"}
            </span>
          </div>
        )}

        <p className="text-sm text-gray-500 mb-4">
          Showing {filtered.length} of {allServants.length} servants
        </p>

        <div className="space-y-2">
          {filtered.map(({ servant, entry }) => {
            const statusValue = getStatus(servant.slug);
            const colors = STATUS_COLORS[statusValue];
            const rows: EffectRow[] = entry
              ? matchingEffectRows(entry, criteria)
              : [];
            const isExpanded = expanded.has(servant.slug);
            return (
              <div
                key={servant.slug}
                className={`rounded-lg border transition-all ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center gap-3 p-3">
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
                    <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                      <p className={`text-sm font-medium truncate ${colors.text}`}>
                        {servant.name}
                      </p>
                      {entry && (
                        <span
                          className="text-xs text-yellow-500"
                          aria-label={`Rarity ${entry.rarity}`}
                        >
                          ★{entry.rarity}
                        </span>
                      )}
                      {entry && (
                        <span
                          className={`px-1.5 py-0.5 rounded border text-[10px] font-medium ${
                            NP_CARD_STYLES[entry.np.card ?? ""] ??
                            "bg-gray-800 border-gray-700 text-gray-400"
                          }`}
                        >
                          NP{" "}
                          {entry.np.card
                            ? NP_CARD_LABELS[entry.np.card]
                            : "?"}{" "}
                          · {NP_TYPE_LABELS[entry.np.type]}
                        </span>
                      )}
                      {rows.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-[10px] text-gray-300">
                          {rows.length}{" "}
                          {rows.length === 1 ? "match" : "matches"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{servant.className}</p>
                  </div>
                  <button
                    onClick={() => toggleStatus(servant.slug)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${colors.bg} ${colors.border} ${colors.text} hover:opacity-80`}
                  >
                    {STATUS_LABELS[statusValue]}
                  </button>
                  {entry && entry.effects.length > 0 && (
                    <button
                      onClick={() => toggleExpanded(servant.slug)}
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded ? "Hide kit details" : "Show kit details"
                      }
                      className="px-2 py-1 rounded-full text-xs font-medium bg-gray-800 border border-gray-700 text-gray-300 hover:bg-gray-700 transition-all"
                    >
                      {isExpanded ? "▴" : "▾"}
                    </button>
                  )}
                </div>
                {isExpanded && entry && (
                  <div className="border-t border-gray-800 px-3 py-2 space-y-1">
                    {rows.map((row, i) => (
                      <EffectRowLine key={`${row.source}-${row.slot}-${row.target}-${i}`} row={row} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No servants found matching your criteria.
          </div>
        )}
      </main>
    </div>
  );
}

function EffectRowLine({ row }: { row: EffectRow }) {
  const sourceLabel =
    row.source === "skill" ? `Skill ${row.slot}` : `NP${row.slot > 1 ? ` ${row.slot}` : ""}`;
  const title = row.nameEn
    ? `${sourceLabel} — ${row.nameEn}`
    : sourceLabel;
  return (
    <p className="text-xs text-gray-300 flex flex-wrap items-center gap-x-2 gap-y-0.5">
      <span className="font-medium text-gray-400">{title}</span>
      {row.cd != null && (
        <span className="text-gray-500">cd {row.cd}</span>
      )}
      <span className="text-gray-500">·</span>
      <span>{EFFECT_TARGET_LABELS[row.target]}</span>
      <span className="text-gray-500">·</span>
      <span className="text-gray-200">
        {row.cats.map((c) => BUFF_CATEGORY_LABELS[c]).join(", ")}
      </span>
    </p>
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

function FilterGroup({
  label,
  activeValues,
  values,
  onToggle,
  onClear,
}: {
  label: string;
  activeValues: string[];
  values: { key: string; label: string }[];
  onToggle: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-20 sm:w-24 shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      <FilterButton active={activeValues.length === 0} onClick={onClear}>
        All
      </FilterButton>
      {values.map((value) => (
        <FilterButton
          key={value.key}
          active={activeValues.includes(value.key)}
          onClick={() => onToggle(value.key)}
        >
          {value.label}
        </FilterButton>
      ))}
    </div>
  );
}
