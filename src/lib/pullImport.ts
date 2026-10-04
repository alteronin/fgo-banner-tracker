import { comparePullOrder } from "@/lib/pullOrder";
import {
  PULL_GAMES,
  type GamePull,
  type ParsedPulls,
  type PullGame,
  type PullMap,
  type PullSource,
  type PullWarning,
} from "@/types/pulls";

const STARDB_GAME_KEYS: Record<PullGame, string> = {
  genshin: "gi",
  hsr: "hsr",
  zzz: "zzz",
  wuwa: "wuwa",
};

const STARDB_PULL_FIELDS: Record<PullGame, string> = {
  genshin: "wishes",
  hsr: "warps",
  zzz: "signals",
  wuwa: "pulls",
};

const WUWA_BANNER_LABELS: Record<number, string> = {
  1: "Featured Resonator",
  2: "Featured Weapon",
  3: "Permanent Resonator",
  4: "Permanent Weapon",
  5: "Novice Convene",
  6: "Beginner's Choice Convene",
  7: "Giveback Event Convene",
  8: "New Voyage Resonator",
  9: "New Voyage Weapon",
  10: "Collab Resonator",
  11: "Collab Weapon",
  12: "Reverb Resonator",
  13: "Reverb Weapon",
};

const CATEGORY_LABELS: Record<PullGame, Record<string, string>> = {
  hsr: {
    departure: "Departure Warp",
    standard: "Stellar Warp",
    character: "Character Event Warp",
    light_cone: "Light Cone Event Warp",
  },
  genshin: {
    beginner: "Beginner's Wish",
    standard: "Standard Wish",
    character: "Character Event Wish",
    weapon: "Weapon Event Wish",
    chronicled: "Chronicled Wish",
  },
  zzz: {
    standard: "Stable Channel",
    character: "Exclusive Channel",
    w_engine: "W-Engine Channel",
    bangboo: "Bangboo Channel",
  },
  wuwa: {},
};

export function normalizeName(value: unknown): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

export function categoryLabel(game: PullGame, category: string): string {
  if (game === "wuwa") {
    const pool = Number(category);
    return WUWA_BANNER_LABELS[pool] ?? `Pool ${category}`;
  }
  return CATEGORY_LABELS[game][category] ?? category;
}

export function detectPullSource(data: unknown, game?: PullGame): PullSource {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;

  if (Array.isArray(record.pulls)) {
    const first: unknown = record.pulls[0];
    if (
      typeof first === "object" &&
      first !== null &&
      "cardPoolType" in first &&
      "name" in first
    ) {
      if (!game || game === "wuwa") return { kind: "wuwatracker" };
      return null;
    }
  }

  const user = record.user;
  if (typeof user === "object" && user !== null) {
    const accounts = user as Record<string, unknown>;
    if (game) {
      const entry = accounts[STARDB_GAME_KEYS[game]];
      if (
        typeof entry === "object" &&
        entry !== null &&
        Array.isArray((entry as Record<string, unknown>).uids)
      ) {
        return { kind: "stardb", game };
      }
      return null;
    }
    for (const candidate of PULL_GAMES) {
      const entry = accounts[STARDB_GAME_KEYS[candidate]];
      if (typeof entry !== "object" || entry === null) continue;
      const uids = (entry as Record<string, unknown>).uids;
      if (Array.isArray(uids)) return { kind: "stardb", game: candidate };
    }
  }

  return null;
}

function resolveItem(
  map: PullMap,
  itemId: string,
  fallback: { name: string; rarity: number | null }
): { name: string; rarity: number | null; unitId: string | null; resolved: boolean } {
  const entry = map.items[itemId];
  return {
    name: entry?.name ?? fallback.name,
    rarity: entry?.rarity ?? fallback.rarity,
    unitId: entry?.unit ?? null,
    resolved: entry !== undefined && entry.name !== null,
  };
}

function finalize(
  game: PullGame,
  pulls: GamePull[],
  total: number,
  warnings: PullWarning[]
): ParsedPulls {
  pulls.sort(comparePullOrder);
  const unitIds = new Set<string>();
  for (const pull of pulls) {
    if (pull.unitId) unitIds.add(pull.unitId);
  }
  warnings.sort((a, b) => b.count - a.count || a.itemId.localeCompare(b.itemId));
  return {
    game,
    pulls,
    pulledUnitIds: [...unitIds],
    total,
    warnings,
  };
}

export function parseWuwaPulls(data: unknown, map: PullMap): ParsedPulls | null {
  if (typeof data !== "object" || data === null) return null;
  const records = (data as Record<string, unknown>).pulls;
  if (!Array.isArray(records)) return null;

  const seen = new Map<string, number>();
  const unresolved = new Map<string, PullWarning>();
  const pulls: GamePull[] = [];

  for (let index = 0; index < records.length; index++) {
    const raw = records[index];
    if (typeof raw !== "object" || raw === null) continue;
    const record = raw as Record<string, unknown>;
    const name = typeof record.name === "string" ? record.name : "";
    const ts = Date.parse(String(record.time ?? ""));
    if (!name || Number.isNaN(ts)) continue;

    const category = String(record.cardPoolType ?? "");
    const itemId = normalizeName(name);
    const occurrence = seen.get(`${ts}|${category}|${itemId}`) ?? 0;
    seen.set(`${ts}|${category}|${itemId}`, occurrence + 1);

    const quality = typeof record.qualityLevel === "number" ? record.qualityLevel : null;
    const resolved = resolveItem(map, itemId, { name, rarity: quality });
    if (!resolved.resolved) {
      const warning = unresolved.get(itemId) ?? { itemId, name, count: 0 };
      warning.count += 1;
      unresolved.set(itemId, warning);
    }

    pulls.push({
      id: `${ts}|${category}|${itemId}|${occurrence}`,
      gameId: "wuwa",
      itemId,
      unitId: resolved.unitId,
      name: resolved.name,
      rarity: resolved.rarity,
      ts,
      category,
      seq: index,
    });
  }

  return finalize("wuwa", pulls, records.length, [...unresolved.values()]);
}

export function parseStardbPulls(
  data: unknown,
  game: PullGame,
  map: PullMap
): ParsedPulls | null {
  if (game === "wuwa") return null;
  if (typeof data !== "object" || data === null) return null;

  const user = (data as Record<string, unknown>).user;
  if (typeof user !== "object" || user === null) return null;
  const account = (user as Record<string, unknown>)[STARDB_GAME_KEYS[game]];
  if (typeof account !== "object" || account === null) return null;
  const uids = (account as Record<string, unknown>).uids;
  if (!Array.isArray(uids) || uids.length === 0) return null;

  const uidRecord = uids[0];
  if (typeof uidRecord !== "object" || uidRecord === null) return null;
  const buckets = (uidRecord as Record<string, unknown>)[STARDB_PULL_FIELDS[game]];
  if (typeof buckets !== "object" || buckets === null) return null;

  const seen = new Map<string, number>();
  const unresolved = new Map<string, PullWarning>();
  const pulls: GamePull[] = [];
  let total = 0;

  for (const [category, rawList] of Object.entries(buckets)) {
    if (!Array.isArray(rawList)) continue;
    for (let index = 0; index < rawList.length; index++) {
      const raw = rawList[index];
      if (typeof raw !== "object" || raw === null) continue;
      const record = raw as Record<string, unknown>;
      const ts = Date.parse(String(record.timestamp ?? ""));
      if (Number.isNaN(ts)) continue;
      const itemId = String(record.item_id ?? "");
      if (!itemId) continue;
      total += 1;

      const base = `${ts}|${category}|${itemId}`;
      const occurrence = seen.get(base) ?? 0;
      seen.set(base, occurrence + 1);

      const resolved = resolveItem(map, itemId, { name: `Item ${itemId}`, rarity: null });
      if (!resolved.resolved) {
        const warning = unresolved.get(itemId) ?? { itemId, name: "", count: 0 };
        warning.count += 1;
        unresolved.set(itemId, warning);
      }

      pulls.push({
        id: `${base}|${occurrence}`,
        gameId: game,
        itemId,
        unitId: resolved.unitId,
        name: resolved.name,
        rarity: resolved.rarity,
        ts,
        category,
        seq: index,
      });
    }
  }

  return finalize(game, pulls, total, [...unresolved.values()]);
}

export function parsePullFile(
  data: unknown,
  maps: Record<PullGame, PullMap>,
  game?: PullGame
): ParsedPulls | null {
  const source = detectPullSource(data, game);
  if (!source) return null;
  if (source.kind === "wuwatracker") return parseWuwaPulls(data, maps.wuwa);
  return parseStardbPulls(data, source.game, maps[source.game]);
}
