import { describe, it, expect } from "vitest";
import {
  formatWuwaDateRange,
  getWuwaBannerTitle,
  getWuwaBanners,
  getWuwaYears,
  isWuwaBannerActive,
} from "@/lib/wuwa-data";
import type { WuwaBanner } from "@/types/wuwa";

const sortKey = (b: WuwaBanner) => b.startDate ?? "0000-00-00";

describe("wuwa-data", () => {
  describe("getWuwaBanners", () => {
    it("returns the full scraped dataset", () => {
      const banners = getWuwaBanners();
      expect(banners).toHaveLength(46);
    });

    it("has the expected type distribution", () => {
      const banners = getWuwaBanners();
      expect(banners.filter((b) => b.type === "resonator")).toHaveLength(45);
      expect(banners.filter((b) => b.type === "selector")).toHaveLength(1);
    });

    it("has unique ids", () => {
      const banners = getWuwaBanners();
      const unique = new Set(banners.map((b) => b.id));
      expect(unique.size).toBe(banners.length);
    });

    it("each banner has required fields", () => {
      const banners = getWuwaBanners();
      banners.forEach((banner) => {
        expect(banner.id).toBeTruthy();
        expect(["resonator", "selector"]).toContain(banner.type);
        expect(banner.version).toMatch(/^\d+\.\d+$/);
        expect(banner.banners.length).toBeGreaterThan(0);
        if (banner.startDate !== null)
          expect(banner.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (banner.endDate !== null)
          expect(banner.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Array.isArray(banner.featured5)).toBe(true);
        expect(Array.isArray(banner.featured4)).toBe(true);
        expect(Array.isArray(banner.featuredWeapons)).toBe(true);
      });
    });

    it("each banner image is non-null with absolute urls", () => {
      const banners = getWuwaBanners();
      banners.forEach((banner) => {
        banner.banners.forEach((b) => {
          expect(b.image).toBeTruthy();
          expect(b.url).toMatch(/^https:\/\//);
        });
        banner.featured5.forEach((f) => {
          expect(f.name).toBeTruthy();
          expect(f.url).toMatch(/^https:\/\//);
        });
      });
    });

    it("dated banners have valid ranges within 60 days", () => {
      const banners = getWuwaBanners();
      banners.forEach((banner) => {
        if (!banner.startDate || !banner.endDate) return;
        expect(Number.isNaN(Date.parse(banner.startDate))).toBe(false);
        expect(Number.isNaN(Date.parse(banner.endDate))).toBe(false);
        expect(banner.startDate < banner.endDate).toBe(true);
        const days =
          (Date.parse(banner.endDate) - Date.parse(banner.startDate)) / 86400000;
        expect(days).toBeLessThanOrEqual(60);
      });
    });

    it("banners are sorted by date descending with the selector last", () => {
      const banners = getWuwaBanners();
      for (let i = 1; i < banners.length; i++) {
        expect(sortKey(banners[i - 1]) >= sortKey(banners[i])).toBe(true);
      }
      expect(banners[banners.length - 1].startDate).toBeNull();
    });

    it("every banner lists featured resonators and weapons", () => {
      const banners = getWuwaBanners();
      banners.forEach((banner) => {
        expect(banner.featured5.length).toBeGreaterThan(0);
        expect(banner.featuredWeapons.length).toBeGreaterThan(0);
      });
    });

    it("only the Special Reverbs selector omits dates and phase", () => {
      const banners = getWuwaBanners();
      const undated = banners.filter((b) => b.startDate === null);
      expect(undated).toHaveLength(1);
      expect(undated[0].type).toBe("selector");
      expect(undated[0].phase).toBeNull();
      expect(banners.filter((b) => b.phase === null)).toHaveLength(1);
    });

    it("covers versions 1.0 through 3.7 (22 total)", () => {
      const banners = getWuwaBanners();
      const versions = [...new Set(banners.map((b) => b.version))];
      expect(versions.length).toBe(22);
      expect(versions).toContain("1.0");
      expect(versions).toContain("3.7");
      expect(versions).not.toContain("1.5");
    });
  });

  describe("getWuwaYears", () => {
    it("returns years sorted descending as strings", () => {
      const years = getWuwaYears();
      expect(years).toEqual(["2026", "2025", "2024"]);
    });
  });

  describe("isWuwaBannerActive", () => {
    const banner = (
      startDate: string | null,
      endDate: string | null
    ): WuwaBanner => ({
      id: "test",
      type: "resonator",
      version: "3.7",
      phase: 1,
      banners: [{ name: "Test", url: "https://example.com", image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
      featuredWeapons: [],
    });

    it("returns true during the banner window", () => {
      const b = banner("2026-09-30", "2026-10-22");
      expect(isWuwaBannerActive(b, new Date("2026-10-03T12:00:00"))).toBe(true);
    });

    it("returns false before the banner starts", () => {
      const b = banner("2026-09-30", "2026-10-22");
      expect(isWuwaBannerActive(b, new Date("2026-09-29T23:59:59"))).toBe(false);
    });

    it("returns false after the banner ends", () => {
      const b = banner("2026-09-30", "2026-10-22");
      expect(isWuwaBannerActive(b, new Date("2026-10-23T00:00:01"))).toBe(false);
    });

    it("returns false for the undated selector", () => {
      const b = banner(null, null);
      expect(isWuwaBannerActive(b, new Date("2026-10-03T12:00:00"))).toBe(false);
    });
  });

  describe("formatWuwaDateRange", () => {
    const banner = (
      startDate: string | null,
      endDate: string | null
    ): WuwaBanner => ({
      id: "test",
      type: "resonator",
      version: "3.7",
      phase: 1,
      banners: [{ name: "Test", url: "https://example.com", image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
      featuredWeapons: [],
    });

    it("formats same-month ranges", () => {
      expect(formatWuwaDateRange(banner("2026-10-01", "2026-10-21"))).toBe(
        "Oct 1 - 21, 2026"
      );
    });

    it("formats cross-month same-year ranges", () => {
      expect(formatWuwaDateRange(banner("2026-09-30", "2026-10-22"))).toBe(
        "Sep 30 - Oct 22, 2026"
      );
    });

    it("formats cross-year ranges", () => {
      expect(formatWuwaDateRange(banner("2024-12-30", "2025-01-21"))).toBe(
        "Dec 30, 2024 - Jan 21, 2025"
      );
    });

    it("formats undated banners", () => {
      expect(formatWuwaDateRange(banner(null, null))).toBe("No dates listed");
    });
  });

  describe("getWuwaBannerTitle", () => {
    it("joins multiple banner names", () => {
      const banner: WuwaBanner = {
        id: "test",
        type: "resonator",
        version: "3.7",
        phase: 1,
        banners: [
          { name: "First", url: "https://example.com/1", image: null },
          { name: "Second", url: "https://example.com/2", image: null },
        ],
        startDate: "2026-09-30",
        endDate: "2026-10-22",
        featured5: [],
        featured4: [],
        featuredWeapons: [],
      };
      expect(getWuwaBannerTitle(banner)).toBe("First / Second");
    });
  });
});
