import { describe, it, expect } from "vitest";
import {
  formatHi3DateRange,
  getHi3BannerTitle,
  getHi3Banners,
  getHi3Years,
  isHi3BannerActive,
} from "@/lib/hi3-data";
import type { Hi3Banner } from "@/types/hi3";

describe("hi3-data", () => {
  describe("getHi3Banners", () => {
    it("returns the full scraped dataset", () => {
      const banners = getHi3Banners();
      expect(banners).toHaveLength(73);
    });

    it("every entry is a battlesuit version banner", () => {
      const banners = getHi3Banners();
      banners.forEach((b) => expect(b.type).toBe("battlesuit"));
    });

    it("has unique ids and versions", () => {
      const banners = getHi3Banners();
      expect(new Set(banners.map((b) => b.id)).size).toBe(banners.length);
      expect(new Set(banners.map((b) => b.version)).size).toBe(banners.length);
    });

    it("each banner has required fields", () => {
      const banners = getHi3Banners();
      banners.forEach((banner) => {
        expect(banner.id).toBeTruthy();
        expect(banner.version).toMatch(/^\d+(\.\d+)+$/);
        expect(banner.phase).toBeNull();
        expect(banner.banners.length).toBe(1);
        expect(banner.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        if (banner.endDate !== null)
          expect(banner.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Array.isArray(banner.featured5)).toBe(true);
        expect(banner.featured4).toHaveLength(0);
      });
    });

    it("every banner has an absolute source url", () => {
      const banners = getHi3Banners();
      banners.forEach((banner) => {
        expect(banner.banners[0].url).toMatch(/^https:\/\//);
      });
    });

    it("all but the first global version have banner images", () => {
      const banners = getHi3Banners();
      const missing = banners.filter((b) => !b.banners[0].image);
      expect(missing).toHaveLength(1);
      expect(missing[0].id).toBe("version-1.8");
    });

    it("featured units are always named", () => {
      const banners = getHi3Banners();
      banners.forEach((banner) => {
        banner.featured5.forEach((f) => expect(f.name).toBeTruthy());
      });
    });

    it("66 of 73 versions list a debut battlesuit", () => {
      const banners = getHi3Banners();
      expect(banners.filter((b) => b.featured5.length > 0)).toHaveLength(66);
      expect(banners.filter((b) => b.featured5.length === 0)).toHaveLength(7);
    });

    it("dates are valid and start before end when end exists", () => {
      const banners = getHi3Banners();
      banners.forEach((banner) => {
        expect(Number.isNaN(Date.parse(banner.startDate))).toBe(false);
        if (banner.endDate) {
          expect(Number.isNaN(Date.parse(banner.endDate))).toBe(false);
          expect(banner.startDate < banner.endDate).toBe(true);
        }
      });
    });

    it("banners are sorted by date descending", () => {
      const banners = getHi3Banners();
      for (let i = 1; i < banners.length; i++) {
        expect(banners[i - 1].startDate >= banners[i].startDate).toBe(true);
      }
    });

    it("only the newest version lacks an end date", () => {
      const banners = getHi3Banners();
      const openEnded = banners.filter((b) => b.endDate === null);
      expect(openEnded).toHaveLength(1);
      expect(openEnded[0].id).toBe("version-9.0");
    });

    it("covers versions 1.8 through 9.0", () => {
      const banners = getHi3Banners();
      const versions = banners.map((b) => b.version);
      expect(versions).toContain("1.8");
      expect(versions).toContain("9.0");
      expect(versions).toContain("2.6.5");
      expect(versions.length).toBe(73);
    });
  });

  describe("getHi3Years", () => {
    it("returns years 2018-2026 sorted descending", () => {
      const years = getHi3Years();
      expect(years).toEqual([
        "2026",
        "2025",
        "2024",
        "2023",
        "2022",
        "2021",
        "2020",
        "2019",
        "2018",
      ]);
    });
  });

  describe("isHi3BannerActive", () => {
    const banner = (startDate: string, endDate: string | null): Hi3Banner => ({
      id: "test",
      type: "battlesuit",
      version: "9.0",
      phase: null,
      banners: [{ name: "Test", url: "https://example.com", image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
    });

    it("returns true during the version window", () => {
      const b = banner("2026-06-25", "2026-08-20");
      expect(isHi3BannerActive(b, new Date("2026-07-15T12:00:00"))).toBe(true);
    });

    it("returns false before the version starts", () => {
      const b = banner("2026-06-25", "2026-08-20");
      expect(isHi3BannerActive(b, new Date("2026-06-24T23:59:59"))).toBe(false);
    });

    it("returns false after the version ends", () => {
      const b = banner("2026-06-25", "2026-08-20");
      expect(isHi3BannerActive(b, new Date("2026-08-21T00:00:01"))).toBe(false);
    });

    it("returns true for the ongoing version with no end date", () => {
      const b = banner("2026-08-20", null);
      expect(isHi3BannerActive(b, new Date("2026-10-03T12:00:00"))).toBe(true);
    });

    it("returns false for a future ongoing version", () => {
      const b = banner("2026-08-20", null);
      expect(isHi3BannerActive(b, new Date("2026-08-19T12:00:00"))).toBe(false);
    });
  });

  describe("formatHi3DateRange", () => {
    const banner = (startDate: string, endDate: string | null): Hi3Banner => ({
      id: "test",
      type: "battlesuit",
      version: "9.0",
      phase: null,
      banners: [{ name: "Test", url: "https://example.com", image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
    });

    it("formats same-month ranges", () => {
      expect(formatHi3DateRange(banner("2024-12-18", "2024-12-31"))).toBe(
        "Dec 18 - 31, 2024"
      );
    });

    it("formats cross-month same-year ranges", () => {
      expect(formatHi3DateRange(banner("2026-06-25", "2026-08-20"))).toBe(
        "Jun 25 - Aug 20, 2026"
      );
    });

    it("formats cross-year ranges", () => {
      expect(formatHi3DateRange(banner("2025-12-30", "2026-02-05"))).toBe(
        "Dec 30, 2025 - Feb 5, 2026"
      );
    });

    it("formats the ongoing version", () => {
      expect(formatHi3DateRange(banner("2026-08-20", null))).toBe(
        "Aug 20, 2026 - Ongoing"
      );
    });
  });

  describe("getHi3BannerTitle", () => {
    it("returns the banner name", () => {
      const banner: Hi3Banner = {
        id: "test",
        type: "battlesuit",
        version: "9.0",
        phase: null,
        banners: [{ name: "Senadina (AstralOp)", url: null, image: null }],
        startDate: "2026-08-20",
        endDate: null,
        featured5: [],
        featured4: [],
      };
      expect(getHi3BannerTitle(banner)).toBe("Senadina (AstralOp)");
    });
  });
});
