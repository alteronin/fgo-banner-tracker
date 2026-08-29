import { describe, it, expect } from "vitest";
import { getBanners, getBannerById, getUniqueServants } from "@/lib/data";

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
      const servants = getUniqueServants(banners);
      expect(Array.isArray(servants)).toBe(true);
      expect(servants.length).toBeGreaterThan(0);

      // Check uniqueness
      const unique = new Set(servants);
      expect(unique.size).toBe(servants.length);
    });

    it("servants are sorted", () => {
      const banners = getBanners();
      const servants = getUniqueServants(banners);
      const sorted = [...servants].sort();
      expect(servants).toEqual(sorted);
    });
  });
});
