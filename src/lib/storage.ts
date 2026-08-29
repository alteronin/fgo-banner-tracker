import type { ServantStatus } from "@/types/banner";

const STORAGE_KEY = "fgo-servant-status";

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
