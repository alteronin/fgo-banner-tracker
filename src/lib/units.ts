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
  UnitFilterGroup,
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

interface TaxonomySpec<T> {
  key: string;
  label: string;
  order: string[];
  get: (unit: T) => string | null;
}

const GENSHIN_TAXONOMY: TaxonomySpec<GenshinUnit>[] = [
  {
    key: "element",
    label: "Element",
    order: ["Pyro", "Hydro", "Anemo", "Electro", "Dendro", "Cryo", "Geo"],
    get: (u) => u.element,
  },
  {
    key: "weapon",
    label: "Weapon",
    order: ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"],
    get: (u) => u.weapon,
  },
];

const HSR_TAXONOMY: TaxonomySpec<HsrUnit>[] = [
  {
    key: "element",
    label: "Element",
    order: ["Fire", "Ice", "Lightning", "Wind", "Physical", "Quantum", "Imaginary"],
    get: (u) => u.element ?? null,
  },
  {
    key: "path",
    label: "Path",
    order: [
      "The Destruction",
      "The Hunt",
      "The Erudition",
      "The Nihility",
      "The Harmony",
      "The Abundance",
      "The Preservation",
      "The Remembrance",
      "The Elation",
    ],
    get: (u) => u.path,
  },
  {
    key: "type",
    label: "Type",
    order: ["Character", "Light Cone"],
    get: (u) => (u.type === "character" ? "Character" : "Light Cone"),
  },
];

const ZZZ_TAXONOMY: TaxonomySpec<ZzzUnit>[] = [
  {
    key: "attribute",
    label: "Attribute",
    order: ["Fire", "Ice", "Electric", "Ether", "Physical", "Wind", "Lumiflux"],
    get: (u) => u.attribute,
  },
  {
    key: "specialty",
    label: "Specialty",
    order: ["Attack", "Stun", "Anomaly", "Support", "Defense", "Rupture", "Armorer"],
    get: (u) => u.specialty,
  },
];

const WUWA_TAXONOMY: TaxonomySpec<WuwaUnit>[] = [
  {
    key: "element",
    label: "Element",
    order: ["Aero", "Fusion", "Glacio", "Electro", "Havoc", "Spectro"],
    get: (u) => u.element,
  },
  {
    key: "weapon",
    label: "Weapon",
    order: ["Sword", "Broadblade", "Gauntlet", "Pistol", "Rectifier"],
    get: (u) => u.weapon,
  },
];

const HI3_TAXONOMY: TaxonomySpec<Hi3Unit>[] = [
  {
    key: "type",
    label: "Type",
    order: ["MECH", "PSY", "BIO", "IMG", "QUA", "SD"],
    get: (u) => u.type,
  },
  {
    key: "dmg",
    label: "Damage",
    order: ["Physical", "Lightning", "Fire", "Ice"],
    get: (u) => u.dmgType,
  },
];

const SV_TAXONOMY: TaxonomySpec<ShadowverseUnit>[] = [
  {
    key: "class",
    label: "Class",
    order: [
      "Swordcraft",
      "Forestcraft",
      "Dragoncraft",
      "Havencraft",
      "Runecraft",
      "Portalcraft",
      "Abysscraft",
    ],
    get: (u) => u.className,
  },
];

function filtersFor<T>(specs: TaxonomySpec<T>[], unit: T): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const spec of specs) out[spec.key] = spec.get(unit);
  return out;
}

function buildGroups<T>(specs: TaxonomySpec<T>[], units: T[]): UnitFilterGroup[] {
  return specs.map((spec) => {
    const present = new Set<string>();
    for (const unit of units) {
      const value = spec.get(unit);
      if (value != null && value !== "") present.add(value);
    }
    const values = [...present].sort((a, b) => {
      const ia = spec.order.indexOf(a);
      const ib = spec.order.indexOf(b);
      const na = ia === -1 ? spec.order.length : ia;
      const nb = ib === -1 ? spec.order.length : ib;
      return na !== nb ? na - nb : a.localeCompare(b);
    });
    return { key: spec.key, label: spec.label, values };
  });
}

export function matchesFilterGroups(
  filters: Record<string, string | null>,
  selected: Record<string, string[]>
): boolean {
  for (const [key, values] of Object.entries(selected)) {
    if (!values || values.length === 0) continue;
    const value = filters[key];
    if (value == null || !values.includes(value)) return false;
  }
  return true;
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

function toRow(
  unit: {
    id: string;
    name: string;
    imageUrl: string;
    url: string;
  },
  category: string,
  subtitle: string,
  sortRarity: number,
  filters: Record<string, string | null>
): UnitRow {
  return {
    id: unit.id,
    name: unit.name,
    imageUrl: unit.imageUrl,
    url: unit.url,
    category,
    subtitle,
    sortRarity,
    filters,
  };
}

const ROWS: Record<UnitGame, UnitRow[]> = {
  genshin: GENSHIN_UNITS.map((u) =>
    toRow(
      u,
      u.element,
      `${u.element} · ${u.weapon}`,
      rarityNumber(u.rarity),
      filtersFor(GENSHIN_TAXONOMY, u)
    )
  ),
  hsr: HSR_UNITS.map((u) =>
    toRow(
      u,
      u.path,
      u.type === "light-cone"
        ? `Light Cone · ${u.path}`
        : `${u.path} · ${u.element ?? ""}`.replace(/ · $/, ""),
      rarityNumber(u.rarity),
      filtersFor(HSR_TAXONOMY, u)
    )
  ),
  zzz: ZZZ_UNITS.map((u) =>
    toRow(
      u,
      u.attribute,
      `${u.attribute} · ${u.specialty}`,
      zzzRarityScore(u.rarity),
      filtersFor(ZZZ_TAXONOMY, u)
    )
  ),
  wuwa: WUWA_UNITS.map((u) =>
    toRow(
      u,
      u.element,
      `${u.element} · ${u.weapon}`,
      rarityNumber(u.rarity),
      filtersFor(WUWA_TAXONOMY, u)
    )
  ),
  hi3: HI3_UNITS.map((u) =>
    toRow(
      u,
      u.type,
      `${u.type} · ${u.character}`,
      hi3RankScore(u.rank),
      filtersFor(HI3_TAXONOMY, u)
    )
  ),
  shadowverse: SV_UNITS.map((u) =>
    toRow(
      u,
      u.className,
      `${u.className} · ${u.obtain}`,
      0,
      filtersFor(SV_TAXONOMY, u)
    )
  ),
};

const GROUPS: Record<UnitGame, UnitFilterGroup[]> = {
  genshin: buildGroups(GENSHIN_TAXONOMY, GENSHIN_UNITS),
  hsr: buildGroups(HSR_TAXONOMY, HSR_UNITS),
  zzz: buildGroups(ZZZ_TAXONOMY, ZZZ_UNITS),
  wuwa: buildGroups(WUWA_TAXONOMY, WUWA_UNITS),
  hi3: buildGroups(HI3_TAXONOMY, HI3_UNITS),
  shadowverse: buildGroups(SV_TAXONOMY, SV_UNITS),
};

const CONFIGS: Record<UnitGame, UnitsConfig> = {
  genshin: {
    game: "genshin",
    noun: "characters",
    searchPlaceholder: "Search characters...",
    categoryLabel: "Element",
    rarityLabel: "Rarity",
    filterGroups: GROUPS.genshin,
  },
  hsr: {
    game: "hsr",
    noun: "characters and light cones",
    searchPlaceholder: "Search characters or light cones...",
    categoryLabel: "Path",
    rarityLabel: "Rarity",
    filterGroups: GROUPS.hsr,
  },
  zzz: {
    game: "zzz",
    noun: "agents",
    searchPlaceholder: "Search agents...",
    categoryLabel: "Attribute",
    rarityLabel: "Rarity",
    filterGroups: GROUPS.zzz,
  },
  wuwa: {
    game: "wuwa",
    noun: "resonators",
    searchPlaceholder: "Search resonators...",
    categoryLabel: "Element",
    rarityLabel: "Rarity",
    filterGroups: GROUPS.wuwa,
  },
  hi3: {
    game: "hi3",
    noun: "battlesuits",
    searchPlaceholder: "Search battlesuits...",
    categoryLabel: "Type",
    rarityLabel: "Rank",
    filterGroups: GROUPS.hi3,
  },
  shadowverse: {
    game: "shadowverse",
    noun: "leaders",
    searchPlaceholder: "Search leaders...",
    categoryLabel: "Class",
    rarityLabel: null,
    filterGroups: GROUPS.shadowverse,
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
