"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import type { GenshinRateUp } from "@/types/genshin";
import type { UnitStatus } from "@/types/units";
import { useUnitStatus } from "@/contexts/UnitContext";
import {
  checkLoggable,
  hasPullInBanner,
  type LogContext,
  type LogPrompt,
} from "@/lib/logPull";
import {
  getFavesServerSnapshot,
  getFavesSnapshot,
  subscribeFaves,
} from "@/lib/unitStorage";
import {
  getPullsServerSnapshot,
  getPullsSnapshot,
  subscribePulls,
} from "@/lib/pullStorage";
import { syntheticStatusKey } from "@/lib/unitResolve";
import { isPullGame, type GamePull } from "@/types/pulls";
import { ImageWithFallback } from "./ImageWithFallback";
import { LogPullDialog } from "./LogPullDialog";

interface GenshinRateUpChipProps {
  rateUp: GenshinRateUp;
  bannerStart?: string | null;
  bannerEnd?: string | null;
  logContext?: LogContext;
}

const STATUS_CONFIG: Record<
  UnitStatus,
  { bg: string; border: string; text: string; label: string }
> = {
  none: {
    bg: "bg-gray-800",
    border: "border-gray-700",
    text: "text-gray-400",
    label: "Not owned",
  },
  owned: {
    bg: "bg-green-900/50",
    border: "border-green-600",
    text: "text-green-300",
    label: "Owned",
  },
  planning: {
    bg: "bg-blue-900/50",
    border: "border-blue-600",
    text: "text-blue-300",
    label: "Planning to pull",
  },
};

function OwnedIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" data-icon="owned">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PlanningIcon() {
  return (
    <svg
      className="w-3 h-3"
      fill="currentColor"
      viewBox="0 0 20 20"
      data-icon="planning"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
        clipRule="evenodd"
      />
    </svg>
  );
}

let cachedNow: number | null = null;

function subscribeNow(): () => void {
  return () => {};
}

function getNowSnapshot(): number | null {
  if (cachedNow === null) cachedNow = Date.now();
  return cachedNow;
}

function getServerNowSnapshot(): number | null {
  return null;
}

const EMPTY_PULLS: GamePull[] = [];

export function GenshinRateUpChip({
  rateUp,
  bannerStart,
  bannerEnd,
  logContext,
}: GenshinRateUpChipProps) {
  const { getStatus, setStatus, resolveName, game } = useUnitStatus();
  const [logPrompt, setLogPrompt] = useState<LogPrompt | null>(null);
  const [pendingStatus, setPendingStatus] = useState<UnitStatus | null>(null);
  const now = useSyncExternalStore(
    subscribeNow,
    getNowSnapshot,
    getServerNowSnapshot
  );

  const pullGame = isPullGame(game);
  const pullStore = useMemo(
    () =>
      pullGame
        ? {
            subscribe: (onChange: () => void) => subscribePulls(game, onChange),
            snapshot: () => getPullsSnapshot(game),
            serverSnapshot: getPullsServerSnapshot,
          }
        : {
            subscribe: () => () => {},
            snapshot: () => EMPTY_PULLS,
            serverSnapshot: () => EMPTY_PULLS,
          },
    [pullGame, game]
  );
  const pulls = useSyncExternalStore(
    pullStore.subscribe,
    pullStore.snapshot,
    pullStore.serverSnapshot
  );

  const faveStore = useMemo(
    () => ({
      subscribe: (onChange: () => void) => subscribeFaves(game, onChange),
      snapshot: () => getFavesSnapshot(game),
      serverSnapshot: getFavesServerSnapshot,
    }),
    [game]
  );
  const faves = useSyncExternalStore(
    faveStore.subscribe,
    faveStore.snapshot,
    faveStore.serverSnapshot
  );

  const unitId = resolveName(rateUp.name);
  const isFaved =
    unitId !== null && Object.values(faves).includes(unitId);
  const isFuture =
    now !== null &&
    bannerStart != null &&
    new Date(`${bannerStart}T00:00:00Z`).getTime() > now;
  const statusKey = unitId ?? syntheticStatusKey(rateUp.name);
  const status = getStatus(statusKey);
  const config = STATUS_CONFIG[status];
  const interactive = unitId !== null || isFuture;

  const pulledHere = useMemo(() => {
    if (!pullGame) return null;
    return hasPullInBanner({
      game,
      name: rateUp.name,
      unitId,
      bannerStart: bannerStart ?? null,
      bannerEnd: bannerEnd ?? null,
      pulls,
    });
  }, [pullGame, game, rateUp.name, unitId, bannerStart, bannerEnd, pulls]);

  const showCheck =
    pulledHere === true || (pulledHere === null && status === "owned");

  const content = (
    <>
      {rateUp.image && (
        <ImageWithFallback
          src={rateUp.image}
          alt=""
          width={16}
          height={16}
          className="rounded-full object-cover shrink-0"
        />
      )}
      {showCheck ? (
        <OwnedIcon />
      ) : status === "planning" ? (
        <PlanningIcon />
      ) : null}
      {isFaved && (
        <span className="text-yellow-500" aria-label="In your favorites">
          ★
        </span>
      )}
      <span className="truncate">{rateUp.name}</span>
    </>
  );

  if (!interactive) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-gray-700 bg-gray-800 text-gray-300 max-w-full"
        title="Not on the roster"
      >
        {content}
      </span>
    );
  }

  const cycleStatus = (current: UnitStatus): UnitStatus =>
    current === "none" ? "owned" : current === "owned" ? "planning" : "none";

  const closeDialog = () => {
    setLogPrompt(null);
    if (unitId && pendingStatus) setStatus(unitId, pendingStatus);
    setPendingStatus(null);
  };

  const saveDialog = () => {
    setLogPrompt(null);
    if (unitId) setStatus(unitId, "owned");
    setPendingStatus(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (unitId !== null) {
      if (isFuture) {
        setStatus(unitId, status === "planning" ? "none" : "planning");
        return;
      }
      if (logContext) {
        const prompt = checkLoggable({
          ctx: logContext,
          name: rateUp.name,
        });
        if (prompt) {
          setPendingStatus(cycleStatus(status));
          setLogPrompt(prompt);
          return;
        }
      }
      setStatus(unitId, cycleStatus(status));
      return;
    }
    setStatus(statusKey, status === "planning" ? "none" : "planning");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 max-w-full hover:opacity-80 cursor-pointer ${config.bg} ${config.border} ${config.text}`}
        title={
          isFuture && unitId === null
            ? "Future banner: click to plan"
            : `Click to change: ${config.label}`
        }
      >
        {content}
      </button>
      {logPrompt && logContext && (
        <LogPullDialog
          game={logContext.game}
          category={logPrompt.category}
          bannerTitle={logContext.bannerTitle}
          bannerStart={logPrompt.bannerStart}
          bannerEnd={logContext.bannerEnd}
          unit={logPrompt.item}
          pulls={pulls}
          onClose={closeDialog}
          onSaved={saveDialog}
        />
      )}
    </>
  );
}
