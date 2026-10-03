import { comparePullOrder } from "@/lib/pullOrder";
import type { GamePull, PullGame } from "@/types/pulls";

export function pullsStorageKey(game: string): string {
  return `pulls:${game}`;
}

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function isGamePull(value: unknown): value is GamePull {
  if (typeof value !== "object" || value === null) return false;
  const pull = value as Partial<GamePull>;
  return (
    typeof pull.id === "string" &&
    typeof pull.itemId === "string" &&
    typeof pull.name === "string" &&
    typeof pull.ts === "number" &&
    typeof pull.category === "string"
  );
}

export function toPulls(value: unknown): GamePull[] {
  if (!Array.isArray(value)) return [];
  return sortPulls(value.filter(isGamePull));
}

export function getPullsRaw(game: string): string | null {
  return readRaw(pullsStorageKey(game));
}

export function getPulls(game: PullGame): GamePull[] {
  const raw = getPullsRaw(game);
  if (!raw) return [];
  try {
    return toPulls(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function sortPulls(pulls: GamePull[]): GamePull[] {
  return pulls.slice().sort(comparePullOrder);
}

export function setPulls(game: PullGame, pulls: GamePull[]): boolean {
  if (typeof window === "undefined") return false;
  const key = pullsStorageKey(game);
  try {
    if (pulls.length === 0) {
      localStorage.removeItem(key);
      return true;
    }
    localStorage.setItem(key, JSON.stringify(sortPulls(pulls)));
    return true;
  } catch {
    return false;
  }
}

export function mergePulls(
  game: PullGame,
  incoming: GamePull[]
): { added: number; upgraded: number; total: number; ok: boolean } {
  const existing = getPulls(game);
  const positions = new Map<string, number>();
  existing.forEach((pull, i) => positions.set(pull.id, i));
  let added = 0;
  let upgraded = 0;
  for (const pull of incoming) {
    const position = positions.get(pull.id);
    if (position !== undefined) {
      const current = existing[position];
      if (current.seq === undefined && pull.seq !== undefined) {
        existing[position] = pull;
        upgraded += 1;
      }
      continue;
    }
    positions.set(pull.id, existing.length);
    existing.push(pull);
    added += 1;
  }
  const ok = added + upgraded === 0 ? true : setPulls(game, existing);
  return { added, upgraded, total: existing.length, ok };
}

export function clearPulls(game: PullGame): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(pullsStorageKey(game));
  } catch {
    // ignore
  }
}

const EMPTY_PULLS: GamePull[] = [];

interface Cache<T> {
  raw: string | null | undefined;
  value: T;
}

const pullListeners = new Map<string, Set<() => void>>();
const pullCaches = new Map<string, Cache<GamePull[]>>();

function listenerSet(game: string): Set<() => void> {
  let set = pullListeners.get(game);
  if (!set) {
    set = new Set();
    pullListeners.set(game, set);
  }
  return set;
}

export function subscribePulls(
  game: string,
  onChange: () => void
): () => void {
  const listeners = listenerSet(game);
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getPullsSnapshot(game: PullGame): GamePull[] {
  const raw = getPullsRaw(game);
  let cache = pullCaches.get(game);
  if (!cache || cache.raw !== raw) {
    cache = { raw, value: getPulls(game) };
    pullCaches.set(game, cache);
  }
  return cache.value;
}

export function getPullsServerSnapshot(): GamePull[] {
  return EMPTY_PULLS;
}

export function notifyPullsChange(game: string): void {
  pullListeners.get(game)?.forEach((listener) => listener());
}
