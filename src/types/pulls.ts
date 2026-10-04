export type PullGame = "genshin" | "hsr" | "zzz" | "wuwa";

export const PULL_GAMES: PullGame[] = ["genshin", "hsr", "zzz", "wuwa"];

export function isPullGame(slug: string): slug is PullGame {
  return (PULL_GAMES as string[]).includes(slug);
}

export interface GamePull {
  id: string;
  gameId: PullGame;
  itemId: string;
  unitId: string | null;
  name: string;
  rarity: number | null;
  ts: number;
  category: string;
  seq?: number;
  manual?: boolean;
  chipColor?: string;
}

export interface PullMapItem {
  name: string | null;
  rarity: number | null;
  kind: string;
  unit: string | null;
}

export interface PullMap {
  game: PullGame;
  key: "id" | "name-norm";
  source: string;
  generated: string;
  items: Record<string, PullMapItem>;
}

export interface PullWarning {
  itemId: string;
  name: string;
  count: number;
}

export interface ParsedPulls {
  game: PullGame;
  pulls: GamePull[];
  pulledUnitIds: string[];
  total: number;
  warnings: PullWarning[];
}

export type PullSource =
  | { kind: "wuwatracker" }
  | { kind: "stardb"; game: PullGame }
  | null;
