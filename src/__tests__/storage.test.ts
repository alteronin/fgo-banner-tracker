import { describe, it, expect, beforeEach } from "vitest";
import {
  getServantStatuses,
  setServantStatus,
  getServantStatus,
} from "@/lib/storage";

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  describe("getServantStatuses", () => {
    it("returns empty object when no data", () => {
      expect(getServantStatuses()).toEqual({});
    });

    it("returns stored statuses", () => {
      window.localStorage.setItem(
        "fgo-servant-status",
        JSON.stringify({ "artoria": "owned", "merlin": "planning" })
      );
      const statuses = getServantStatuses();
      expect(statuses).toEqual({ artoria: "owned", merlin: "planning" });
    });
  });

  describe("setServantStatus", () => {
    it("adds a new status", () => {
      setServantStatus("artoria", "owned");
      expect(getServantStatus("artoria")).toBe("owned");
    });

    it("updates an existing status", () => {
      setServantStatus("artoria", "owned");
      setServantStatus("artoria", "planning");
      expect(getServantStatus("artoria")).toBe("planning");
    });

    it("removes status when set to none", () => {
      setServantStatus("artoria", "owned");
      setServantStatus("artoria", "none");
      expect(getServantStatus("artoria")).toBe("none");
    });

    it("persists multiple servants", () => {
      setServantStatus("artoria", "owned");
      setServantStatus("merlin", "planning");
      setServantStatus("waver", "owned");

      const statuses = getServantStatuses();
      expect(Object.keys(statuses)).toHaveLength(3);
      expect(statuses.artoria).toBe("owned");
      expect(statuses.merlin).toBe("planning");
      expect(statuses.waver).toBe("owned");
    });
  });

  describe("getServantStatus", () => {
    it("returns none for unknown servant", () => {
      expect(getServantStatus("unknown")).toBe("none");
    });

    it("returns correct status", () => {
      setServantStatus("artoria", "planning");
      expect(getServantStatus("artoria")).toBe("planning");
    });
  });
});
