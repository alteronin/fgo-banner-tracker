import { describe, it, expect, beforeEach } from "vitest";
import {
  favesStorageKey,
  fillOwnedUnits,
  getFaves,
  getFavesServerSnapshot,
  getFavesSnapshot,
  getUnitStatus,
  getUnitStatuses,
  getUnitStatusesServerSnapshot,
  getUnitStatusesSnapshot,
  notifyFavesChange,
  notifyUnitStatusesChange,
  setFave,
  setUnitStatus,
  subscribeFaves,
  subscribeUnitStatuses,
  unitStatusKey,
} from "@/lib/unitStorage";

describe("unitStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("keys", () => {
    it("builds namespaced keys", () => {
      expect(unitStatusKey("zzz")).toBe("unit-status:zzz");
      expect(favesStorageKey("zzz")).toBe("faves:zzz");
    });
  });

  describe("statuses", () => {
    it("returns empty object when no data", () => {
      expect(getUnitStatuses("genshin")).toEqual({});
    });

    it("stores statuses under the game key", () => {
      setUnitStatus("genshin", "nahida", "owned");
      setUnitStatus("genshin", "kazuha", "planning");
      expect(
        window.localStorage.getItem("unit-status:genshin")
      ).toBeTruthy();
      expect(getUnitStatus("genshin", "nahida")).toBe("owned");
      expect(getUnitStatus("genshin", "kazuha")).toBe("planning");
    });

    it("keeps games isolated", () => {
      setUnitStatus("genshin", "nahida", "owned");
      expect(getUnitStatuses("hsr")).toEqual({});
      expect(getUnitStatus("hsr", "nahida")).toBe("none");
    });

    it("removes status when set to none", () => {
      setUnitStatus("zzz", "miyabi", "owned");
      setUnitStatus("zzz", "miyabi", "none");
      expect(getUnitStatus("zzz", "miyabi")).toBe("none");
      expect(window.localStorage.getItem("unit-status:zzz")).toBeNull();
    });

    it("removes the key when the last status clears", () => {
      setUnitStatus("wuwa", "jiyan", "owned");
      setUnitStatus("wuwa", "jiyan", "none");
      expect(window.localStorage.getItem("unit-status:wuwa")).toBeNull();
    });
  });

  describe("faves", () => {
    it("returns empty object when no data", () => {
      expect(getFaves("hi3")).toEqual({});
    });

    it("assigns and clears slots", () => {
      setFave("hi3", "1", "white-comet");
      setFave("hi3", "2", "yamabuki-armor");
      expect(getFaves("hi3")).toEqual({
        "1": "white-comet",
        "2": "yamabuki-armor",
      });

      setFave("hi3", "1", "");
      expect(getFaves("hi3")).toEqual({ "2": "yamabuki-armor" });

      setFave("hi3", "2", "");
      expect(window.localStorage.getItem("faves:hi3")).toBeNull();
    });

    it("keeps games isolated", () => {
      setFave("zzz", "1", "miyabi");
      expect(getFaves("wuwa")).toEqual({});
    });
  });

  describe("fillOwnedUnits", () => {
    it("marks unset units as owned and reports the count", () => {
      expect(fillOwnedUnits("genshin", ["nahida", "kazuha"])).toBe(2);
      expect(getUnitStatus("genshin", "nahida")).toBe("owned");
      expect(getUnitStatus("genshin", "kazuha")).toBe("owned");
    });

    it("never overwrites existing statuses", () => {
      setUnitStatus("genshin", "nahida", "planning");
      setUnitStatus("genshin", "kazuha", "owned");

      expect(fillOwnedUnits("genshin", ["nahida", "kazuha", "furina"])).toBe(1);
      expect(getUnitStatus("genshin", "nahida")).toBe("planning");
      expect(getUnitStatus("genshin", "kazuha")).toBe("owned");
      expect(getUnitStatus("genshin", "furina")).toBe("owned");
    });

    it("returns zero when everything is already marked", () => {
      setUnitStatus("wuwa", "jiyan", "owned");
      expect(fillOwnedUnits("wuwa", ["jiyan"])).toBe(0);
      expect(fillOwnedUnits("wuwa", [])).toBe(0);
    });
  });

  describe("snapshots", () => {
    it("returns a stable reference until statuses change", () => {
      const before = getUnitStatusesSnapshot("zzz");
      expect(getUnitStatusesSnapshot("zzz")).toBe(before);

      setUnitStatus("zzz", "miyabi", "owned");
      const after = getUnitStatusesSnapshot("zzz");
      expect(after).not.toBe(before);
      expect(after).toEqual({ miyabi: "owned" });
    });

    it("returns a stable reference until faves change", () => {
      const before = getFavesSnapshot("zzz");
      expect(getFavesSnapshot("zzz")).toBe(before);

      setFave("zzz", "1", "miyabi");
      const after = getFavesSnapshot("zzz");
      expect(after).not.toBe(before);
      expect(after).toEqual({ "1": "miyabi" });
    });

    it("returns stable empty server snapshots", () => {
      expect(getUnitStatusesServerSnapshot()).toBe(
        getUnitStatusesServerSnapshot()
      );
      expect(getFavesServerSnapshot()).toBe(getFavesServerSnapshot());
    });
  });

  describe("subscriptions", () => {
    it("notifies status listeners for the game", () => {
      let calls = 0;
      const unsubscribe = subscribeUnitStatuses("zzz", () => calls++);
      setUnitStatus("zzz", "miyabi", "owned");
      notifyUnitStatusesChange("zzz");
      expect(calls).toBe(1);
      unsubscribe();
      notifyUnitStatusesChange("zzz");
      expect(calls).toBe(1);
    });

    it("notifies faves listeners for the game", () => {
      let calls = 0;
      const unsubscribe = subscribeFaves("wuwa", () => calls++);
      setFave("wuwa", "1", "jiyan");
      notifyFavesChange("wuwa");
      expect(calls).toBe(1);
      unsubscribe();
      notifyFavesChange("wuwa");
      expect(calls).toBe(1);
    });

    it("does not notify listeners of other games", () => {
      let calls = 0;
      const unsubscribe = subscribeUnitStatuses("hsr", () => calls++);
      notifyUnitStatusesChange("genshin");
      expect(calls).toBe(0);
      unsubscribe();
    });
  });
});
