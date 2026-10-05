import {
  indexWindows,
  toBannerWindows,
  type BannerWindow,
} from "@/lib/pity";
import { getGenshinBanners } from "@/lib/genshin-data";
import { getHsrBanners } from "@/lib/hsr-data";
import { getWuwaBanners } from "@/lib/wuwa-data";
import { getZzzBanners } from "@/lib/zzz-data";
import { buildManualPull, normalizeName } from "@/lib/pullImport";
import { PULL_MAPS } from "@/lib/pullMaps";
import { isPullGame, type GamePull, type PullGame } from "@/types/pulls";

export interface LogContext {
  game: PullGame;
  bannerType: string;
  bannerTitle: string;
  bannerStart: string | null;
  bannerEnd: string | null;
  category?: string;
}

export interface MapItemRef {
  itemId: string;
  name: string;
  rarity: number | null;
  unitId: string | null;
}

export interface LogPrompt {
  category: string;
  item: MapItemRef;
  bannerStart: string;
}

const LOG_CATEGORIES: Record<PullGame, Record<string, string>> = {
  genshin: { character: "character", weapon: "weapon" },
  hsr: { character: "character", lightcone: "light_cone" },
  zzz: { agent: "character", wengine: "w_engine" },
  wuwa: { resonator: "1" },
};

export const STANDARD_POOLS: Record<
  PullGame,
  Record<string, readonly string[]>
> = {
  genshin: {
    character: [
      "Diluc",
      "Jean",
      "Mona",
      "Qiqi",
      "Keqing",
      "Tighnari",
      "Dehya",
      "Yumemizuki Mizuki",
    ],
    weapon: [
      "Amos' Bow",
      "Aquila Favonia",
      "Lost Prayer to the Sacred Winds",
      "Primordial Jade Winged-Spear",
      "Skyward Atlas",
      "Skyward Blade",
      "Skyward Harp",
      "Skyward Pride",
      "Skyward Spine",
      "Wolf's Gravestone",
    ],
  },
  hsr: {
    character: ["Himeko", "Welt", "Bronya", "Gepard", "Clara", "Bailu", "Yanqing"],
    light_cone: [
      "Time Waits for No One",
      "Sleep Like the Dead",
      "Moment of Victory",
      "In the Name of the World",
      "But the Battle Isn't Over",
      "Something Irreplaceable",
      "Night on the Milky Way",
    ],
  },
  zzz: {
    character: ["Nekomata", "Koleda", "Lycaon", "Grace", "Rina", "Soldier 11"],
    w_engine: [
      "Steel Cushion",
      "The Brimstone",
      "Hellfire Gears",
      "The Restrained",
      "Fusion Compiler",
      "Weeping Cradle",
    ],
  },
  wuwa: {
    "1": ["Verina", "Jianxin", "Calcharo", "Encore", "Lingyang"],
  },
};

const DAY_MS = 86_400_000;

function dayStartTs(value: string): number | null {
  const ts = Date.parse(`${value}T00:00:00.000Z`);
  return Number.isNaN(ts) ? null : ts;
}

function dayEndTs(value: string | null, start: number): number {
  if (value) {
    const ts = Date.parse(`${value}T23:59:59.999Z`);
    if (!Number.isNaN(ts)) return ts;
  }
  return start + 21 * DAY_MS - 1;
}

export function localNoonTs(dateStr: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!match) return null;
  const ts = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    12,
    0,
    0
  ).getTime();
  return Number.isNaN(ts) ? null : ts;
}

const nameIndexCache = new Map<PullGame, Map<string, MapItemRef[]>>();

function nameIndex(game: PullGame): Map<string, MapItemRef[]> {
  let index = nameIndexCache.get(game);
  if (!index) {
    index = new Map();
    for (const [itemId, item] of Object.entries(PULL_MAPS[game].items)) {
      if (!item.name) continue;
      const key = normalizeName(item.name);
      const list = index.get(key) ?? [];
      list.push({
        itemId,
        name: item.name,
        rarity: item.rarity,
        unitId: item.unit,
      });
      index.set(key, list);
    }
    nameIndexCache.set(game, index);
  }
  return index;
}

export function findMapItemByName(
  game: PullGame,
  name: string
): MapItemRef | null {
  const key = normalizeName(name);
  const index = nameIndex(game);
  const list = index.get(key);
  if (list && list.length > 0) {
    return list.find((entry) => entry.rarity === 5) ?? list[0];
  }
  if (key.length < 4) return null;
  const matches = new Map<string, MapItemRef>();
  for (const [candidate, entries] of index) {
    if (candidate.length < 4) continue;
    if (!candidate.includes(key) && !key.includes(candidate)) continue;
    for (const entry of entries) matches.set(entry.itemId, entry);
  }
  const five = [...matches.values()].filter((entry) => entry.rarity === 5);
  if (five.length === 1) return five[0];
  if (five.length === 0 && matches.size === 1) {
    return [...matches.values()][0] ?? null;
  }
  return null;
}

export function logCategoryFor(ctx: LogContext): string | null {
  if (ctx.category) return ctx.category;
  return LOG_CATEGORIES[ctx.game][ctx.bannerType] ?? null;
}

export function checkLoggable(params: { ctx: LogContext; name: string }): LogPrompt | null {
  const { ctx, name } = params;
  const category = logCategoryFor(ctx);
  if (!category || !ctx.bannerStart) return null;
  if (dayStartTs(ctx.bannerStart) === null) return null;
  const item = findMapItemByName(ctx.game, name);
  if (!item || item.rarity !== 5) return null;
  return { category, item, bannerStart: ctx.bannerStart };
}

export function hasPullInBanner(params: {
  game: PullGame;
  name: string;
  unitId: string | null;
  bannerStart: string | null;
  bannerEnd: string | null;
  pulls: GamePull[];
}): boolean | null {
  const { game, name, unitId, bannerStart, bannerEnd, pulls } = params;
  if (!isPullGame(game) || !bannerStart) return null;
  const start = dayStartTs(bannerStart);
  if (start === null) return null;
  const end = dayEndTs(bannerEnd, start);
  const item = findMapItemByName(game, name);
  const normalizedName = normalizeName(name);
  return pulls.some((pull) => {
    if (pull.ts < start || pull.ts > end) return false;
    if (unitId && pull.unitId) return pull.unitId === unitId;
    if (item && pull.itemId === item.itemId) return true;
    return normalizeName(pull.name) === normalizedName;
  });
}

const BANNER_GETTERS: Record<PullGame, () => ReturnType<typeof toBannerWindows>> =
  {
    genshin: () => toBannerWindows(getGenshinBanners()),
    hsr: () => toBannerWindows(getHsrBanners()),
    zzz: () => toBannerWindows(getZzzBanners()),
    wuwa: () => toBannerWindows(getWuwaBanners()),
  };

const logIndexCache = new Map<
  PullGame,
  Map<string, BannerWindow[]>
>();

export function getLogIndex(
  game: PullGame
): Map<string, BannerWindow[]> {
  let index = logIndexCache.get(game);
  if (!index) {
    index = indexWindows(BANNER_GETTERS[game]());
    logIndexCache.set(game, index);
  }
  return index;
}

export function buildLoggedPull(params: {
  game: PullGame;
  ts: number;
  category: string;
  received: MapItemRef;
  outcome: "win" | "loss" | "guarantee";
  existing: GamePull[];
}): GamePull {
  const pull = buildManualPull({
    game: params.game,
    ts: params.ts,
    category: params.category,
    itemId: params.received.itemId,
    name: params.received.name,
    rarity: 5,
    unitId: params.received.unitId,
    existing: params.existing,
  });
  return { ...pull, fifty: params.outcome };
}
