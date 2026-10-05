import { categoryLabel, normalizeName } from "@/lib/pullImport";
import { comparePullOrder } from "@/lib/pullOrder";
import type { GamePull, PullGame } from "@/types/pulls";

export const FOUR_STAR_PITY = 10;

const MAX_PITY: Record<PullGame, Record<string, number>> = {
  hsr: {
    departure: 50,
    standard: 90,
    character: 90,
    light_cone: 80,
  },
  genshin: {
    beginner: 90,
    standard: 90,
    character: 90,
    weapon: 80,
    chronicled: 90,
  },
  zzz: {
    standard: 90,
    character: 90,
    w_engine: 80,
    bangboo: 80,
  },
  wuwa: {
    1: 80,
    2: 80,
    3: 80,
    4: 80,
    5: 50,
    6: 80,
    7: 80,
    8: 80,
    9: 80,
    10: 80,
    11: 80,
    12: 80,
    13: 80,
  } as Record<string, number>,
};

const DEFAULT_MAX_PITY: Record<PullGame, number> = {
  hsr: 90,
  genshin: 90,
  zzz: 90,
  wuwa: 80,
};

export function maxPityFor(game: PullGame, category: string): number {
  return MAX_PITY[game][category] ?? DEFAULT_MAX_PITY[game];
}

export interface RarityStats {
  rarity: number;
  cap: number;
  total: number;
  hits: number;
  avgPity: number | null;
  maxPity: number | null;
  currentPity: number;
  histogram: number[];
}

export function computeRarityStats(
  pulls: GamePull[],
  rarity: number,
  cap: number
): RarityStats {
  const sorted = pulls.slice().sort(comparePullOrder);
  const pityValues: number[] = [];
  let since = 0;
  for (const pull of sorted) {
    since += 1;
    if (pull.rarity !== null && pull.rarity >= rarity) {
      pityValues.push(since);
      since = 0;
    }
  }

  const size = Math.max(cap, ...pityValues, 1) + 1;
  const histogram = new Array<number>(size).fill(0);
  let maxPity = 0;
  let sum = 0;
  for (const pity of pityValues) {
    histogram[pity] += 1;
    sum += pity;
    if (pity > maxPity) maxPity = pity;
  }

  return {
    rarity,
    cap,
    total: sorted.length,
    hits: pityValues.length,
    avgPity: pityValues.length ? sum / pityValues.length : null,
    maxPity: pityValues.length ? maxPity : null,
    currentPity: since,
    histogram,
  };
}

export function pityByDrop(
  pulls: GamePull[],
  rarity: number
): Map<string, number> {
  const byCategory = new Map<string, GamePull[]>();
  for (const pull of pulls) {
    const list = byCategory.get(pull.category);
    if (list) list.push(pull);
    else byCategory.set(pull.category, [pull]);
  }

  const drops = new Map<string, number>();
  for (const list of byCategory.values()) {
    const sorted = list.slice().sort(comparePullOrder);
    let since = 0;
    for (const pull of sorted) {
      since += 1;
      if (pull.rarity !== null && pull.rarity >= rarity) {
        drops.set(pull.id, since);
        since = 0;
      }
    }
  }
  return drops;
}

export interface BannerLike {
  id: string;
  type: string;
  banners: { name: string }[];
  startDate: string | null;
  endDate: string | null;
  version?: string | null;
  phase?: number | null;
  featured5?: { name: string }[] | null;
  featuredWeapons?: { name: string }[] | null;
}

export interface BannerWindow {
  id: string;
  type: string;
  title: string;
  version: string | null;
  phase: number | null;
  start: number;
  end: number;
  featured5: string[];
  featuredWeapons: string[];
}

const CATEGORY_BANNER_TYPES: Record<PullGame, Record<string, string>> = {
  hsr: {
    character: "character",
    light_cone: "lightcone",
  },
  genshin: {
    character: "character",
    weapon: "weapon",
    chronicled: "chronicled",
  },
  zzz: {
    character: "agent",
    w_engine: "wengine",
  },
  wuwa: {
    "1": "resonator",
    "8": "resonator",
    "10": "resonator",
    "12": "resonator",
    "2": "weapon",
    "9": "weapon",
    "11": "weapon",
    "13": "weapon",
    "7": "selector",
  },
};

function parseDay(value: string | null, endOfDay: boolean): number | null {
  if (!value) return null;
  const ts = Date.parse(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}Z`);
  return Number.isNaN(ts) ? null : ts;
}

export function toBannerWindow(banner: BannerLike): BannerWindow | null {
  const start = parseDay(banner.startDate, false);
  const end = parseDay(banner.endDate, true);
  if (start === null || end === null) return null;
  const title = banner.banners.map((entry) => entry.name).filter(Boolean).join(" / ");
  return {
    id: banner.id,
    type: banner.type,
    title: title || banner.id,
    version: banner.version ?? null,
    phase: banner.phase ?? null,
    start,
    end,
    featured5: (banner.featured5 ?? []).map((entry) => entry.name).filter(Boolean),
    featuredWeapons: (banner.featuredWeapons ?? []).map((entry) => entry.name).filter(Boolean),
  };
}

export function toBannerWindows(banners: BannerLike[]): BannerWindow[] {
  const windows: BannerWindow[] = [];
  for (const banner of banners) {
    const window = toBannerWindow(banner);
    if (window) windows.push(window);
  }
  return windows;
}

export function indexWindows(windows: BannerWindow[]): Map<string, BannerWindow[]> {
  const index = new Map<string, BannerWindow[]>();
  for (const window of windows) {
    const list = index.get(window.type);
    if (list) list.push(window);
    else index.set(window.type, [window]);
  }
  for (const list of index.values()) {
    list.sort((a, b) => a.start - b.start);
  }
  return index;
}

export function findBannerWindow(
  index: Map<string, BannerWindow[]>,
  type: string,
  ts: number
): BannerWindow | null {
  const list = index.get(type);
  if (!list) return null;
  let match: BannerWindow | null = null;
  for (const window of list) {
    if (ts < window.start || ts > window.end) continue;
    if (!match || window.start >= match.start) match = window;
  }
  return match;
}

export interface PullAttribution {
  label: string;
  bannerId: string | null;
  version: string | null;
}

export function attributePull(
  game: PullGame,
  pull: GamePull,
  index: Map<string, BannerWindow[]>
): PullAttribution {
  const type = CATEGORY_BANNER_TYPES[game][pull.category];
  if (type) {
    const window = findBannerWindow(index, type, pull.ts);
    if (window) {
      return { label: window.title, bannerId: window.id, version: window.version };
    }
  }
  return { label: categoryLabel(game, pull.category), bannerId: null, version: null };
}

export type PityTone = "early" | "mid" | "late" | "hard";

export function pityTone(pity: number, cap: number): PityTone {
  const ratio = cap > 0 ? pity / cap : 0;
  if (pity >= cap || ratio >= 0.9) return "hard";
  if (ratio >= 2 / 3) return "late";
  if (ratio >= 1 / 3) return "mid";
  return "early";
}

const RATEUP_WINDOW_TYPES: Record<PullGame, Record<string, string[]>> = {
  hsr: { character: ["character"], light_cone: ["lightcone"] },
  genshin: { character: ["character"], weapon: ["weapon"] },
  zzz: { character: ["agent"], w_engine: ["wengine"] },
  wuwa: { "1": ["resonator"], "2": ["resonator"] },
};

export type FiftyFiftyResult = "win" | "loss" | "guarantee";

export function fiftyFiftyResult(
  game: PullGame,
  pull: GamePull,
  index: Map<string, BannerWindow[]>,
  guaranteed = false
): FiftyFiftyResult | null {
  if (pull.rarity !== 5) return null;
  const types = RATEUP_WINDOW_TYPES[game]?.[pull.category];
  if (!types) return null;
  let window: BannerWindow | null = null;
  for (const type of types) {
    const match = findBannerWindow(index, type, pull.ts);
    if (match && (!window || match.start >= window.start)) window = match;
  }
  if (!window) return null;
  const featured = [...window.featured5, ...window.featuredWeapons];
  if (featured.length === 0) return null;
  const name = normalizeName(pull.name);
  if (!name) return null;
  const win = featured.some((entry) => {
    const featuredName = normalizeName(entry);
    if (!featuredName) return false;
    return (
      featuredName === name ||
      featuredName.includes(name) ||
      name.includes(featuredName)
    );
  });
  if (!win) return "loss";
  return guaranteed ? "guarantee" : "win";
}

export function fiftyFiftyResults(
  game: PullGame,
  pulls: GamePull[],
  index: Map<string, BannerWindow[]>
): Map<string, FiftyFiftyResult> {
  const sorted = pulls.slice().sort(comparePullOrder);
  const pending = new Set<string>();
  const results = new Map<string, FiftyFiftyResult>();
  for (const pull of sorted) {
    const declared =
      pull.manual && pull.fifty ? pull.fifty : null;
    const result =
      declared ??
      fiftyFiftyResult(game, pull, index, pending.has(pull.category));
    if (!result) continue;
    results.set(pull.id, result);
    if (result === "loss") pending.add(pull.category);
    else pending.delete(pull.category);
  }
  return results;
}

export function guaranteePendingAt(
  game: PullGame,
  pulls: GamePull[],
  index: Map<string, BannerWindow[]>,
  category: string,
  ts: number
): boolean {
  const results = fiftyFiftyResults(game, pulls, index);
  const chain = pulls
    .filter((pull) => pull.category === category)
    .slice()
    .sort(comparePullOrder);
  let pending = false;
  for (const pull of chain) {
    if (pull.ts > ts) break;
    const result = results.get(pull.id);
    if (!result) continue;
    pending = result === "loss";
  }
  return pending;
}

export type ManualPullIssue =
  | { kind: "future" }
  | { kind: "not-oldest"; oldestTs: number }
  | { kind: "pity5-cap"; cap: number }
  | { kind: "pity4-cap" }
  | { kind: "consecutive-loss" };

function pityCapViolations(
  game: PullGame,
  pulls: GamePull[],
  rarity: number
): Map<string, number> {
  const byCategory = new Map<string, GamePull[]>();
  for (const pull of pulls) {
    const list = byCategory.get(pull.category);
    if (list) list.push(pull);
    else byCategory.set(pull.category, [pull]);
  }
  const violations = new Map<string, number>();
  for (const [category, list] of byCategory) {
    const cap = rarity === 5 ? maxPityFor(game, category) : FOUR_STAR_PITY;
    const sorted = list.slice().sort(comparePullOrder);
    let since = 0;
    for (const pull of sorted) {
      since += 1;
      if (pull.rarity !== null && pull.rarity >= rarity) {
        if (since > cap) violations.set(pull.id, cap);
        since = 0;
      }
    }
  }
  return violations;
}

export function validateManualPull(
  game: PullGame,
  draft: GamePull,
  others: GamePull[],
  index: Map<string, BannerWindow[]>,
  options?: { allowAfterOldest?: boolean }
): ManualPullIssue | null {
  if (draft.ts > Date.now()) return { kind: "future" };

  let oldest: number | null = null;
  for (const pull of others) {
    if (pull.manual) continue;
    if (oldest === null || pull.ts < oldest) oldest = pull.ts;
  }
  if (!options?.allowAfterOldest && oldest !== null && draft.ts >= oldest) {
    return { kind: "not-oldest", oldestTs: oldest };
  }

  const hypothetical = [...others, draft];

  const before5 = pityCapViolations(game, others, 5);
  for (const [id, cap] of pityCapViolations(game, hypothetical, 5)) {
    if (!before5.has(id)) return { kind: "pity5-cap", cap };
  }

  const before4 = pityCapViolations(game, others, 4);
  for (const id of pityCapViolations(game, hypothetical, 4).keys()) {
    if (!before4.has(id)) return { kind: "pity4-cap" };
  }

  const results = fiftyFiftyResults(game, hypothetical, index);
  if (results.get(draft.id) !== "loss") return null;
  const chain = hypothetical
    .filter((pull) => pull.category === draft.category)
    .sort(comparePullOrder);
  const at = chain.findIndex((pull) => pull.id === draft.id);
  const nearest = (step: number): FiftyFiftyResult | undefined => {
    for (let i = at + step; i >= 0 && i < chain.length; i += step) {
      const result = results.get(chain[i].id);
      if (result !== undefined) return result;
    }
    return undefined;
  };
  if (nearest(-1) === "loss" || nearest(1) === "loss") {
    return { kind: "consecutive-loss" };
  }
  return null;
}
