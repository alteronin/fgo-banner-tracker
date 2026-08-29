import { describe, it, expect } from "vitest";
import {
  getBanners,
  getBannerById,
  getUniqueServants,
  getServants,
  getServantBySlug,
  getUniqueServantsWithName,
} from "@/lib/data";

describe("data", () => {
  describe("getBanners", () => {
    it("returns an array of banners", () => {
      const banners = getBanners();
      expect(Array.isArray(banners)).toBe(true);
      expect(banners.length).toBeGreaterThan(0);
    });

    it("each banner has required fields", () => {
      const banners = getBanners();
      banners.forEach((banner) => {
        expect(banner).toHaveProperty("id");
        expect(banner).toHaveProperty("name");
        expect(banner).toHaveProperty("imageUrl");
        expect(banner).toHaveProperty("startDate");
        expect(banner).toHaveProperty("endDate");
        expect(banner).toHaveProperty("servants");
        expect(Array.isArray(banner.servants)).toBe(true);
      });
    });

    it("banners are sorted by date descending", () => {
      const banners = getBanners();
      for (let i = 1; i < banners.length; i++) {
        expect(banners[i - 1].startDate >= banners[i].startDate).toBe(true);
      }
    });
  });

  describe("getBannerById", () => {
    it("returns banner by id", () => {
      const banners = getBanners();
      const first = banners[0];
      const found = getBannerById(first.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(first.id);
    });

    it("returns undefined for unknown id", () => {
      expect(getBannerById("nonexistent-banner-id")).toBeUndefined();
    });
  });

  describe("getUniqueServants", () => {
    it("returns unique servant slugs", () => {
      const banners = getBanners();
      const servantList = getUniqueServants(banners);
      expect(Array.isArray(servantList)).toBe(true);
      expect(servantList.length).toBeGreaterThan(0);

      const unique = new Set(servantList);
      expect(unique.size).toBe(servantList.length);
    });

    it("servants are sorted", () => {
      const banners = getBanners();
      const servantList = getUniqueServants(banners);
      const sorted = [...servantList].sort();
      expect(servantList).toEqual(sorted);
    });
  });

  describe("getServants", () => {
    it("returns an array of servants", () => {
      const servantList = getServants();
      expect(Array.isArray(servantList)).toBe(true);
      expect(servantList.length).toBeGreaterThan(0);
    });

    it("each servant has required fields", () => {
      const servantList = getServants();
      servantList.forEach((s) => {
        expect(s).toHaveProperty("slug");
        expect(s).toHaveProperty("name");
        expect(s).toHaveProperty("iconUrl");
        expect(s).toHaveProperty("className");
        expect(s.iconUrl).toContain("mana.wiki");
      });
    });
  });

  describe("getServantBySlug", () => {
    it("returns servant by slug", () => {
      const servantList = getServants();
      const first = servantList[0];
      const found = getServantBySlug(first.slug);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(first.slug);
    });

    it("returns undefined for unknown slug", () => {
      expect(getServantBySlug("nonexistent-servant")).toBeUndefined();
    });
  });

  describe("getUniqueServantsWithName", () => {
    it("returns servants with name and slug", () => {
      const banners = getBanners();
      const result = getUniqueServantsWithName(banners);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      result.forEach((s) => {
        expect(s).toHaveProperty("slug");
        expect(s).toHaveProperty("name");
      });
    });

    it("deduplicates servants across banners", () => {
      const banners = getBanners();
      const result = getUniqueServantsWithName(banners);
      const slugs = result.map((s) => s.slug);
      const unique = new Set(slugs);
      expect(unique.size).toBe(slugs.length);
    });

    it("results are sorted by name", () => {
      const banners = getBanners();
      const result = getUniqueServantsWithName(banners);
      for (let i = 1; i < result.length; i++) {
        expect(result[i - 1].name.localeCompare(result[i].name)).toBeLessThanOrEqual(0);
      }
    });
  });
});
