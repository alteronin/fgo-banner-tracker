import { describe, it, expect } from "vitest";
import {
  clearPulls,
  getPulls,
  getPullsRaw,
  getPullsServerSnapshot,
  getPullsSnapshot,
  isGamePull,
  mergePulls,
  notifyPullsChange,
  pullsStorageKey,
  setPulls,
  subscribePulls,
  toPulls,
} from "@/lib/pullStorage";
import type { GamePull } from "@/types/pulls";

function pull(overrides: Partial<GamePull> = {}): GamePull {
  return {
    id: "id-1",
    gameId: "hsr",
    itemId: "1001",
    unitId: "850001",
    name: "March 7th",
    rarity: 4,
    ts: 1700000000000,
    category: "standard",
    ...overrides,
  };
}

describe("pullStorage", () => {
  describe("keys", () => {
    it("builds namespaced keys", () => {
      expect(pullsStorageKey("wuwa")).toBe("pulls:wuwa");
    });
  });

  describe("validation", () => {
    it("accepts well-formed pulls and rejects the rest", () => {
      expect(isGamePull(pull())).toBe(true);
      expect(isGamePull({ ...pull(), ts: "nope" })).toBe(false);
      expect(isGamePull({})).toBe(false);
      expect(isGamePull(null)).toBe(false);
    });

    it("filters and sorts raw arrays", () => {
      const sorted = toPulls([
        pull({ id: "b", ts: 2000 }),
        { broken: true },
        pull({ id: "a", ts: 1000 }),
      ]);
      expect(sorted.map((entry) => entry.id)).toEqual(["a", "b"]);
      expect(toPulls("nope")).toEqual([]);
    });
  });

  describe("reading and writing", () => {
    it("returns an empty list when nothing is stored", () => {
      expect(getPulls("hsr")).toEqual([]);
      expect(getPullsRaw("hsr")).toBeNull();
    });

    it("stores pulls sorted by timestamp", () => {
      const ok = setPulls("hsr", [
        pull({ id: "b", ts: 2000 }),
        pull({ id: "a", ts: 1000 }),
      ]);
      expect(ok).toBe(true);
      expect(getPulls("hsr").map((entry) => entry.id)).toEqual(["a", "b"]);
    });

    it("removes the key when the list empties", () => {
      setPulls("zzz", [pull({ gameId: "zzz" })]);
      setPulls("zzz", []);
      expect(getPullsRaw("zzz")).toBeNull();
    });

    it("keeps games isolated", () => {
      setPulls("genshin", [pull({ gameId: "genshin" })]);
      expect(getPulls("wuwa")).toEqual([]);
    });

    it("clears stored pulls", () => {
      setPulls("hsr", [pull()]);
      clearPulls("hsr");
      expect(getPulls("hsr")).toEqual([]);
    });
  });

  describe("mergePulls", () => {
    it("adds only new pull ids and reports counts", () => {
      setPulls("hsr", [pull({ id: "a", ts: 1000 })]);
      const first = mergePulls("hsr", [
        pull({ id: "a", ts: 1000 }),
        pull({ id: "b", ts: 2000 }),
      ]);
      expect(first).toEqual({ added: 1, total: 2, ok: true });

      const second = mergePulls("hsr", [
        pull({ id: "a", ts: 1000 }),
        pull({ id: "b", ts: 2000 }),
      ]);
      expect(second).toEqual({ added: 0, total: 2, ok: true });
      expect(getPulls("hsr")).toHaveLength(2);
    });

    it("merges into an empty store", () => {
      const result = mergePulls("wuwa", [pull({ gameId: "wuwa" })]);
      expect(result).toEqual({ added: 1, total: 1, ok: true });
      expect(getPulls("wuwa")).toHaveLength(1);
    });
  });

  describe("snapshots", () => {
    it("returns a stable reference until pulls change", () => {
      const before = getPullsSnapshot("hsr");
      expect(getPullsSnapshot("hsr")).toBe(before);

      setPulls("hsr", [pull()]);
      const after = getPullsSnapshot("hsr");
      expect(after).not.toBe(before);
      expect(after).toHaveLength(1);
    });

    it("returns a stable empty server snapshot", () => {
      expect(getPullsServerSnapshot()).toBe(getPullsServerSnapshot());
    });
  });

  describe("subscriptions", () => {
    it("notifies listeners for the game", () => {
      let calls = 0;
      const unsubscribe = subscribePulls("hsr", () => calls++);
      notifyPullsChange("hsr");
      expect(calls).toBe(1);
      notifyPullsChange("genshin");
      expect(calls).toBe(1);
      unsubscribe();
      notifyPullsChange("hsr");
      expect(calls).toBe(1);
    });
  });
});
