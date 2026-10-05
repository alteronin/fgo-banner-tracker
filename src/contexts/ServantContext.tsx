"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import type { ServantStatus } from "@/types/banner";
import {
  getServantStatusesServerSnapshot,
  getServantStatusesSnapshot,
  notifyServantStatusesChange,
  setServantStatus as saveServantStatus,
  subscribeServantStatuses,
} from "@/lib/storage";

interface ServantContextType {
  statuses: Record<string, ServantStatus>;
  getStatus: (slug: string) => ServantStatus;
  toggleStatus: (slug: string) => void;
  setStatus: (slug: string, status: ServantStatus) => void;
}

const ServantContext = createContext<ServantContextType | null>(null);

export function ServantProvider({ children }: { children: ReactNode }) {
  const statuses = useSyncExternalStore(
    subscribeServantStatuses,
    getServantStatusesSnapshot,
    getServantStatusesServerSnapshot
  );

  const getStatus = (slug: string): ServantStatus => statuses[slug] || "none";

  const setStatus = (slug: string, status: ServantStatus) => {
    saveServantStatus(slug, status);
    notifyServantStatusesChange();
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
