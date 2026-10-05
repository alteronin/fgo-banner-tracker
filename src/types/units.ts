export type UnitStatus = "none" | "owned" | "planning";

export type UnitGame =
  | "genshin"
  | "hsr"
  | "zzz"
  | "wuwa"
  | "hi3"
  | "shadowverse";

export interface GenshinUnit {
  id: string;
  name: string;
  imageUrl: string;
  url: string;
  rarity: string;
  element: string | null;
  weapon: string;
  type: "character" | "weapon";
}

export interface HsrUnit {
  id: string;
  name: string;
  imageUrl: string;
  url: string;
  rarity: string;
  path: string;
  element: string | null;
  type: "character" | "light-cone";
}

export interface ZzzUnit {
  id: string;
  name: string;
  imageUrl: string;
  url: string;
  rarity: string;
  attribute: string;
  specialty: string;
}

export interface WuwaUnit {
  id: string;
  name: string;
  imageUrl: string;
  url: string;
  rarity: string;
  element: string | null;
  weapon: string;
  type: "resonator" | "weapon";
}

export interface Hi3Unit {
  id: string;
  name: string;
  imageUrl: string;
  url: string;
  character: string;
  rank: string;
  type: string;
  weapon: string;
  dmgType: string | null;
  version: string | null;
}

export interface ShadowverseUnit {
  id: string;
  name: string;
  imageUrl: string;
  url: string;
  className: string;
  obtain: string;
}

export interface UnitRow {
  id: string;
  name: string;
  imageUrl: string;
  url: string;
  category: string;
  subtitle: string;
  sortRarity: number;
  filters: Record<string, string | null>;
}

export interface UnitFilterGroup {
  key: string;
  label: string;
  values: string[];
}

export interface UnitsConfig {
  game: UnitGame;
  noun: string;
  searchPlaceholder: string;
  categoryLabel: string;
  rarityLabel: string | null;
  filterGroups: UnitFilterGroup[];
}
