"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  guaranteePendingAt,
  pityByDrop,
  validateManualPull,
  type ManualPullIssue,
} from "@/lib/pity";
import { categoryLabel } from "@/lib/pullImport";
import {
  buildLoggedPull,
  findMapItemByName,
  getLogIndex,
  hasPullInBanner,
  localNoonTs,
  STANDARD_POOLS,
  type MapItemRef,
} from "@/lib/logPull";
import { notifyPullsChange, setPulls } from "@/lib/pullStorage";
import { fillOwnedUnits, notifyUnitStatusesChange } from "@/lib/unitStorage";
import type { GamePull, PullGame } from "@/types/pulls";
import { FIELD_CLASS, formatIssue, isBlockingIssue, parseLocalInput, toLocalInput } from "./ManualPullForm";

interface LogPullDialogProps {
  game: PullGame;
  category: string;
  bannerTitle: string;
  bannerStart: string;
  bannerEnd: string | null;
  unit: MapItemRef;
  pulls: GamePull[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

const OUTCOME_BUTTON =
  "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors";

const WIN_ACTIVE = "border-emerald-500 bg-emerald-900/40 text-emerald-300";
const LOSS_ACTIVE = "border-rose-500 bg-rose-900/40 text-rose-300";
const GUARANTEE_ACTIVE = "border-teal-500 bg-teal-900/40 text-teal-300";
const INACTIVE = "border-gray-700 bg-gray-950 text-gray-400 hover:border-gray-600";

export function LogPullDialog({
  game,
  category,
  bannerTitle,
  bannerStart,
  bannerEnd,
  unit,
  pulls,
  onClose,
  onSaved,
}: LogPullDialogProps) {
  const pool = STANDARD_POOLS[game][category] ?? [];
  const lossPossible = pool.length > 0;

  const [when, setWhen] = useState(() =>
    toLocalInput(localNoonTs(bannerStart) ?? Date.now())
  );
  const [outcome, setOutcome] = useState<"win" | "loss" | "guarantee" | null>(
    null
  );
  const [standardName, setStandardName] = useState<string | null>(null);
  const [alsoGuarantee, setAlsoGuarantee] = useState(false);
  const [guaranteeWhen, setGuaranteeWhen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const index = useMemo(() => getLogIndex(game), [game]);
  const ts = parseLocalInput(when);
  const guaranteeValue =
    guaranteeWhen ??
    toLocalInput((ts ?? localNoonTs(bannerStart) ?? 0) + 86_400_000);
  const guaranteeTs = parseLocalInput(guaranteeValue);

  const standard = useMemo<MapItemRef | null>(() => {
    if (outcome !== "loss" || !standardName) return null;
    return findMapItemByName(game, standardName);
  }, [outcome, standardName, game]);

  const outcomeReady = !lossPossible || outcome !== null;
  const lossReady = outcome !== "loss" || standard !== null;

  const pendingGuarantee = useMemo(() => {
    if (ts === null) return false;
    return guaranteePendingAt(game, pulls, index, category, ts);
  }, [ts, game, pulls, index, category]);

  const alreadyLogged = useMemo(
    () =>
      hasPullInBanner({
        game,
        name: unit.name,
        unitId: unit.unitId ?? null,
        bannerStart,
        bannerEnd,
        pulls,
      }) === true,
    [game, unit, bannerStart, bannerEnd, pulls]
  );

  const declaredOutcome = useMemo<"win" | "loss" | "guarantee">(() => {
    if (outcome === "loss") return "loss";
    if (outcome === "guarantee") return "guarantee";
    if (outcome === "win" && pendingGuarantee) return "guarantee";
    return "win";
  }, [outcome, pendingGuarantee]);

  const draft = useMemo(() => {
    if (ts === null || !outcomeReady || !lossReady) return null;
    const received = outcome === "loss" ? standard : unit;
    if (!received) return null;
    return buildLoggedPull({
      game,
      ts,
      category,
      received,
      outcome: declaredOutcome,
      existing: pulls,
    });
  }, [ts, outcomeReady, lossReady, outcome, standard, unit, game, category, pulls, declaredOutcome]);

  const guaranteeDraft = useMemo(() => {
    if (!draft || outcome !== "loss" || !alsoGuarantee || guaranteeTs === null) {
      return null;
    }
    return buildLoggedPull({
      game,
      ts: guaranteeTs,
      category,
      received: unit,
      outcome: "guarantee",
      existing: [...pulls, draft],
    });
  }, [draft, outcome, alsoGuarantee, guaranteeTs, unit, game, category, pulls]);

  const issue: ManualPullIssue | null = useMemo(() => {
    if (!draft) return null;
    return validateManualPull(game, draft, pulls, index, {
      allowAfterOldest: true,
    });
  }, [draft, game, pulls, index]);

  const guaranteeIssue: ManualPullIssue | null = useMemo(() => {
    if (!guaranteeDraft || !draft) return null;
    return validateManualPull(game, guaranteeDraft, [...pulls, draft], index, {
      allowAfterOldest: true,
    });
  }, [guaranteeDraft, draft, game, pulls, index]);

  const issues = useMemo(
    () =>
      [issue, guaranteeIssue].filter((item): item is ManualPullIssue => item !== null),
    [issue, guaranteeIssue]
  );
  const blockingIssue = issues.find((item) => isBlockingIssue(item)) ?? null;

  const preview = useMemo(() => {
    if (!draft) return null;
    const label = categoryLabel(game, category);
    const hypothetical = pityByDrop([...pulls, draft], 5);
    const pity = hypothetical.get(draft.id);
    if (pity !== undefined) {
      return `Preview: implied Pity ${pity} · ${label} — not counted in stats`;
    }
    return `Preview: 5★ · ${label}`;
  }, [draft, pulls, game, category]);

  const guaranteePreview = useMemo(() => {
    if (!draft || !guaranteeDraft) return null;
    const hypothetical = pityByDrop([...pulls, draft, guaranteeDraft], 5);
    const pity = hypothetical.get(guaranteeDraft.id);
    if (pity !== undefined) {
      return `Guarantee: ${unit.name} · implied Pity ${pity} — not counted in stats`;
    }
    return null;
  }, [draft, guaranteeDraft, pulls, unit]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) {
      setError(
        ts === null
          ? "Pick a valid date and time."
          : lossPossible && outcome === null
          ? "Choose a rate-up result."
          : "Choose the standard unit you received."
      );
      return;
    }
    if (blockingIssue) return;
    const added: GamePull[] = guaranteeDraft ? [draft, guaranteeDraft] : [draft];
    if (!setPulls(game, [...pulls, ...added])) {
      setError("Could not save: browser storage is full.");
      return;
    }
    notifyPullsChange(game);
    const unitIds = added
      .map((pull) => pull.unitId)
      .filter((id): id is string => id !== null);
    if (unitIds.length > 0) {
      const filled = fillOwnedUnits(game, unitIds);
      if (filled > 0) notifyUnitStatusesChange(game);
    }
    onSaved(guaranteeDraft ? "Pulls logged." : "Pull logged.");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4"
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <form
        onSubmit={submit}
        aria-label="Log this pull"
        className="relative bg-gray-900 rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-700 p-4 sm:p-6 space-y-4"
      >
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">Log this pull</p>
          <p className="text-xs text-gray-400">
            {unit.name} · {unit.rarity ?? 5}★ · {bannerTitle}
          </p>
          <p className="text-xs text-gray-500">
            {categoryLabel(game, category)} · starts {bannerStart}
            {bannerEnd ? ` · ends ${bannerEnd}` : ""}
          </p>
          {alreadyLogged && (
            <p className="text-xs text-amber-400">
              You already logged {unit.name} on this banner — saving will log
              another copy.
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block space-y-1 text-xs text-gray-400">
            Date &amp; time
            <input
              type="datetime-local"
              step={1}
              value={when}
              onChange={(event) => setWhen(event.target.value)}
              className={FIELD_CLASS}
            />
          </label>
          <p className="text-[11px] text-gray-500 self-end">
            Defaults to the banner start — adjust if you pulled on a different
            day.
          </p>
        </div>

        {lossPossible ? (
          <div className="space-y-2 text-xs text-gray-400">
            <span>Rate-up result</span>
            <div
              className="flex gap-2"
              role="group"
              aria-label="Rate-up result"
            >
              <button
                type="button"
                aria-pressed={outcome === "win"}
                onClick={() => setOutcome("win")}
                className={`${OUTCOME_BUTTON} ${outcome === "win" ? WIN_ACTIVE : INACTIVE}`}
              >
                Won 50/50
              </button>
              <button
                type="button"
                aria-pressed={outcome === "loss"}
                onClick={() => setOutcome("loss")}
                className={`${OUTCOME_BUTTON} ${outcome === "loss" ? LOSS_ACTIVE : INACTIVE}`}
              >
                Lost 50/50
              </button>
              <button
                type="button"
                aria-pressed={outcome === "guarantee"}
                onClick={() => setOutcome("guarantee")}
                className={`${OUTCOME_BUTTON} ${outcome === "guarantee" ? GUARANTEE_ACTIVE : INACTIVE}`}
              >
                Used guarantee
              </button>
            </div>
            {outcome === "win" && pendingGuarantee && (
              <p className="text-xs text-teal-300">
                Rate-up was already guaranteed — this will be saved as
                Guaranteed.
              </p>
            )}
            {outcome === "guarantee" && (
              <p className="text-xs text-teal-300">
                You received {unit.name} — the featured 5★ (guaranteed after
                your last loss).
              </p>
            )}
            {outcome === "loss" && (
              <div className="space-y-1">
                <span>You received</span>
                <div className="flex flex-wrap gap-2">
                  {pool.map((name) => (
                    <button
                      key={name}
                      type="button"
                      aria-pressed={standardName === name}
                      onClick={() => setStandardName(name)}
                      className={`${OUTCOME_BUTTON} ${standardName === name ? LOSS_ACTIVE : INACTIVE}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                {standard && (
                  <label className="flex items-center gap-2 pt-2 text-xs text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alsoGuarantee}
                      onChange={(event) => setAlsoGuarantee(event.target.checked)}
                      className="accent-teal-500"
                    />
                    <span>
                      Then I got {unit.name} as the guaranteed win (my next 5★)
                    </span>
                  </label>
                )}
                {standard && alsoGuarantee && (
                  <label className="block space-y-1 pl-6 text-xs text-gray-400">
                    Guarantee date
                    <input
                      type="datetime-local"
                      step={1}
                      value={guaranteeValue}
                      onChange={(event) => setGuaranteeWhen(event.target.value)}
                      className={FIELD_CLASS}
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            This banner has no 50/50 — logged as a win.
          </p>
        )}

        {preview && <p className="text-xs text-amber-400">{preview}</p>}
        {guaranteePreview && (
          <p className="text-xs text-teal-300">{guaranteePreview}</p>
        )}
        {issues.length > 0 ? (
          issues.map((item, i) => (
            <p
              key={`${item.kind}-${i}`}
              className={
                isBlockingIssue(item)
                  ? "text-sm text-red-400"
                  : "text-sm text-amber-400"
              }
            >
              {formatIssue(item)}
            </p>
          ))
        ) : (
          error && <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!draft || blockingIssue !== null}
            className="px-3 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            Log pull
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
          >
            Skip
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
