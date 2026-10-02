"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { ServantStatus } from "@/types/banner";
import {
  getServantStatuses,
  getServantStatusesRaw,
  setServantStatus as saveServantStatus,
} from "@/lib/storage";

interface ServantContextType {
  statuses: Record<string, ServantStatus>;
  getStatus: (slug: string) => ServantStatus;
  toggleStatus: (slug: string) => void;
  setStatus: (slug: string, status: ServantStatus) => void;
}

const ServantContext = createContext<ServantContextType | null>(null);

const EMPTY_STATUSES: Record<string, ServantStatus> = {};

const listeners = new Set<() => void>();
let cacheRaw: string | null | undefined;
let cache: Record<string, ServantStatus> = EMPTY_STATUSES;

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function getSnapshot(): Record<string, ServantStatus> {
  const raw = getServantStatusesRaw();
  if (raw !== cacheRaw) {
    cacheRaw = raw;
    cache = getServantStatuses();
  }
  return cache;
}

function getServerSnapshot(): Record<string, ServantStatus> {
  return EMPTY_STATUSES;
}

function notifyChange(): void {
  listeners.forEach((listener) => listener());
}

export function ServantProvider({ children }: { children: ReactNode }) {
  const statuses = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const getStatus = (slug: string): ServantStatus => statuses[slug] || "none";

  const setStatus = (slug: string, status: ServantStatus) => {
    saveServantStatus(slug, status);
    notifyChange();
  };

  const toggleStatus = (slug: string) => {
    const current = statuses[slug] || "none";
    const next: ServantStatus =
      current === "none" ? "owned" : current === "owned" ? "planning" : "none";
    setStatus(slug, next);
  };

  return (
    <ServantContext.Provider
      value={{ statuses, getStatus, toggleStatus, setStatus }}
    >
      {children}
    </ServantContext.Provider>
  );
}

export function useServantStatus() {
  const context = useContext(ServantContext);
  if (!context) {
    throw new Error("useServantStatus must be used within ServantProvider");
  }
  return context;
}
