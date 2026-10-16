export type EffectSource = "skill" | "np";
export type EffectTarget = "self" | "one" | "all";
export type NpCard = "arts" | "buster" | "quick";
export type NpType = "st" | "aoe" | "support";
export type BuffCategoryKey =
  | "busterUp"
  | "artsUp"
  | "quickUp"
  | "cardAllUp"
  | "npDamageUp"
  | "npGaugeUp"
  | "npPerTurn"
  | "npGainUp"
  | "atkUp"
  | "critUp"
  | "starGenUp"
  | "starAbsorbUp"
  | "specialAtkUp"
  | "defUp"
  | "heal";

export interface EffectRow {
  source: EffectSource;
  slot: number;
  target: EffectTarget;
  cats: BuffCategoryKey[];
  nameEn?: string;
  cd?: number;
}

export interface ServantEffectEntry {
  slug: string;
  dexNo: number;
  rarity: number;
  np: { card: NpCard | null; type: NpType };
  effects: EffectRow[];
}

export type EffectMatchMode = "any" | "all";

export interface EffectFilterCriteria {
  cats: BuffCategoryKey[];
  targets: EffectTarget[];
  npTypes: NpType[];
  mode: EffectMatchMode;
}
