import genshinUnitsJson from "@/data/genshin-units.json";
import hsrUnitsJson from "@/data/hsr-units.json";
import zzzUnitsJson from "@/data/zzz-units.json";
import wuwaUnitsJson from "@/data/wuwa-units.json";
import hi3UnitsJson from "@/data/hi3-units.json";
import shadowverseUnitsJson from "@/data/shadowverse-units.json";
import type {
  GenshinUnit,
  HsrUnit,
  Hi3Unit,
  ShadowverseUnit,
  UnitGame,
  UnitRow,
  UnitsConfig,
  WuwaUnit,
  ZzzUnit,
} from "@/types/units";

export const UNIT_GAMES: UnitGame[] = [
  "genshin",
  "hsr",
  "zzz",
  "wuwa",
  "hi3",
  "shadowverse",
];

export function isUnitGame(slug: string): slug is UnitGame {
  return (UNIT_GAMES as string[]).includes(slug);
}

const GENSHIN_UNITS = genshinUnitsJson as GenshinUnit[];
const HSR_UNITS = hsrUnitsJson as HsrUnit[];
const ZZZ_UNITS = zzzUnitsJson as ZzzUnit[];
const WUWA_UNITS = wuwaUnitsJson as WuwaUnit[];
const HI3_UNITS = hi3UnitsJson as Hi3Unit[];
const SV_UNITS = shadowverseUnitsJson as ShadowverseUnit[];

function toRow(
  unit: {
    id: string;
    name: string;
    imageUrl: string;
    url: string;
  },
  category: string,
  subtitle: string,
  sortRarity: number
): UnitRow {
  return {
    id: unit.id,
    name: unit.name,
    imageUrl: unit.imageUrl,
    url: unit.url,
    category,
    subtitle,
    sortRarity,
  };
}

function rarityNumber(rarity: string): number {
  return Number(rarity) || 0;
}

function hi3RankScore(rank: string): number {
  if (rank === "S") return 3;
  if (rank === "A") return 2;
  if (rank === "B") return 1;
  return 0;
}

function zzzRarityScore(rarity: string): number {
  if (rarity === "S") return 2;
  if (rarity === "A") return 1;
  return 0;
}

const ROWS: Record<UnitGame, UnitRow[]> = {
  genshin: GENSHIN_UNITS.map((u) =>
    toRow(u, u.element, `${u.element} · ${u.weapon}`, rarityNumber(u.rarity))
  ),
  hsr: HSR_UNITS.map((u) =>
    toRow(
      u,
      u.path,
      u.type === "light-cone"
        ? `Light Cone · ${u.path}`
        : `${u.path} · ${u.element ?? ""}`.replace(/ · $/, ""),
      rarityNumber(u.rarity)
    )
  ),
  zzz: ZZZ_UNITS.map((u) =>
    toRow(u, u.attribute, `${u.attribute} · ${u.specialty}`, zzzRarityScore(u.rarity))
  ),
  wuwa: WUWA_UNITS.map((u) =>
    toRow(u, u.element, `${u.element} · ${u.weapon}`, rarityNumber(u.rarity))
  ),
  hi3: HI3_UNITS.map((u) =>
    toRow(u, u.type, `${u.type} · ${u.character}`, hi3RankScore(u.rank))
  ),
  shadowverse: SV_UNITS.map((u) =>
    toRow(u, u.className, `${u.className} · ${u.obtain}`, 0)
  ),
};

const CONFIGS: Record<UnitGame, UnitsConfig> = {
  genshin: {
    game: "genshin",
    noun: "characters",
    searchPlaceholder: "Search characters...",
    categoryLabel: "Element",
    rarityLabel: "Rarity",
  },
  hsr: {
    game: "hsr",
    noun: "characters and light cones",
    searchPlaceholder: "Search characters or light cones...",
    categoryLabel: "Path",
    rarityLabel: "Rarity",
  },
  zzz: {
    game: "zzz",
    noun: "agents",
    searchPlaceholder: "Search agents...",
    categoryLabel: "Attribute",
    rarityLabel: "Rarity",
  },
  wuwa: {
    game: "wuwa",
    noun: "resonators",
    searchPlaceholder: "Search resonators...",
    categoryLabel: "Element",
    rarityLabel: "Rarity",
  },
  hi3: {
    game: "hi3",
    noun: "battlesuits",
    searchPlaceholder: "Search battlesuits...",
    categoryLabel: "Type",
    rarityLabel: "Rank",
  },
  shadowverse: {
    game: "shadowverse",
    noun: "leaders",
    searchPlaceholder: "Search leaders...",
    categoryLabel: "Class",
    rarityLabel: null,
  },
};

const ROW_INDEX = new Map<UnitGame, Map<string, UnitRow>>(
  UNIT_GAMES.map((game) => [
    game,
    new Map(ROWS[game].map((row) => [row.id, row])),
  ])
);

export function getUnitRows(game: UnitGame): UnitRow[] {
  return ROWS[game];
}

export function getUnitRow(game: UnitGame, id: string): UnitRow | undefined {
  return ROW_INDEX.get(game)?.get(id);
}

export function getUnitsConfig(game: UnitGame): UnitsConfig {
  return CONFIGS[game];
}
