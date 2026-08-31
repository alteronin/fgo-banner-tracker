import type { ServantStatus } from "@/types/banner";

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

export function getGrandServant(slotId: string): string {
  const grands = getGrandServants();
  return grands[slotId] || "";
}
