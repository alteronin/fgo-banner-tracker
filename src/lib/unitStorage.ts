import type { UnitStatus } from "@/types/units";
import { notifySyncableChange } from "@/lib/syncDirty";

export function unitStatusKey(game: string): string {
  return `unit-status:${game}`;
}

export function favesStorageKey(game: string): string {
  return `faves:${game}`;
}

export function faveNotesStorageKey(scope: string): string {
  return `fave-notes:${scope}`;
}

export interface FaveSlotMeta {
  label?: string;
  note?: string;
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

export function replaceUnitStatuses(
  game: string,
  statuses: Record<string, string>
): void {
  if (typeof window === "undefined") return;
  const key = unitStatusKey(game);
  if (Object.keys(statuses).length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(statuses));
  }
}

export function replaceFaves(
  game: string,
  faves: Record<string, string>
): void {
  if (typeof window === "undefined") return;
  const key = favesStorageKey(game);
  if (Object.keys(faves).length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(faves));
  }
}

function sanitizeMeta(value: unknown): FaveSlotMeta | null {
  if (typeof value !== "object" || value === null) return null;
  const raw = value as Record<string, unknown>;
  const meta: FaveSlotMeta = {};
  if (typeof raw.label === "string" && raw.label.trim()) {
    meta.label = raw.label.trim();
  }
  if (typeof raw.note === "string" && raw.note.trim()) {
    meta.note = raw.note.trim();
  }
  return meta.label || meta.note ? meta : null;
}

function readMetaObject(key: string): Record<string, FaveSlotMeta> {
  const raw = readRaw(key);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const out: Record<string, FaveSlotMeta> = {};
    for (const [slotId, value] of Object.entries(parsed)) {
      const meta = sanitizeMeta(value);
      if (meta) out[slotId] = meta;
    }
    return out;
  } catch {
    return {};
  }
}

export function getFaveNotes(scope: string): Record<string, FaveSlotMeta> {
  return readMetaObject(faveNotesStorageKey(scope));
}

export function getFaveNotesRaw(scope: string): string | null {
  return readRaw(faveNotesStorageKey(scope));
}

export function setFaveNote(
  scope: string,
  slotId: string,
  meta: FaveSlotMeta
): void {
  if (typeof window === "undefined") return;
  const key = faveNotesStorageKey(scope);
  const notes = readMetaObject(key);
  const next: FaveSlotMeta = { ...notes[slotId] };
  if (meta.label !== undefined) {
    const label = meta.label.trim();
    if (label) next.label = label;
    else delete next.label;
  }
  if (meta.note !== undefined) {
    const note = meta.note.trim();
    if (note) next.note = note;
    else delete next.note;
  }
  if (next.label || next.note) notes[slotId] = next;
  else delete notes[slotId];
  if (Object.keys(notes).length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(notes));
  }
}

export function replaceFaveNotes(
  scope: string,
  notes: Record<string, FaveSlotMeta>
): void {
  if (typeof window === "undefined") return;
  const key = faveNotesStorageKey(scope);
  const clean: Record<string, FaveSlotMeta> = {};
  for (const [slotId, value] of Object.entries(notes)) {
    const meta = sanitizeMeta(value);
    if (meta) clean[slotId] = meta;
  }
  if (Object.keys(clean).length === 0) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(clean));
  }
}

const EMPTY_STATUSES: Record<string, UnitStatus> = {};
const EMPTY_FAVES: Record<string, string> = {};
const EMPTY_FAVE_NOTES: Record<string, FaveSlotMeta> = {};

interface Cache<T> {
  raw: string | null | undefined;
  value: T;
}

const statusListeners = new Map<string, Set<() => void>>();
const statusCaches = new Map<string, Cache<Record<string, UnitStatus>>>();
const favesListeners = new Map<string, Set<() => void>>();
const favesCaches = new Map<string, Cache<Record<string, string>>>();
const faveNotesListeners = new Map<string, Set<() => void>>();
const faveNotesCaches = new Map<
  string,
  Cache<Record<string, FaveSlotMeta>>
>();

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
  notifySyncableChange();
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
  notifySyncableChange();
}

export function subscribeFaveNotes(
  scope: string,
  onChange: () => void
): () => void {
  const listeners = listenerSet(faveNotesListeners, scope);
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getFaveNotesSnapshot(
  scope: string
): Record<string, FaveSlotMeta> {
  const raw = readRaw(faveNotesStorageKey(scope));
  let cache = faveNotesCaches.get(scope);
  if (!cache || cache.raw !== raw) {
    cache = { raw, value: getFaveNotes(scope) };
    faveNotesCaches.set(scope, cache);
  }
  return cache.value;
}

export function getFaveNotesServerSnapshot(): Record<string, FaveSlotMeta> {
  return EMPTY_FAVE_NOTES;
}

export function notifyFaveNotesChange(scope: string): void {
  faveNotesListeners.get(scope)?.forEach((listener) => listener());
  notifySyncableChange();
}
