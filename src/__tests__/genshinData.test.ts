import { describe, it, expect } from "vitest";
import {
  formatGenshinDateRange,
  getGenshinBannerTitle,
  getGenshinBanners,
  getGenshinYears,
  isGenshinBannerActive,
} from "@/lib/genshin-data";
import type { GenshinBanner } from "@/types/genshin";

describe("genshin-data", () => {
  describe("getGenshinBanners", () => {
    it("returns the full scraped dataset", () => {
      const banners = getGenshinBanners();
      expect(banners).toHaveLength(216);
    });

    it("has the expected type distribution", () => {
      const banners = getGenshinBanners();
      expect(banners.filter((b) => b.type === "character")).toHaveLength(105);
      expect(banners.filter((b) => b.type === "weapon")).toHaveLength(104);
      expect(banners.filter((b) => b.type === "chronicled")).toHaveLength(7);
    });

    it("has unique ids", () => {
      const banners = getGenshinBanners();
      const unique = new Set(banners.map((b) => b.id));
      expect(unique.size).toBe(banners.length);
    });

    it("each banner has required fields", () => {
      const banners = getGenshinBanners();
      banners.forEach((banner) => {
        expect(banner.id).toBeTruthy();
        expect(["character", "weapon", "chronicled"]).toContain(banner.type);
        expect(banner.version).toMatch(/^\d+\.\d+$/);
        expect(banner.banners.length).toBeGreaterThan(0);
        expect(banner.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(banner.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Array.isArray(banner.featured5)).toBe(true);
        expect(Array.isArray(banner.featured4)).toBe(true);
      });
    });

    it("each banner has a non-null image and an absolute url when linked", () => {
      const banners = getGenshinBanners();
      banners.forEach((banner) => {
        banner.banners.forEach((b) => {
          expect(b.image).toBeTruthy();
          if (b.url !== null) expect(b.url).toMatch(/^https:\/\//);
        });
      });
    });

    it("dates are valid and start before end", () => {
      const banners = getGenshinBanners();
      banners.forEach((banner) => {
        const start = Date.parse(banner.startDate);
        const end = Date.parse(banner.endDate);
        expect(Number.isNaN(start)).toBe(false);
        expect(Number.isNaN(end)).toBe(false);
        expect(start).toBeLessThan(end);
      });
    });

    it("spans never exceed 60 days (guards bad year typos)", () => {
      const banners = getGenshinBanners();
      banners.forEach((banner) => {
        const days =
          (Date.parse(banner.endDate) - Date.parse(banner.startDate)) / 86400000;
        expect(days).toBeLessThanOrEqual(60);
      });
    });

    it("banners are sorted by date descending", () => {
      const banners = getGenshinBanners();
      for (let i = 1; i < banners.length; i++) {
        expect(banners[i - 1].startDate >= banners[i].startDate).toBe(true);
      }
    });

    it("character and weapon banners list featured 5-star units", () => {
      const banners = getGenshinBanners();
      banners
        .filter((b) => b.type !== "chronicled")
        .forEach((banner) => {
          expect(banner.featured5.length).toBeGreaterThan(0);
        });
    });

    it("featured rate-ups have names and absolute urls", () => {
      const banners = getGenshinBanners();
      banners.forEach((banner) => {
        [...banner.featured5, ...banner.featured4].forEach((rateUp) => {
          expect(rateUp.name).toBeTruthy();
          expect(rateUp.url).toMatch(/^https:\/\//);
        });
      });
    });

    it("chronicled banners have no fixed phase or featured units", () => {
      const banners = getGenshinBanners();
      banners
        .filter((b) => b.type === "chronicled")
        .forEach((banner) => {
          expect(banner.phase).toBeNull();
          expect(banner.featured5).toHaveLength(0);
          expect(banner.featured4).toHaveLength(0);
        });
    });
  });

  describe("getGenshinYears", () => {
    it("returns years sorted descending as strings", () => {
      const years = getGenshinYears();
      expect(years.length).toBeGreaterThan(1);
      for (let i = 1; i < years.length; i++) {
        expect(Number(years[i - 1])).toBeGreaterThan(Number(years[i]));
      }
    });

    it("years cover the full dataset range", () => {
      const years = getGenshinYears();
      expect(years[0]).toBe("2026");
      expect(years[years.length - 1]).toBe("2020");
    });
  });

  describe("isGenshinBannerActive", () => {
    const banner = (startDate: string, endDate: string): GenshinBanner => ({
      id: "test",
      type: "character",
      version: "7.0",
      phase: 1,
      banners: [{ name: "Test", url: "https://example.com", image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
    });

    it("returns true during the banner window", () => {
      const b = banner("2026-09-01", "2026-09-23");
      expect(isGenshinBannerActive(b, new Date("2026-09-10T12:00:00"))).toBe(true);
    });

    it("returns false before the banner starts", () => {
      const b = banner("2026-09-01", "2026-09-23");
      expect(isGenshinBannerActive(b, new Date("2026-08-31T23:59:59"))).toBe(false);
    });

    it("returns false after the banner ends", () => {
      const b = banner("2026-09-01", "2026-09-23");
      expect(isGenshinBannerActive(b, new Date("2026-09-24T00:00:01"))).toBe(false);
    });
  });

  describe("formatGenshinDateRange", () => {
    const banner = (startDate: string, endDate: string): GenshinBanner => ({
      id: "test",
      type: "character",
      version: "7.0",
      phase: 1,
      banners: [{ name: "Test", url: "https://example.com", image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
    });

    it("formats same-month ranges", () => {
      expect(formatGenshinDateRange(banner("2026-09-01", "2026-09-23"))).toBe(
        "Sep 1 - 23, 2026"
      );
    });

    it("formats cross-month same-year ranges", () => {
      expect(formatGenshinDateRange(banner("2023-08-16", "2023-09-05"))).toBe(
        "Aug 16 - Sep 5, 2023"
      );
    });

    it("formats cross-year ranges", () => {
      expect(formatGenshinDateRange(banner("2020-12-23", "2021-01-12"))).toBe(
        "Dec 23, 2020 - Jan 12, 2021"
      );
    });
  });

  describe("getGenshinBannerTitle", () => {
    it("joins multiple banner names", () => {
      const banner: GenshinBanner = {
        id: "test",
        type: "character",
        version: "7.0",
        phase: 2,
        banners: [
          { name: "First", url: "https://example.com/1", image: null },
          { name: "Second", url: "https://example.com/2", image: null },
        ],
        startDate: "2026-09-01",
        endDate: "2026-09-23",
        featured5: [],
        featured4: [],
      };
      expect(getGenshinBannerTitle(banner)).toBe("First / Second");
    });
  });
});
