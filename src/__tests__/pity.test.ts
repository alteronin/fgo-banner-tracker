import { describe, it, expect } from "vitest";
import {
  attributePull,
  computeRarityStats,
  findBannerWindow,
  FOUR_STAR_PITY,
  indexWindows,
  maxPityFor,
  toBannerWindow,
  toBannerWindows,
} from "@/lib/pity";
import type { GamePull } from "@/types/pulls";

function pull(
  partial: Partial<GamePull> & { ts: number; rarity?: number | null }
): GamePull {
  return {
    id: `id-${partial.ts}-${partial.rarity ?? "x"}`,
    gameId: "hsr",
    itemId: "1",
    unitId: null,
    name: "Test Item",
    rarity: null,
    category: "character",
    ...partial,
  };
}

describe("pity", () => {
  describe("computeRarityStats", () => {
    const pulls = [3, 3, 5, 3, 4, 3, 3, 3].map((rarity, i) =>
      pull({ ts: 1000 + i, rarity })
    );

    it("counts pulls between 5★ drops", () => {
      const stats = computeRarityStats(pulls, 5, 90);
      expect(stats.total).toBe(8);
      expect(stats.hits).toBe(1);
      expect(stats.avgPity).toBe(3);
      expect(stats.maxPity).toBe(3);
      expect(stats.currentPity).toBe(5);
      expect(stats.histogram[3]).toBe(1);
      expect(stats.histogram).toHaveLength(91);
    });

    it("treats 5★ as a 4★ guarantee reset", () => {
      const stats = computeRarityStats(pulls, 4, FOUR_STAR_PITY);
      expect(stats.hits).toBe(2);
      expect(stats.avgPity).toBe(2.5);
      expect(stats.maxPity).toBe(3);
      expect(stats.currentPity).toBe(3);
      expect(stats.histogram[3]).toBe(1);
      expect(stats.histogram[2]).toBe(1);
      expect(stats.histogram).toHaveLength(FOUR_STAR_PITY + 1);
    });

    it("counts unknown-rarity pulls without resetting pity", () => {
      const stats = computeRarityStats(
        [
          pull({ ts: 1, rarity: null }),
          pull({ ts: 2, rarity: null }),
          pull({ ts: 3, rarity: 5 }),
          pull({ ts: 4, rarity: 4 }),
        ],
        5,
        90
      );
      expect(stats.hits).toBe(1);
      expect(stats.avgPity).toBe(3);
      expect(stats.currentPity).toBe(1);
    });

    it("returns empty stats when nothing was pulled", () => {
      const stats = computeRarityStats([], 5, 80);
      expect(stats.hits).toBe(0);
      expect(stats.avgPity).toBeNull();
      expect(stats.maxPity).toBeNull();
      expect(stats.currentPity).toBe(0);
    });
  });

  describe("maxPityFor", () => {
    it("uses per-banner guarantees", () => {
      expect(maxPityFor("hsr", "character")).toBe(90);
      expect(maxPityFor("hsr", "light_cone")).toBe(80);
      expect(maxPityFor("hsr", "departure")).toBe(50);
      expect(maxPityFor("genshin", "weapon")).toBe(80);
      expect(maxPityFor("genshin", "character")).toBe(90);
      expect(maxPityFor("zzz", "w_engine")).toBe(80);
      expect(maxPityFor("zzz", "bangboo")).toBe(80);
      expect(maxPityFor("wuwa", "5")).toBe(50);
      expect(maxPityFor("wuwa", "1")).toBe(80);
    });

    it("falls back to the game default for unknown categories", () => {
      expect(maxPityFor("hsr", "mystery")).toBe(90);
      expect(maxPityFor("wuwa", "99")).toBe(80);
    });
  });

  describe("banner windows", () => {
    const windows = toBannerWindows([
      {
        id: "character-2.0",
        type: "character",
        banners: [{ name: "Kafka Banner" }],
        startDate: "2024-01-01",
        endDate: "2024-01-24",
        version: "2.0",
        phase: 1,
      },
      {
        id: "lightcone-2.0",
        type: "lightcone",
        banners: [{ name: "Before Dawn" }],
        startDate: "2024-01-01",
        endDate: "2024-01-24",
        version: "2.0",
        phase: 1,
      },
      {
        id: "no-dates",
        type: "character",
        banners: [{ name: "Undated" }],
        startDate: null,
        endDate: null,
      },
    ]);

    it("drops banners without a full date range", () => {
      expect(windows).toHaveLength(2);
      expect(windows[0].title).toBe("Kafka Banner");
      expect(windows[0].start).toBe(Date.parse("2024-01-01T00:00:00.000Z"));
      expect(windows[0].end).toBe(Date.parse("2024-01-24T23:59:59.999Z"));
      expect(toBannerWindow({
        id: "x",
        type: "character",
        banners: [{ name: "X" }],
        startDate: "2024-01-01",
        endDate: null,
      })).toBeNull();
    });

    it("indexes windows by banner type", () => {
      const index = indexWindows(windows);
      expect(index.get("character")).toHaveLength(1);
      expect(index.get("lightcone")).toHaveLength(1);
      expect(index.get("missing")).toBeUndefined();
    });

    it("matches the inclusive end day", () => {
      const index = indexWindows(windows);
      const inside = Date.parse("2024-01-24T23:30:00Z");
      const outside = Date.parse("2024-01-25T00:01:00Z");
      expect(findBannerWindow(index, "character", inside)?.id).toBe(
        "character-2.0"
      );
      expect(findBannerWindow(index, "character", outside)).toBeNull();
      expect(findBannerWindow(index, "missing", inside)).toBeNull();
    });

    it("prefers the most recently started window on overlap", () => {
      const index = indexWindows(
        toBannerWindows([
          {
            id: "old",
            type: "character",
            banners: [{ name: "Old" }],
            startDate: "2024-01-01",
            endDate: "2024-03-01",
          },
          {
            id: "new",
            type: "character",
            banners: [{ name: "New" }],
            startDate: "2024-02-01",
            endDate: "2024-04-01",
          },
        ])
      );
      const ts = Date.parse("2024-02-15T12:00:00Z");
      expect(findBannerWindow(index, "character", ts)?.id).toBe("new");
    });
  });

  describe("attributePull", () => {
    const index = indexWindows(
      toBannerWindows([
        {
          id: "character-2.0",
          type: "character",
          banners: [{ name: "Kafka Banner" }],
          startDate: "2024-01-01",
          endDate: "2024-01-24",
          version: "2.0",
        },
      ])
    );

    it("labels pulls inside a tracked banner window", () => {
      const attribution = attributePull(
        "hsr",
        pull({
          ts: Date.parse("2024-01-10T12:00:00Z"),
          rarity: 5,
          category: "character",
        }),
        index
      );
      expect(attribution).toEqual({
        label: "Kafka Banner",
        bannerId: "character-2.0",
        version: "2.0",
      });
    });

    it("falls back to the category label", () => {
      const standard = attributePull(
        "hsr",
        pull({ ts: Date.parse("2024-01-10T12:00:00Z"), category: "standard" }),
        index
      );
      expect(standard).toEqual({
        label: "Stellar Warp",
        bannerId: null,
        version: null,
      });

      const outside = attributePull(
        "hsr",
        pull({
          ts: Date.parse("2023-05-10T12:00:00Z"),
          category: "character",
        }),
        index
      );
      expect(outside.label).toBe("Character Event Warp");
      expect(outside.bannerId).toBeNull();
    });

    it("labels wuwa pools without banner instances", () => {
      const attribution = attributePull(
        "wuwa",
        pull({
          ts: Date.parse("2024-05-24T00:00:00Z"),
          rarity: 5,
          category: "5",
        }),
        new Map()
      );
      expect(attribution).toEqual({
        label: "Novice Convene",
        bannerId: null,
        version: null,
      });
    });
  });
});
