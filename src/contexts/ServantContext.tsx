"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { ServantStatus } from "@/types/banner";
import {
  getServantStatuses,
  setServantStatus as saveServantStatus,
} from "@/lib/storage";

interface ServantContextType {
  statuses: Record<string, ServantStatus>;
  getStatus: (slug: string) => ServantStatus;
  toggleStatus: (slug: string) => void;
  setStatus: (slug: string, status: ServantStatus) => void;
}

const ServantContext = createContext<ServantContextType | null>(null);

export function ServantProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<Record<string, ServantStatus>>(
    () => getServantStatuses()
  );

  const getStatus = useCallback(
    (slug: string): ServantStatus => statuses[slug] || "none",
    [statuses]
  );

  const setStatus = useCallback((slug: string, status: ServantStatus) => {
    setStatuses((prev) => {
      const next = { ...prev };
      if (status === "none") {
        delete next[slug];
      } else {
        next[slug] = status;
      }
      return next;
    });
    saveServantStatus(slug, status);
  }, []);

  const toggleStatus = useCallback(
    (slug: string) => {
      const current = statuses[slug] || "none";
      const next: ServantStatus =
        current === "none" ? "owned" : current === "owned" ? "planning" : "none";
      setStatus(slug, next);
    },
    [statuses, setStatus]
  );

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
