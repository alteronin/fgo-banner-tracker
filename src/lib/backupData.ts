import {
  getGrandServants,
  getServantStatuses,
  notifyGrandsChange,
  notifyServantStatusesChange,
  replaceGrandServants,
  replaceServantStatuses,
} from "@/lib/storage";
import {
  getFaves,
  getUnitStatuses,
  notifyFavesChange,
  notifyUnitStatusesChange,
  replaceFaves,
  replaceUnitStatuses,
} from "@/lib/unitStorage";
import {
  getPulls,
  notifyPullsChange,
  setPulls,
  sortPulls,
  toPulls,
} from "@/lib/pullStorage";
import { UNIT_GAMES, isUnitGame } from "@/lib/units";
import { PULL_GAMES, isPullGame, type GamePull } from "@/types/pulls";
import type { ServantStatus } from "@/types/banner";

export interface SyncBackup {
  version: 3;
  unitStatus: Record<string, Record<string, string>>;
  faves: Record<string, Record<string, string>>;
  pulls: Record<string, GamePull[]>;
}

export interface SyncMark {
  fingerprint: string;
  updatedAt: number;
}

const SYNC_MARK_KEY = "fbtn-sync-mark";

export type SyncAction = "noop" | "push" | "adopt" | "merge" | "initial-push";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isBackupShape(value: unknown): value is SyncBackup {
  if (!isPlainObject(value)) return false;
  if (value.version !== 3) return false;
  if (!isPlainObject(value.unitStatus)) return false;
  if (!isPlainObject(value.faves)) return false;
  if (!isPlainObject(value.pulls)) return false;
  return true;
}

export function buildSnapshot(): SyncBackup {
  const unitStatus: Record<string, Record<string, string>> = {
    fgo: getServantStatuses(),
  };
  for (const game of UNIT_GAMES) {
    unitStatus[game] = getUnitStatuses(game);
  }
  const faves: Record<string, Record<string, string>> = {
    fgo: getGrandServants(),
  };
  for (const game of UNIT_GAMES) {
    faves[game] = getFaves(game);
  }
  const pulls: Record<string, GamePull[]> = {};
  for (const game of PULL_GAMES) {
    pulls[game] = getPulls(game);
  }
  return { version: 3, unitStatus, faves, pulls };
}

function unionStringMaps(
  local: Record<string, string> | undefined,
  remote: Record<string, string> | undefined
): Record<string, string> {
  const out: Record<string, string> = {};
  if (remote && isPlainObject(remote)) {
    for (const [key, value] of Object.entries(remote)) {
      if (typeof value === "string") out[key] = value;
    }
  }
  if (local && isPlainObject(local)) {
    for (const [key, value] of Object.entries(local)) {
      if (typeof value === "string") out[key] = value;
    }
  }
  return out;
}

function unionPulls(local: GamePull[], remote: GamePull[]): GamePull[] {
  const seen = new Set(local.map((pull) => pull.id));
  const out = [...local];
  for (const pull of remote) {
    if (seen.has(pull.id)) continue;
    seen.add(pull.id);
    out.push(pull);
  }
  return sortPulls(out);
}

export function unionBackups(local: SyncBackup, remote: SyncBackup): SyncBackup {
  const unitStatus: Record<string, Record<string, string>> = {};
  const keys = new Set([
    ...Object.keys(local.unitStatus),
    ...Object.keys(remote.unitStatus),
  ]);
  for (const key of keys) {
    unitStatus[key] = unionStringMaps(
      local.unitStatus[key],
      remote.unitStatus[key]
    );
  }
  const faves: Record<string, Record<string, string>> = {};
  const faveKeys = new Set([...Object.keys(local.faves), ...Object.keys(remote.faves)]);
  for (const key of faveKeys) {
    faves[key] = unionStringMaps(local.faves[key], remote.faves[key]);
  }
  const pulls: Record<string, GamePull[]> = {};
  const pullKeys = new Set([...Object.keys(local.pulls), ...Object.keys(remote.pulls)]);
  for (const key of pullKeys) {
    pulls[key] = unionPulls(
      toPulls(local.pulls[key]),
      toPulls(remote.pulls[key])
    );
  }
  return { version: 3, unitStatus, faves, pulls };
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value) ?? "null";
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, entryValue]) => entryValue !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableStringify(entryValue)}`);
  return `{${entries.join(",")}}`;
}

export function fingerprintBackup(backup: SyncBackup): string {
  const text = stableStringify(backup);
  let hash = 5381;
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash + text.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16);
}

export function applyBackup(backup: SyncBackup): void {
  for (const [key, statuses] of Object.entries(backup.unitStatus)) {
    if (!isPlainObject(statuses)) continue;
    if (key === "fgo") {
      replaceServantStatuses(statuses as Record<string, ServantStatus>);
      notifyServantStatusesChange();
    } else if (isUnitGame(key)) {
      replaceUnitStatuses(key, statuses as Record<string, string>);
      notifyUnitStatusesChange(key);
    }
  }
  for (const [key, slots] of Object.entries(backup.faves)) {
    if (!isPlainObject(slots)) continue;
    if (key === "fgo") {
      replaceGrandServants(slots as Record<string, string>);
      notifyGrandsChange();
    } else if (isUnitGame(key)) {
      replaceFaves(key, slots as Record<string, string>);
      notifyFavesChange(key);
    }
  }
  for (const [game, pulls] of Object.entries(backup.pulls)) {
    if (!isPullGame(game)) continue;
    setPulls(game, toPulls(pulls));
    notifyPullsChange(game);
  }
}

export function readSyncMark(): SyncMark | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SYNC_MARK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SyncMark>;
    if (
      typeof parsed.fingerprint === "string" &&
      typeof parsed.updatedAt === "number"
    ) {
      return { fingerprint: parsed.fingerprint, updatedAt: parsed.updatedAt };
    }
    return null;
  } catch {
    return null;
  }
}

export function writeSyncMark(mark: SyncMark): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SYNC_MARK_KEY, JSON.stringify(mark));
  } catch {
    // ignore
  }
}

export function decideSyncAction(params: {
  mark: SyncMark | null;
  localFingerprint: string;
  remoteUpdatedAt: number | null;
}): SyncAction {
  const { mark, localFingerprint, remoteUpdatedAt } = params;
  if (remoteUpdatedAt === null) return "initial-push";
  if (!mark) return "merge";
  if (mark.fingerprint === localFingerprint) {
    return mark.updatedAt === remoteUpdatedAt ? "noop" : "adopt";
  }
  if (mark.updatedAt === remoteUpdatedAt) return "push";
  return "merge";
}
