import type { ServantStatus } from "@/types/banner";
import { notifySyncableChange } from "@/lib/syncDirty";

const STORAGE_KEY = "fgo-servant-status";
const GRANDS_KEY = "fgo-grand-servants";

export function getServantStatuses(): Record<string, ServantStatus> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function getServantStatusesRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setServantStatus(
  servantSlug: string,
  status: ServantStatus
): void {
  if (typeof window === "undefined") return;
  const statuses = getServantStatuses();
  if (status === "none") {
    delete statuses[servantSlug];
  } else {
    statuses[servantSlug] = status;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
}

export function getServantStatus(
  servantSlug: string
): ServantStatus {
  const statuses = getServantStatuses();
  return statuses[servantSlug] || "none";
}

export function getGrandServants(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(GRANDS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

export function setGrandServant(
  slotId: string,
  slug: string
): void {
  if (typeof window === "undefined") return;
  const grands = getGrandServants();
  grands[slotId] = slug;
  localStorage.setItem(GRANDS_KEY, JSON.stringify(grands));
}

export function replaceServantStatuses(
  statuses: Record<string, ServantStatus>
): void {
  if (typeof window === "undefined") return;
  if (Object.keys(statuses).length === 0) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  }
}

export function replaceGrandServants(grands: Record<string, string>): void {
  if (typeof window === "undefined") return;
  if (Object.keys(grands).length === 0) {
    localStorage.removeItem(GRANDS_KEY);
  } else {
    localStorage.setItem(GRANDS_KEY, JSON.stringify(grands));
  }
}

export function getGrandServant(slotId: string): string {
  const grands = getGrandServants();
  return grands[slotId] || "";
}

const grandsListeners = new Set<() => void>();
let grandsCacheRaw: string | null | undefined;
let grandsCache: Record<string, string> = {};
const EMPTY_GRANDS: Record<string, string> = {};

function readGrandsRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(GRANDS_KEY);
  } catch {
    return null;
  }
}

export function subscribeGrands(onChange: () => void): () => void {
  grandsListeners.add(onChange);
  return () => {
    grandsListeners.delete(onChange);
  };
}

export function getGrandsSnapshot(): Record<string, string> {
  const raw = readGrandsRaw();
  if (raw !== grandsCacheRaw) {
    grandsCacheRaw = raw;
    grandsCache = getGrandServants();
  }
  return grandsCache;
}

export function getGrandsServerSnapshot(): Record<string, string> {
  return EMPTY_GRANDS;
}

export function notifyGrandsChange(): void {
  grandsListeners.forEach((listener) => listener());
  notifySyncableChange();
}

const servantListeners = new Set<() => void>();
let servantCacheRaw: string | null | undefined;
let servantCache: Record<string, ServantStatus> = {};
const EMPTY_SERVANT_STATUSES: Record<string, ServantStatus> = {};

export function subscribeServantStatuses(onChange: () => void): () => void {
  servantListeners.add(onChange);
  return () => {
    servantListeners.delete(onChange);
  };
}

export function getServantStatusesSnapshot(): Record<string, ServantStatus> {
  const raw = getServantStatusesRaw();
  if (raw !== servantCacheRaw) {
    servantCacheRaw = raw;
    servantCache = getServantStatuses();
  }
  return servantCache;
}

export function getServantStatusesServerSnapshot(): Record<
  string,
  ServantStatus
> {
  return EMPTY_SERVANT_STATUSES;
}

export function notifyServantStatusesChange(): void {
  servantListeners.forEach((listener) => listener());
  notifySyncableChange();
}
