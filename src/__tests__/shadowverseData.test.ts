import { describe, it, expect } from "vitest";
import {
  formatSvwbDateRange,
  getSvwbBannerTitle,
  getSvwbBanners,
  getSvwbYears,
  isSvwbBannerActive,
} from "@/lib/shadowverse-data";
import type { SvwbBanner } from "@/types/shadowverse";

describe("shadowverse-data", () => {
  describe("getSvwbBanners", () => {
    it("returns the full scraped dataset", () => {
      const banners = getSvwbBanners();
      expect(banners).toHaveLength(10);
    });

    it("has nine card sets and one collaboration", () => {
      const banners = getSvwbBanners();
      expect(banners.filter((b) => b.type === "set")).toHaveLength(9);
      expect(banners.filter((b) => b.type === "collab")).toHaveLength(1);
    });

    it("has unique ids", () => {
      const banners = getSvwbBanners();
      const unique = new Set(banners.map((b) => b.id));
      expect(unique.size).toBe(banners.length);
    });

    it("each banner has required fields", () => {
      const banners = getSvwbBanners();
      banners.forEach((banner) => {
        expect(banner.id).toBeTruthy();
        expect(["set", "collab"]).toContain(banner.type);
        expect(banner.version).toBeNull();
        expect(banner.phase).toBeNull();
        expect(banner.banners.length).toBe(1);
        expect(banner.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(banner.featured4).toHaveLength(0);
        expect(banner.featured5.length).toBeGreaterThan(0);
        banner.featured5.forEach((f) => expect(f.name).toBeTruthy());
      });
    });

    it("card sets are permanent and link to the official site", () => {
      const banners = getSvwbBanners();
      banners
        .filter((b) => b.type === "set")
        .forEach((b) => {
          expect(b.endDate).toBeNull();
          expect(b.banners[0].url).toMatch(
            /^https:\/\/shadowverse-wb\.com\/en\/cards\/pack\//
          );
        });
    });

    it("the collaboration has a bounded window within 60 days", () => {
      const collab = getSvwbBanners().find((b) => b.type === "collab")!;
      expect(collab.endDate).toBeTruthy();
      const days =
        (Date.parse(collab.endDate!) - Date.parse(collab.startDate)) / 86400000;
      expect(days).toBeGreaterThan(0);
      expect(days).toBeLessThanOrEqual(60);
      expect(collab.id).toBe("collab-frieren");
    });

    it("banners are sorted by date descending", () => {
      const banners = getSvwbBanners();
      for (let i = 1; i < banners.length; i++) {
        expect(banners[i - 1].startDate >= banners[i].startDate).toBe(true);
      }
    });

    it("covers every set from Legends Rise to Revenants of Azvaldt", () => {
      const banners = getSvwbBanners();
      const names = banners.map((b) => getSvwbBannerTitle(b));
      expect(names).toContain("Legends Rise");
      expect(names).toContain("Revenants of Azvaldt");
      expect(names).toContain("Skybound Dragons");
      expect(names).toContain("Frieren: Beyond Journey's End");
    });
  });

  describe("getSvwbYears", () => {
    it("returns 2026 and 2025 sorted descending", () => {
      expect(getSvwbYears()).toEqual(["2026", "2025"]);
    });
  });

  describe("isSvwbBannerActive", () => {
    const banner = (
      type: "set" | "collab",
      startDate: string,
      endDate: string | null
    ): SvwbBanner => ({
      id: type === "set" ? "set-test" : "collab-test",
      type,
      version: null,
      phase: null,
      banners: [{ name: "Test", url: null, image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
    });

    it("returns true for the current card set", () => {
      const b = banner("set", "2026-08-27", null);
      expect(isSvwbBannerActive(b, new Date("2026-10-03T12:00:00"))).toBe(true);
    });

    it("returns false for superseded card sets", () => {
      const b = banner("set", "2025-06-17", null);
      expect(isSvwbBannerActive(b, new Date("2026-10-03T12:00:00"))).toBe(false);
    });

    it("returns true for a collaboration during its window", () => {
      const b = banner("collab", "2025-12-29", "2026-01-27");
      expect(isSvwbBannerActive(b, new Date("2026-01-10T12:00:00"))).toBe(true);
    });

    it("returns false for a collaboration after its window", () => {
      const b = banner("collab", "2025-12-29", "2026-01-27");
      expect(isSvwbBannerActive(b, new Date("2026-01-28T00:00:01"))).toBe(false);
    });
  });

  describe("formatSvwbDateRange", () => {
    const banner = (startDate: string, endDate: string | null): SvwbBanner => ({
      id: "test",
      type: "set",
      version: null,
      phase: null,
      banners: [{ name: "Test", url: null, image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
    });

    it("formats permanent card sets", () => {
      expect(formatSvwbDateRange(banner("2025-06-17", null))).toBe(
        "Jun 17, 2025 - Permanent"
      );
    });

    it("formats collaboration windows", () => {
      expect(formatSvwbDateRange(banner("2025-12-29", "2026-01-27"))).toBe(
        "Dec 29, 2025 - Jan 27, 2026"
      );
    });

    it("formats same-month ranges", () => {
      expect(formatSvwbDateRange(banner("2026-06-29", "2026-06-30"))).toBe(
        "Jun 29 - 30, 2026"
      );
    });
  });

  describe("getSvwbBannerTitle", () => {
    it("returns the set name", () => {
      const banner: SvwbBanner = {
        id: "test",
        type: "set",
        version: null,
        phase: null,
        banners: [{ name: "Legends Rise", url: null, image: null }],
        startDate: "2025-06-17",
        endDate: null,
        featured5: [],
        featured4: [],
      };
      expect(getSvwbBannerTitle(banner)).toBe("Legends Rise");
    });
  });
});
