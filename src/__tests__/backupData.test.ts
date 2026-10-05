import { describe, expect, it } from "vitest";
import {
  applyBackup,
  buildSnapshot,
  decideSyncAction,
  fingerprintBackup,
  isBackupShape,
  readSyncMark,
  unionBackups,
  writeSyncMark,
} from "@/lib/backupData";
import { subscribeSyncableChange } from "@/lib/syncDirty";
import { getPulls, setPulls } from "@/lib/pullStorage";
import { getUnitStatuses, setUnitStatus } from "@/lib/unitStorage";
import { getGrandServants, getServantStatuses, setServantStatus } from "@/lib/storage";
import type { GamePull } from "@/types/pulls";

function makePull(id: string, overrides: Partial<GamePull> = {}): GamePull {
  return {
    id,
    gameId: "genshin",
    itemId: "item-1",
    unitId: `unit-${id}`,
    name: `Pull ${id}`,
    rarity: 5,
    ts: 1_700_000_000_000,
    category: "character",
    ...overrides,
  };
}

const EMPTY_BACKUP = {
  version: 3 as const,
  unitStatus: {},
  faves: {},
  pulls: {},
};

describe("isBackupShape", () => {
  it("accepts a v3 backup", () => {
    expect(isBackupShape({ ...EMPTY_BACKUP })).toBe(true);
    expect(
      isBackupShape({ version: 3, unitStatus: {}, faves: {}, pulls: { genshin: [] } })
    ).toBe(true);
  });

  it("rejects legacy versions and garbage", () => {
    expect(isBackupShape({ version: 2, unitStatus: {}, faves: {} })).toBe(false);
    expect(isBackupShape({ version: 3, unitStatus: {}, faves: {} })).toBe(false);
    expect(isBackupShape(null)).toBe(false);
    expect(isBackupShape([])).toBe(false);
    expect(isBackupShape("backup")).toBe(false);
    expect(isBackupShape({})).toBe(false);
  });
});

describe("buildSnapshot", () => {
  it("covers fgo, unit games, and pull games", () => {
    const snapshot = buildSnapshot();
    expect(snapshot.version).toBe(3);
    expect(Object.keys(snapshot.unitStatus)).toEqual(
      expect.arrayContaining(["fgo", "genshin", "hsr", "zzz", "wuwa", "hi3", "shadowverse"])
    );
    expect(Object.keys(snapshot.faves)).toEqual(expect.arrayContaining(["fgo", "genshin"]));
    expect(Object.keys(snapshot.pulls)).toEqual(
      expect.arrayContaining(["genshin", "hsr", "zzz", "wuwa"])
    );
  });
});

describe("unionBackups", () => {
  it("unions pulls, keeping the local copy when ids collide", () => {
    const local = {
      ...EMPTY_BACKUP,
      pulls: { genshin: [makePull("a", { name: "Local A", seq: 4 })] },
    };
    const remote = {
      ...EMPTY_BACKUP,
      pulls: {
        genshin: [makePull("a", { name: "Remote A" }), makePull("b", { name: "Remote B" })],
      },
    };
    const merged = unionBackups(local, remote);
    const pulls = merged.pulls.genshin;
    expect(pulls).toHaveLength(2);
    expect(pulls.find((p) => p.id === "a")?.name).toBe("Local A");
    expect(pulls.find((p) => p.id === "a")?.seq).toBe(4);
    expect(pulls.find((p) => p.id === "b")?.name).toBe("Remote B");
  });

  it("unions statuses and faves with local winning conflicts", () => {
    const local = {
      ...EMPTY_BACKUP,
      unitStatus: { genshin: { "1": "owned" } },
      faves: { hsr: { main: "unit-local" } },
    };
    const remote = {
      ...EMPTY_BACKUP,
      unitStatus: { genshin: { "1": "planning", "2": "planning" }, fgo: { kevin: "owned" } },
      faves: { hsr: { main: "unit-remote", alt: "unit-remote-alt" } },
    };
    const merged = unionBackups(local, remote);
    expect(merged.unitStatus.genshin).toEqual({ "1": "owned", "2": "planning" });
    expect(merged.unitStatus.fgo).toEqual({ kevin: "owned" });
    expect(merged.faves.hsr).toEqual({ main: "unit-local", alt: "unit-remote-alt" });
  });
});

describe("fingerprintBackup", () => {
  it("ignores object key insertion order", () => {
    const a = fingerprintBackup({
      ...EMPTY_BACKUP,
      unitStatus: { genshin: { "1": "owned", "2": "planning" } },
    });
    const b = fingerprintBackup({
      ...EMPTY_BACKUP,
      unitStatus: { genshin: { "2": "planning", "1": "owned" } },
    });
    expect(a).toBe(b);
  });

  it("changes when data changes", () => {
    const a = fingerprintBackup({ ...EMPTY_BACKUP, pulls: { genshin: [makePull("x")] } });
    const b = fingerprintBackup({ ...EMPTY_BACKUP, pulls: { genshin: [makePull("y")] } });
    expect(a).not.toBe(b);
  });
});

describe("decideSyncAction", () => {
  const localFp = "local-fp";
  const remoteUpdatedAt = 100;

  it("pushes when there is no remote yet", () => {
    expect(
      decideSyncAction({ mark: null, localFingerprint: localFp, remoteUpdatedAt: null })
    ).toBe("initial-push");
  });

  it("merges on first sync when remote exists and there is no mark", () => {
    expect(
      decideSyncAction({ mark: null, localFingerprint: localFp, remoteUpdatedAt })
    ).toBe("merge");
  });

  it("does nothing when local and remote are in sync", () => {
    expect(
      decideSyncAction({
        mark: { fingerprint: localFp, updatedAt: remoteUpdatedAt },
        localFingerprint: localFp,
        remoteUpdatedAt,
      })
    ).toBe("noop");
  });

  it("adopts remote when local is clean but remote moved", () => {
    expect(
      decideSyncAction({
        mark: { fingerprint: localFp, updatedAt: 50 },
        localFingerprint: localFp,
        remoteUpdatedAt,
      })
    ).toBe("adopt");
  });

  it("pushes when local changed but remote did not", () => {
    expect(
      decideSyncAction({
        mark: { fingerprint: "old-fp", updatedAt: remoteUpdatedAt },
        localFingerprint: localFp,
        remoteUpdatedAt,
      })
    ).toBe("push");
  });

  it("merges when both sides changed", () => {
    expect(
      decideSyncAction({
        mark: { fingerprint: "old-fp", updatedAt: 50 },
        localFingerprint: localFp,
        remoteUpdatedAt,
      })
    ).toBe("merge");
  });
});

describe("applyBackup", () => {
  it("replaces local pulls, statuses, and faves with backup contents", () => {
    setPulls("genshin", [makePull("local-only")]);
    setUnitStatus("hsr", "keep-out", "owned");
    setServantStatus("old-servant", "owned");

    applyBackup({
      version: 3,
      unitStatus: { fgo: { merlin: "owned" }, hsr: { "1001": "planning" } },
      faves: { hsr: { main: "unit-1" }, fgo: { c1: "merlin" } },
      pulls: { genshin: [makePull("remote-only")] },
    });

    expect(getPulls("genshin").map((p) => p.id)).toEqual(["remote-only"]);
    expect(getUnitStatuses("hsr")).toEqual({ "1001": "planning" });
    expect(getServantStatuses()).toEqual({ merlin: "owned" });
    expect(getGrandServants()).toEqual({ c1: "merlin" });
  });

  it("emits syncable-change notifications", () => {
    let notifications = 0;
    const unsubscribe = subscribeSyncableChange(() => {
      notifications += 1;
    });
    applyBackup({
      ...EMPTY_BACKUP,
      unitStatus: { fgo: { merlin: "owned" } },
      pulls: { genshin: [makePull("p1")] },
    });
    unsubscribe();
    expect(notifications).toBe(2);
  });
});

describe("sync mark", () => {
  it("roundtrips", () => {
    writeSyncMark({ fingerprint: "abc", updatedAt: 42 });
    expect(readSyncMark()).toEqual({ fingerprint: "abc", updatedAt: 42 });
  });

  it("returns null for corrupt or missing marks", () => {
    expect(readSyncMark()).toBeNull();
    localStorage.setItem("fbtn-sync-mark", "not-json");
    expect(readSyncMark()).toBeNull();
    localStorage.setItem("fbtn-sync-mark", JSON.stringify({ fingerprint: 1 }));
    expect(readSyncMark()).toBeNull();
  });
});
