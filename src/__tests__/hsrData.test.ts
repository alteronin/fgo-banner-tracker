import { describe, it, expect } from "vitest";
import {
  formatHsrDateRange,
  getHsrBannerTitle,
  getHsrBanners,
  getHsrYears,
  isHsrBannerActive,
} from "@/lib/hsr-data";
import type { HsrBanner } from "@/types/hsr";

describe("hsr-data", () => {
  describe("getHsrBanners", () => {
    it("returns the full scraped dataset", () => {
      const banners = getHsrBanners();
      expect(banners).toHaveLength(131);
    });

    it("has the expected type distribution", () => {
      const banners = getHsrBanners();
      expect(banners.filter((b) => b.type === "character")).toHaveLength(66);
      expect(banners.filter((b) => b.type === "lightcone")).toHaveLength(65);
    });

    it("has unique ids", () => {
      const banners = getHsrBanners();
      const unique = new Set(banners.map((b) => b.id));
      expect(unique.size).toBe(banners.length);
    });

    it("each banner has required fields", () => {
      const banners = getHsrBanners();
      banners.forEach((banner) => {
        expect(banner.id).toBeTruthy();
        expect(["character", "lightcone"]).toContain(banner.type);
        if (banner.version !== null) expect(banner.version).toMatch(/^\d+\.\d+$/);
        expect(banner.banners.length).toBeGreaterThan(0);
        expect(banner.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (banner.endDate !== null) {
          expect(banner.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        }
        expect(Array.isArray(banner.featured5)).toBe(true);
        expect(Array.isArray(banner.featured4)).toBe(true);
      });
    });

    it("each banner has a non-null image and absolute urls", () => {
      const banners = getHsrBanners();
      banners.forEach((banner) => {
        banner.banners.forEach((b) => {
          expect(b.image).toBeTruthy();
          expect(b.url).toMatch(/^https:\/\//);
        });
        [...banner.featured5, ...banner.featured4].forEach((f) => {
          expect(f.name).toBeTruthy();
          expect(f.image).toBeTruthy();
          expect(f.url).toMatch(/^https:\/\//);
        });
      });
    });

    it("dates are valid and start before end when end exists", () => {
      const banners = getHsrBanners();
      banners.forEach((banner) => {
        expect(Number.isNaN(Date.parse(banner.startDate))).toBe(false);
        if (banner.endDate) {
          expect(Number.isNaN(Date.parse(banner.endDate))).toBe(false);
          expect(banner.startDate < banner.endDate).toBe(true);
        }
      });
    });

    it("spans never exceed 60 days (guards bad year typos)", () => {
      const banners = getHsrBanners();
      banners.forEach((banner) => {
        if (!banner.endDate) return;
        const days =
          (Date.parse(banner.endDate) - Date.parse(banner.startDate)) / 86400000;
        expect(days).toBeLessThanOrEqual(60);
      });
    });

    it("banners are sorted by date descending", () => {
      const banners = getHsrBanners();
      for (let i = 1; i < banners.length; i++) {
        expect(banners[i - 1].startDate >= banners[i].startDate).toBe(true);
      }
    });

    it("every entry lists featured 5-star units", () => {
      const banners = getHsrBanners();
      banners.forEach((banner) => {
        expect(banner.featured5.length).toBeGreaterThan(0);
      });
    });

    it("each version-phase has exactly one character and one light cone entry", () => {
      const banners = getHsrBanners();
      const groups = new Map<string, number>();
      banners
        .filter((b) => b.version !== null)
        .forEach((b) => {
          const key = `${b.version}-p${b.phase}-${b.type}`;
          groups.set(key, (groups.get(key) ?? 0) + 1);
        });
      groups.forEach((count, key) => {
        expect(count, `group ${key}`).toBe(1);
      });
    });

    it("collaboration banners have no version, phase, or end date", () => {
      const banners = getHsrBanners();
      const collab = banners.filter((b) => b.version === null);
      expect(collab).toHaveLength(4);
      collab.forEach((banner) => {
        expect(banner.phase).toBeNull();
        expect(banner.endDate).toBeNull();
      });
    });

    it("versions span 1.0 to 4.7", () => {
      const banners = getHsrBanners();
      const versions = [
        ...new Set(banners.map((b) => b.version).filter((v) => v !== null)),
      ];
      expect(versions).toContain("1.0");
      expect(versions).toContain("4.7");
      expect(versions.length).toBe(32);
    });
  });

  describe("getHsrYears", () => {
    it("returns years sorted descending as strings", () => {
      const years = getHsrYears();
      expect(years.length).toBeGreaterThan(1);
      for (let i = 1; i < years.length; i++) {
        expect(Number(years[i - 1])).toBeGreaterThan(Number(years[i]));
      }
    });

    it("years cover the full dataset range", () => {
      const years = getHsrYears();
      expect(years[0]).toBe("2026");
      expect(years[years.length - 1]).toBe("2023");
    });
  });

  describe("isHsrBannerActive", () => {
    const banner = (startDate: string, endDate: string | null): HsrBanner => ({
      id: "test",
      type: "character",
      version: "4.6",
      phase: 1,
      banners: [{ name: "Test", url: "https://example.com", image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
    });

    it("returns true during the banner window", () => {
      const b = banner("2026-09-27", "2026-10-21");
      expect(isHsrBannerActive(b, new Date("2026-10-03T12:00:00"))).toBe(true);
    });

    it("returns false before the banner starts", () => {
      const b = banner("2026-09-27", "2026-10-21");
      expect(isHsrBannerActive(b, new Date("2026-09-26T23:59:59"))).toBe(false);
    });

    it("returns false after the banner ends", () => {
      const b = banner("2026-09-27", "2026-10-21");
      expect(isHsrBannerActive(b, new Date("2026-10-22T00:00:01"))).toBe(false);
    });

    it("returns false for TBA-ended banners", () => {
      const b = banner("2025-07-11", null);
      expect(isHsrBannerActive(b, new Date("2025-07-15T12:00:00"))).toBe(false);
    });
  });

  describe("formatHsrDateRange", () => {
    const banner = (startDate: string, endDate: string | null): HsrBanner => ({
      id: "test",
      type: "character",
      version: "4.6",
      phase: 1,
      banners: [{ name: "Test", url: "https://example.com", image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
    });

    it("formats same-month ranges", () => {
      expect(formatHsrDateRange(banner("2025-02-05", "2025-02-25"))).toBe(
        "Feb 5 - 25, 2025"
      );
    });

    it("formats cross-month same-year ranges", () => {
      expect(formatHsrDateRange(banner("2026-09-27", "2026-10-21"))).toBe(
        "Sep 27 - Oct 21, 2026"
      );
    });

    it("formats cross-year ranges", () => {
      expect(formatHsrDateRange(banner("2023-12-26", "2024-01-17"))).toBe(
        "Dec 26, 2023 - Jan 17, 2024"
      );
    });

    it("formats TBA end dates", () => {
      expect(formatHsrDateRange(banner("2025-07-11", null))).toBe(
        "Jul 11, 2025 - TBA"
      );
    });
  });

  describe("getHsrBannerTitle", () => {
    it("joins multiple banner names", () => {
      const banner: HsrBanner = {
        id: "test",
        type: "character",
        version: "4.6",
        phase: 1,
        banners: [
          { name: "First", url: "https://example.com/1", image: null },
          { name: "Second", url: "https://example.com/2", image: null },
        ],
        startDate: "2026-09-27",
        endDate: "2026-10-21",
        featured5: [],
        featured4: [],
      };
      expect(getHsrBannerTitle(banner)).toBe("First / Second");
    });
  });
});
