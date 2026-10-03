import { categoryLabel } from "@/lib/pullImport";
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
  const sorted = pulls.slice().sort((a, b) => a.ts - b.ts || a.id.localeCompare(b.id));
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

export interface BannerLike {
  id: string;
  type: string;
  banners: { name: string }[];
  startDate: string | null;
  endDate: string | null;
  version?: string | null;
  phase?: number | null;
}

export interface BannerWindow {
  id: string;
  type: string;
  title: string;
  version: string | null;
  phase: number | null;
  start: number;
  end: number;
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
