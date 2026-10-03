import type { UnitStatus } from "@/types/units";

export function unitStatusKey(game: string): string {
  return `unit-status:${game}`;
}

export function favesStorageKey(game: string): string {
  return `faves:${game}`;
}

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readObject(key: string): Record<string, string> {
  const raw = readRaw(key);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function getUnitStatuses(game: string): Record<string, UnitStatus> {
  return readObject(unitStatusKey(game)) as Record<string, UnitStatus>;
}

export function getUnitStatusesRaw(game: string): string | null {
  return readRaw(unitStatusKey(game));
}

export function setUnitStatus(
  game: string,
  unitId: string,
  status: UnitStatus
): void {
  if (typeof window === "undefined") return;
  const key = unitStatusKey(game);
  const statuses = readObject(key);
  if (status === "none") {
    delete statuses[unitId];
  } else {
    statuses[unitId] = status;
  }
  if (Object.keys(statuses).length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(statuses));
  }
}

export function getUnitStatus(game: string, unitId: string): UnitStatus {
  return getUnitStatuses(game)[unitId] || "none";
}

export function fillOwnedUnits(game: string, unitIds: string[]): number {
  if (typeof window === "undefined") return 0;
  const statuses = getUnitStatuses(game);
  let filled = 0;
  for (const unitId of unitIds) {
    if (statuses[unitId]) continue;
    statuses[unitId] = "owned";
    filled += 1;
  }
  if (filled > 0) {
    localStorage.setItem(unitStatusKey(game), JSON.stringify(statuses));
  }
  return filled;
}

export function getFaves(game: string): Record<string, string> {
  return readObject(favesStorageKey(game));
}

export function setFave(
  game: string,
  slotId: string,
  unitId: string
): void {
  if (typeof window === "undefined") return;
  const key = favesStorageKey(game);
  const faves = readObject(key);
  if (unitId) {
    faves[slotId] = unitId;
  } else {
    delete faves[slotId];
  }
  if (Object.keys(faves).length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(faves));
  }
}

const EMPTY_STATUSES: Record<string, UnitStatus> = {};
const EMPTY_FAVES: Record<string, string> = {};

interface Cache<T> {
  raw: string | null | undefined;
  value: T;
}

const statusListeners = new Map<string, Set<() => void>>();
const statusCaches = new Map<string, Cache<Record<string, UnitStatus>>>();
const favesListeners = new Map<string, Set<() => void>>();
const favesCaches = new Map<string, Cache<Record<string, string>>>();

function listenerSet(
  registry: Map<string, Set<() => void>>,
  game: string
): Set<() => void> {
  let set = registry.get(game);
  if (!set) {
    set = new Set();
    registry.set(game, set);
  }
  return set;
}

export function subscribeUnitStatuses(
  game: string,
  onChange: () => void
): () => void {
  const listeners = listenerSet(statusListeners, game);
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getUnitStatusesSnapshot(
  game: string
): Record<string, UnitStatus> {
  const raw = getUnitStatusesRaw(game);
  let cache = statusCaches.get(game);
  if (!cache || cache.raw !== raw) {
    cache = { raw, value: getUnitStatuses(game) };
    statusCaches.set(game, cache);
  }
  return cache.value;
}

export function getUnitStatusesServerSnapshot(): Record<string, UnitStatus> {
  return EMPTY_STATUSES;
}

export function notifyUnitStatusesChange(game: string): void {
  statusListeners.get(game)?.forEach((listener) => listener());
}

export function subscribeFaves(
  game: string,
  onChange: () => void
): () => void {
  const listeners = listenerSet(favesListeners, game);
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getFavesSnapshot(game: string): Record<string, string> {
  const raw = readRaw(favesStorageKey(game));
  let cache = favesCaches.get(game);
  if (!cache || cache.raw !== raw) {
    cache = { raw, value: getFaves(game) };
    favesCaches.set(game, cache);
  }
  return cache.value;
}

export function getFavesServerSnapshot(): Record<string, string> {
  return EMPTY_FAVES;
}

export function notifyFavesChange(game: string): void {
  favesListeners.get(game)?.forEach((listener) => listener());
}
