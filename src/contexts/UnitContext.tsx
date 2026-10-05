"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { UnitGame, UnitStatus } from "@/types/units";
import {
  buildUnitIndex,
  resolveUnitName,
  type UnitIndex,
  type UnitIndexEntry,
} from "@/lib/unitResolve";
import {
  getUnitStatusesServerSnapshot,
  getUnitStatusesSnapshot,
  notifyUnitStatusesChange,
  setUnitStatus as saveUnitStatus,
  subscribeUnitStatuses,
} from "@/lib/unitStorage";

interface UnitContextType {
  game: UnitGame;
  statuses: Record<string, UnitStatus>;
  getStatus: (unitId: string) => UnitStatus;
  toggleStatus: (unitId: string) => void;
  setStatus: (unitId: string, status: UnitStatus) => void;
  resolveName: (name: string) => string | null;
}

const UnitContext = createContext<UnitContextType | null>(null);

export function UnitProvider({
  game,
  roster,
  children,
}: {
  game: UnitGame;
  roster?: readonly UnitIndexEntry[];
  children: ReactNode;
}) {
  const store = useMemo(
    () => ({
      subscribe: (onChange: () => void) => subscribeUnitStatuses(game, onChange),
      getSnapshot: () => getUnitStatusesSnapshot(game),
      getServerSnapshot: getUnitStatusesServerSnapshot,
    }),
    [game]
  );

  const index = useMemo<UnitIndex | null>(
    () => (roster ? buildUnitIndex(roster, game) : null),
    [roster, game]
  );

  const statuses = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const getStatus = (unitId: string): UnitStatus =>
    statuses[unitId] || "none";

  const setStatus = (unitId: string, status: UnitStatus) => {
    saveUnitStatus(game, unitId, status);
    notifyUnitStatusesChange(game);
  };

  const toggleStatus = (unitId: string) => {
    const current = statuses[unitId] || "none";
    const next: UnitStatus =
      current === "none" ? "owned" : current === "owned" ? "planning" : "none";
    setStatus(unitId, next);
  };

  const resolveName = (name: string): string | null =>
    index ? resolveUnitName(name, index) : null;

  return (
    <UnitContext.Provider
      value={{
        game,
        statuses,
        getStatus,
        toggleStatus,
        setStatus,
        resolveName,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}

export function useUnitStatus() {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error("useUnitStatus must be used within UnitProvider");
  }
  return context;
}
