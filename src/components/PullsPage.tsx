"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { getAppBySlug } from "@/lib/apps";
import { categoryLabel } from "@/lib/pullImport";
import {
  attributePull,
  computeRarityStats,
  FOUR_STAR_PITY,
  indexWindows,
  maxPityFor,
  type BannerWindow,
  type RarityStats,
} from "@/lib/pity";
import {
  getPullsServerSnapshot,
  getPullsSnapshot,
  subscribePulls,
} from "@/lib/pullStorage";
import type { GamePull, PullGame } from "@/types/pulls";
import { AppSwitcher } from "./AppSwitcher";
import { GameTabs } from "./GameTabs";
import { ImportPulls } from "./ImportPulls";
import { ThemeToggle } from "./ThemeToggle";

const CATEGORY_ORDER: Record<PullGame, string[]> = {
  hsr: ["departure", "standard", "character", "light_cone"],
  genshin: ["beginner", "standard", "character", "weapon", "chronicled"],
  zzz: ["standard", "character", "w_engine", "bangboo"],
  wuwa: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13"],
};

const PAGE_SIZE = 100;

const RARITY_STYLES: Record<number, string> = {
  5: "text-amber-400",
  4: "text-purple-400",
  3: "text-blue-300",
};

const formatCount = (value: number) => value.toLocaleString("en-US");

const formatPity = (value: number | null) =>
  value === null ? "—" : value.toFixed(1);

function formatWhen(ts: number): { date: string; time: string } {
  const date = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export function PullsPage({
  game,
  windows,
}: {
  game: PullGame;
  windows: BannerWindow[];
}) {
  const app = getAppBySlug(game);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const store = useMemo(
    () => ({
      subscribe: (onChange: () => void) => subscribePulls(game, onChange),
      getSnapshot: () => getPullsSnapshot(game),
      getServerSnapshot: getPullsServerSnapshot,
    }),
    [game]
  );
  const pulls = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const index = useMemo(() => indexWindows(windows), [windows]);

  const categories = useMemo(() => {
    const present = new Set(pulls.map((pull) => pull.category));
    return CATEGORY_ORDER[game].filter((key) => present.has(key));
  }, [pulls, game]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const pull of pulls) {
      counts.set(pull.category, (counts.get(pull.category) ?? 0) + 1);
    }
    return counts;
  }, [pulls]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pulls.filter((pull) => {
      if (category !== "all" && pull.category !== category) return false;
      if (query && !pull.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [pulls, category, search]);

  const rows = useMemo(
    () =>
      filtered
        .slice()
        .sort((a, b) => b.ts - a.ts || a.id.localeCompare(b.id)),
    [filtered]
  );

  const counts = useMemo(() => {
    let five = 0;
    let four = 0;
    for (const pull of pulls) {
      if (pull.rarity === 5) five += 1;
      else if (pull.rarity === 4) four += 1;
    }
    return { total: pulls.length, five, four };
  }, [pulls]);

  const selectedStats = useMemo(() => {
    if (category === "all") return null;
    const cap = maxPityFor(game, category);
    return {
      category,
      label: categoryLabel(game, category),
      five: computeRarityStats(filtered, 5, cap),
      four: computeRarityStats(filtered, 4, FOUR_STAR_PITY),
    };
  }, [filtered, category, game]);

  const pityRows = useMemo(() => {
    if (category !== "all") return [];
    return categories.map((key) => ({
      category: key,
      label: categoryLabel(game, key),
      count: categoryCounts.get(key) ?? 0,
      five: computeRarityStats(
        pulls.filter((pull) => pull.category === key),
        5,
        maxPityFor(game, key)
      ),
    }));
  }, [category, categories, categoryCounts, pulls, game]);

  if (!app) return null;

  const shownRows = rows.slice(0, visible);

  const changeCategory = (value: string) => {
    setCategory(value);
    setVisible(PAGE_SIZE);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-gray-50">
      <header className="border-b border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900/80 dark:bg-gray-900/80 light:bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <AppSwitcher
            title={`${app.name} Pulls`}
            subtitle={`${formatCount(counts.total)} pulls imported`}
          />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <GameTabs game={app.slug} active="pulls" />
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
        <ImportPulls game={game} />

        {counts.total === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-6 space-y-2">
            <p className="text-sm font-medium text-gray-300">
              No pull history imported yet.
            </p>
            <p className="text-sm text-gray-500">
              Import your pull history export file (for example{" "}
              <span className="text-gray-400">stardb-export.json</span> or{" "}
              <span className="text-gray-400">wuwatracker-pulls.json</span>) to
              see pity stats, histogram and banner attribution.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Total pulls" value={formatCount(counts.total)} color="gray" />
              <StatCard label="5★ pulled" value={formatCount(counts.five)} color="gold" />
              <StatCard label="4★ pulled" value={formatCount(counts.four)} color="purple" />
              <StatCard
                label={category === "all" ? "Banners" : "Current 5★ pity"}
                value={
                  category === "all"
                    ? formatCount(categories.length)
                    : selectedStats
                      ? `${selectedStats.five.currentPity} / ${selectedStats.five.cap}`
                      : "—"
                }
                color="blue"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterButton
                active={category === "all"}
                onClick={() => changeCategory("all")}
              >
                All
              </FilterButton>
              {categories.map((key) => (
                <FilterButton
                  key={key}
                  active={category === key}
                  onClick={() => changeCategory(key)}
                >
                  {categoryLabel(game, key)} ({categoryCounts.get(key) ?? 0})
                </FilterButton>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search pulled items…"
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500"
            />

            {selectedStats && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    label="5★ current pity"
                    value={`${selectedStats.five.currentPity} / ${selectedStats.five.cap}`}
                    color="gold"
                  />
                  <StatCard
                    label="5★ average"
                    value={formatPity(selectedStats.five.avgPity)}
                    color="gray"
                  />
                  <StatCard
                    label="5★ max"
                    value={
                      selectedStats.five.maxPity === null
                        ? "—"
                        : String(selectedStats.five.maxPity)
                    }
                    color="gray"
                  />
                  <StatCard
                    label="4★ current pity"
                    value={`${selectedStats.four.currentPity} / ${selectedStats.four.cap}`}
                    color="purple"
                  />
                </div>
                <Histogram stats={selectedStats.five} />
                <p className="text-xs text-gray-500">
                  Pity length of each 5★ in {selectedStats.label} (bars are
                  pulls spent between 5★ drops, up to the {selectedStats.five.cap}{" "}
                  pull guarantee).
                </p>
              </div>
            )}

            {category === "all" && pityRows.length > 0 && (
              <div className="rounded-lg border border-gray-800 overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2 bg-gray-900/70 text-xs uppercase tracking-wider text-gray-500">
                  <span>Banner</span>
                  <span className="text-right">Pulls</span>
                  <span className="text-right">5★</span>
                  <span className="text-right">Avg</span>
                  <span className="text-right">Current</span>
                </div>
                {pityRows.map((row) => (
                  <button
                    key={row.category}
                    onClick={() => changeCategory(row.category)}
                    className="grid w-full grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-4 py-2 border-t border-gray-800 text-sm text-left hover:bg-gray-900/60 transition-colors"
                  >
                    <span className="truncate text-gray-300">{row.label}</span>
                    <span className="text-right text-gray-400">
                      {formatCount(row.count)}
                    </span>
                    <span className="text-right text-amber-400">
                      {row.five.hits}
                    </span>
                    <span className="text-right text-gray-400">
                      {formatPity(row.five.avgPity)}
                    </span>
                    <span className="text-right text-gray-400">
                      {row.five.currentPity} / {row.five.cap}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-500">
              Showing {formatCount(Math.min(visible, rows.length))} of{" "}
              {formatCount(rows.length)} pulls (newest first)
            </p>

            <div className="space-y-2">
              {shownRows.map((pull) => (
                <PullRow key={pull.id} pull={pull} index={index} game={game} />
              ))}
            </div>

            {rows.length > visible && (
              <div className="flex justify-center">
                <button
                  onClick={() => setVisible((count) => count + PAGE_SIZE * 5)}
                  className="px-4 py-2 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors"
                >
                  Show {formatCount(Math.min(PAGE_SIZE * 5, rows.length - visible))} more
                </button>
              </div>
            )}

            {rows.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No pulls match your criteria.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function PullRow({
  pull,
  index,
  game,
}: {
  pull: GamePull;
  index: Map<string, BannerWindow[]>;
  game: PullGame;
}) {
  const when = formatWhen(pull.ts);
  const attribution = attributePull(game, pull, index);
  return (
    <div className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[7.5rem_1fr_auto] gap-x-3 gap-y-1 items-center px-3 py-2 rounded-lg border border-gray-800 bg-gray-900/40">
      <span className="text-xs text-gray-500 tabular-nums" title={when.time}>
        {when.date}
      </span>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-gray-200 truncate">{pull.name}</span>
        {pull.rarity !== null && (
          <span
            className={`text-xs shrink-0 ${RARITY_STYLES[pull.rarity] ?? "text-gray-400"}`}
            aria-label={`${pull.rarity} star`}
          >
            {"★".repeat(pull.rarity)}
          </span>
        )}
      </div>
      <span className="col-span-2 sm:col-span-1 text-xs text-gray-500 truncate sm:text-right">
        {attribution.label}
        {attribution.version ? ` · v${attribution.version}` : ""}
      </span>
    </div>
  );
}

function Histogram({ stats }: { stats: RarityStats }) {
  const bars = stats.histogram.slice(1, stats.cap + 1);
  const peak = Math.max(1, ...bars);
  if (stats.hits === 0) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-4 py-6 text-sm text-gray-500">
        No 5★ pulled in this banner yet.
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 px-4 pt-4 pb-2 space-y-2">
      <div className="flex items-end gap-[2px] h-28" aria-hidden="true">
        {bars.map((count, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t ${count > 0 ? "bg-amber-500/80" : "bg-gray-800"}`}
            style={{ height: `${Math.max(count > 0 ? 4 : 1, (count / peak) * 100)}%` }}
            title={`Pity ${i + 1}: ${count}`}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-gray-600">
        <span>1</span>
        <span>Pity</span>
        <span>{stats.cap}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "gray" | "gold" | "purple" | "blue";
}) {
  const colorMap = {
    gray: "border-gray-700 text-gray-400",
    gold: "border-amber-700 text-amber-400",
    purple: "border-purple-700 text-purple-400",
    blue: "border-blue-700 text-blue-400",
  };
  return (
    <div className={`rounded-lg border p-3 bg-gray-900/50 ${colorMap[color]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold ${colorMap[color].split(" ")[1]}`}>
        {value}
      </p>
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
