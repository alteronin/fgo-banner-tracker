"use client";

import { useRef } from "react";
import { useServantStatus } from "@/contexts/ServantContext";
import {
  getGrandServants,
  getServantStatuses,
  setGrandServant,
  notifyGrandsChange,
} from "@/lib/storage";
import {
  fillOwnedUnits,
  getFaves,
  getUnitStatuses,
  notifyFavesChange,
  notifyUnitStatusesChange,
  setFave,
  setUnitStatus,
} from "@/lib/unitStorage";
import { getPulls, notifyPullsChange, setPulls, toPulls } from "@/lib/pullStorage";
import { UNIT_GAMES, isUnitGame } from "@/lib/units";
import { PULL_GAMES, type GamePull } from "@/types/pulls";
import type { ServantStatus } from "@/types/banner";
import type { UnitStatus } from "@/types/units";

const VALID_STATUSES = ["owned", "planning"];

interface BackupFile {
  version: 3;
  unitStatus: Record<string, Record<string, string>>;
  faves: Record<string, Record<string, string>>;
  pulls: Record<string, GamePull[]>;
}

interface LegacyBackupFile {
  version: 2;
  unitStatus: Record<string, Record<string, string>>;
  faves: Record<string, Record<string, string>>;
}

function isBackupFile(data: unknown): data is BackupFile | LegacyBackupFile {
  if (typeof data !== "object" || data === null) return false;
  const backup = data as Partial<BackupFile>;
  if (
    (backup.version !== 3 && backup.version !== 2) ||
    typeof backup.unitStatus !== "object" ||
    backup.unitStatus === null ||
    typeof backup.faves !== "object" ||
    backup.faves === null
  ) {
    return false;
  }
  if (backup.version === 3) {
    return typeof backup.pulls === "object" && backup.pulls !== null;
  }
  return true;
}

export function ImportExport() {
  const { setStatus: setFgoStatus } = useServantStatus();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
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
    const backup: BackupFile = { version: 3, unitStatus, faves, pulls };
    const data = JSON.stringify(backup, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "collection-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (backup: BackupFile | LegacyBackupFile) => {
    for (const [key, statuses] of Object.entries(backup.unitStatus)) {
      if (typeof statuses !== "object" || statuses === null) continue;
      for (const [id, status] of Object.entries(statuses)) {
        if (!VALID_STATUSES.includes(status)) continue;
        if (key === "fgo") {
          setFgoStatus(id, status as ServantStatus);
        } else if (isUnitGame(key)) {
          setUnitStatus(key, id, status as UnitStatus);
        }
      }
      if (isUnitGame(key)) notifyUnitStatusesChange(key);
    }
    for (const [key, slots] of Object.entries(backup.faves)) {
      if (typeof slots !== "object" || slots === null) continue;
      if (key === "fgo") {
        for (const [slotId, unitId] of Object.entries(slots)) {
          if (typeof unitId === "string" && unitId) {
            setGrandServant(slotId, unitId);
          }
        }
        notifyGrandsChange();
      } else if (isUnitGame(key)) {
        for (const [slotId, unitId] of Object.entries(slots)) {
          if (typeof unitId === "string") {
            setFave(key, slotId, unitId);
          }
        }
        notifyFavesChange(key);
      }
    }

    const pulls = backup.version === 3 ? backup.pulls : null;
    if (pulls) {
      for (const game of PULL_GAMES) {
        const restored = toPulls(pulls[game]);
        if (restored.length > 0) {
          setPulls(game, restored);
          notifyPullsChange(game);
          const unitIds = [
            ...new Set(
              restored.map((pull) => pull.unitId).filter((id): id is string => !!id)
            ),
          ];
          if (fillOwnedUnits(game, unitIds) > 0) {
            notifyUnitStatusesChange(game);
          }
        }
      }
    }
  };

  const importLegacy = (data: Record<string, unknown>) => {
    Object.entries(data).forEach(([slug, status]) => {
      if (["none", "owned", "planning"].includes(status as string)) {
        setFgoStatus(slug, status as ServantStatus);
      }
    });
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (isBackupFile(data)) {
          importBackup(data);
        } else if (typeof data === "object" && data !== null) {
          importLegacy(data);
        }
      } catch {
        alert("Invalid JSON file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportData}
        className="px-3 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
      >
        Export
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors"
      >
        Import
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={importData}
        className="hidden"
      />
    </div>
  );
}
