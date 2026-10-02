import { describe, it, expect } from "vitest";
import {
  formatZzzDateRange,
  getZzzBannerTitle,
  getZzzBanners,
  getZzzYears,
  isZzzBannerActive,
} from "@/lib/zzz-data";
import type { ZzzBanner } from "@/types/zzz";

describe("zzz-data", () => {
  describe("getZzzBanners", () => {
    it("returns the full scraped dataset", () => {
      const banners = getZzzBanners();
      expect(banners).toHaveLength(134);
    });

    it("has the expected type distribution", () => {
      const banners = getZzzBanners();
      expect(banners.filter((b) => b.type === "agent")).toHaveLength(67);
      expect(banners.filter((b) => b.type === "wengine")).toHaveLength(67);
    });

    it("has unique ids", () => {
      const banners = getZzzBanners();
      const unique = new Set(banners.map((b) => b.id));
      expect(unique.size).toBe(banners.length);
    });

    it("each banner has required fields", () => {
      const banners = getZzzBanners();
      banners.forEach((banner) => {
        expect(banner.id).toBeTruthy();
        expect(["agent", "wengine"]).toContain(banner.type);
        if (banner.version !== null) expect(banner.version).toMatch(/^\d+\.\d+$/);
        expect(banner.banners.length).toBeGreaterThan(0);
        expect(banner.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(banner.endDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(Array.isArray(banner.featured5)).toBe(true);
        expect(Array.isArray(banner.featured4)).toBe(true);
      });
    });

    it("each banner image is non-null with absolute urls", () => {
      const banners = getZzzBanners();
      banners.forEach((banner) => {
        banner.banners.forEach((b) => {
          expect(b.image).toBeTruthy();
          expect(b.url).toMatch(/^https:\/\//);
        });
        banner.featured5.forEach((f) => {
          expect(f.name).toBeTruthy();
        });
      });
    });

    it("dates are valid and start before end", () => {
      const banners = getZzzBanners();
      banners.forEach((banner) => {
        expect(Number.isNaN(Date.parse(banner.startDate))).toBe(false);
        expect(Number.isNaN(Date.parse(banner.endDate!))).toBe(false);
        expect(banner.startDate < banner.endDate!).toBe(true);
      });
    });

    it("spans never exceed 60 days (guards bad year typos)", () => {
      const banners = getZzzBanners();
      banners.forEach((banner) => {
        const days =
          (Date.parse(banner.endDate!) - Date.parse(banner.startDate)) / 86400000;
        expect(days).toBeLessThanOrEqual(60);
      });
    });

    it("banners are sorted by date descending", () => {
      const banners = getZzzBanners();
      for (let i = 1; i < banners.length; i++) {
        expect(banners[i - 1].startDate >= banners[i].startDate).toBe(true);
      }
    });

    it("agent banners list featured units except the generic Rescreening channel", () => {
      const banners = getZzzBanners();
      const agents = banners.filter((b) => b.type === "agent");
      expect(agents.filter((b) => b.featured5.length > 0)).toHaveLength(65);
      agents
        .filter((b) => b.featured5.length === 0)
        .forEach((b) => {
          expect(getZzzBannerTitle(b)).toContain("Exclusive Rescreening");
        });
    });

    it("w-engine banners do not list separate featured units", () => {
      const banners = getZzzBanners();
      banners
        .filter((b) => b.type === "wengine")
        .forEach((b) => expect(b.featured5).toHaveLength(0));
    });

    it("covers versions 1.0 through 3.2 (2.9 and 1.8/1.9 skipped by game)", () => {
      const banners = getZzzBanners();
      const versions = [
        ...new Set(banners.map((b) => b.version).filter((v) => v !== null)),
      ];
      expect(versions.length).toBe(20);
      expect(versions).toContain("1.0");
      expect(versions).toContain("3.2");
      expect(versions).not.toContain("2.9");
    });

    it("eight late entries omit the phase label", () => {
      const banners = getZzzBanners();
      expect(banners.filter((b) => b.phase === null)).toHaveLength(8);
    });
  });

  describe("getZzzYears", () => {
    it("returns years sorted descending as strings", () => {
      const years = getZzzYears();
      expect(years[0]).toBe("2026");
      expect(years[years.length - 1]).toBe("2024");
    });
  });

  describe("isZzzBannerActive", () => {
    const banner = (startDate: string, endDate: string | null): ZzzBanner => ({
      id: "test",
      type: "agent",
      version: "3.2",
      phase: 1,
      banners: [{ name: "Test", url: "https://example.com", image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
    });

    it("returns true during the banner window", () => {
      const b = banner("2026-09-09", "2026-09-30");
      expect(isZzzBannerActive(b, new Date("2026-09-15T12:00:00"))).toBe(true);
    });

    it("returns false before the banner starts", () => {
      const b = banner("2026-09-09", "2026-09-30");
      expect(isZzzBannerActive(b, new Date("2026-09-08T23:59:59"))).toBe(false);
    });

    it("returns false after the banner ends", () => {
      const b = banner("2026-09-09", "2026-09-30");
      expect(isZzzBannerActive(b, new Date("2026-10-01T00:00:01"))).toBe(false);
    });

    it("returns false for TBA-ended banners", () => {
      const b = banner("2026-09-09", null);
      expect(isZzzBannerActive(b, new Date("2026-09-15T12:00:00"))).toBe(false);
    });
  });

  describe("formatZzzDateRange", () => {
    const banner = (startDate: string, endDate: string | null): ZzzBanner => ({
      id: "test",
      type: "agent",
      version: "3.2",
      phase: 1,
      banners: [{ name: "Test", url: "https://example.com", image: null }],
      startDate,
      endDate,
      featured5: [],
      featured4: [],
    });

    it("formats same-month ranges", () => {
      expect(formatZzzDateRange(banner("2026-09-09", "2026-09-30"))).toBe(
        "Sep 9 - 30, 2026"
      );
    });

    it("formats cross-month same-year ranges", () => {
      expect(formatZzzDateRange(banner("2026-06-17", "2026-07-08"))).toBe(
        "Jun 17 - Jul 8, 2026"
      );
    });

    it("formats cross-year ranges", () => {
      expect(formatZzzDateRange(banner("2024-12-18", "2025-01-21"))).toBe(
        "Dec 18, 2024 - Jan 21, 2025"
      );
    });
  });

  describe("getZzzBannerTitle", () => {
    it("joins multiple banner names", () => {
      const banner: ZzzBanner = {
        id: "test",
        type: "agent",
        version: "3.2",
        phase: 1,
        banners: [
          { name: "First", url: "https://example.com/1", image: null },
          { name: "Second", url: "https://example.com/2", image: null },
        ],
        startDate: "2026-09-09",
        endDate: "2026-09-30",
        featured5: [],
        featured4: [],
      };
      expect(getZzzBannerTitle(banner)).toBe("First / Second");
    });
  });
});
