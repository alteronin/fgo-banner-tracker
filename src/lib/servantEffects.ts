import servantEffects from "@/data/servant-effects.json";
import type {
  BuffCategoryKey,
  EffectFilterCriteria,
  EffectRow,
  EffectTarget,
  NpCard,
  NpType,
  ServantEffectEntry,
} from "@/types/servantEffects";

export const BUFF_CATEGORIES: { key: BuffCategoryKey; label: string }[] = [
  { key: "busterUp", label: "Buster Up" },
  { key: "artsUp", label: "Arts Up" },
  { key: "quickUp", label: "Quick Up" },
  { key: "cardAllUp", label: "All-Card Up" },
  { key: "npDamageUp", label: "NP Strength Up" },
  { key: "npGaugeUp", label: "NP Gauge Up" },
  { key: "npPerTurn", label: "NP Per Turn" },
  { key: "npGainUp", label: "NP Gain Up" },
  { key: "atkUp", label: "Attack Up" },
  { key: "critUp", label: "Crit Up" },
  { key: "starGenUp", label: "Star Gen Up" },
  { key: "starAbsorbUp", label: "Star Absorb Up" },
  { key: "specialAtkUp", label: "Special Attack Up" },
  { key: "defUp", label: "Defense Up" },
  { key: "heal", label: "Heal" },
];

export const BUFF_CATEGORY_LABELS: Record<BuffCategoryKey, string> =
  Object.fromEntries(BUFF_CATEGORIES.map((c) => [c.key, c.label])) as Record<
    BuffCategoryKey,
    string
  >;

export const EFFECT_TARGETS: { key: EffectTarget; label: string }[] = [
  { key: "self", label: "Self" },
  { key: "one", label: "One ally" },
  { key: "all", label: "All allies" },
];

export const EFFECT_TARGET_LABELS: Record<EffectTarget, string> = {
  self: "Self",
  one: "One ally",
  all: "All allies",
};

export const NP_TYPES: { key: NpType; label: string }[] = [
  { key: "st", label: "ST" },
  { key: "aoe", label: "AoE" },
  { key: "support", label: "Support" },
];

export const NP_TYPE_LABELS: Record<NpType, string> = {
  st: "ST",
  aoe: "AoE",
  support: "Support",
};

export const NP_CARD_LABELS: Record<NpCard, string> = {
  arts: "Arts",
  buster: "Buster",
  quick: "Quick",
};

export function getServantEffectEntries(): ServantEffectEntry[] {
  return servantEffects as ServantEffectEntry[];
}

let indexCache: Map<string, ServantEffectEntry> | null = null;

export function getServantEffectIndex(): Map<string, ServantEffectEntry> {
  if (!indexCache) {
    indexCache = new Map(
      (servantEffects as ServantEffectEntry[]).map((e) => [e.slug, e])
    );
  }
  return indexCache;
}

function rowPassesTarget(row: EffectRow, targets: EffectTarget[]): boolean {
  return targets.length === 0 || targets.includes(row.target);
}

function rowCats(row: EffectRow, cats: BuffCategoryKey[]): BuffCategoryKey[] {
  if (cats.length === 0) return row.cats;
  return row.cats.filter((c) => cats.includes(c));
}

export function matchingEffectRows(
  entry: ServantEffectEntry,
  criteria: EffectFilterCriteria
): EffectRow[] {
  const { cats, targets, npTypes } = criteria;
  if (npTypes.length > 0 && !npTypes.includes(entry.np.type)) return [];
  return entry.effects.filter(
    (row) => rowPassesTarget(row, targets) && rowCats(row, cats).length > 0
  );
}

export function matchesEffectFilters(
  entry: ServantEffectEntry,
  criteria: EffectFilterCriteria
): boolean {
  const { cats, targets, npTypes, mode } = criteria;
  if (npTypes.length > 0 && !npTypes.includes(entry.np.type)) return false;
  if (cats.length === 0 && targets.length === 0) return true;

  const rows = entry.effects.filter((row) => rowPassesTarget(row, targets));
  if (cats.length === 0) return rows.length > 0;
  if (mode === "any") {
    return rows.some((row) => rowCats(row, cats).length > 0);
  }
  const covered = new Set<BuffCategoryKey>();
  for (const row of rows) {
    for (const cat of rowCats(row, cats)) covered.add(cat);
  }
  return cats.every((cat) => covered.has(cat));
}

export function countMatchingCats(
  row: EffectRow,
  cats: BuffCategoryKey[]
): number {
  return rowCats(row, cats).length;
}
