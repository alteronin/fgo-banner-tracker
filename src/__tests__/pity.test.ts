import { describe, it, expect } from "vitest";
import {
  attributePull,
  computeRarityStats,
  fiftyFiftyResult,
  fiftyFiftyResults,
  findBannerWindow,
  FOUR_STAR_PITY,
  guaranteePendingAt,
  indexWindows,
  maxPityFor,
  pityByDrop,
  pityTone,
  toBannerWindow,
  toBannerWindows,
  validateManualPull,
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

  describe("pityByDrop", () => {
    it("assigns each drop its pity length, isolated per category", () => {
      const drops = pityByDrop(
        [
          pull({ id: "a", ts: 1000, rarity: 3, category: "character" }),
          pull({ id: "b", ts: 2000, rarity: 5, category: "character" }),
          pull({ id: "c", ts: 3000, rarity: 5, category: "character" }),
          pull({ id: "d", ts: 4000, rarity: 3, category: "standard" }),
          pull({ id: "e", ts: 5000, rarity: 3, category: "standard" }),
          pull({ id: "f", ts: 6000, rarity: 5, category: "standard" }),
        ],
        5
      );
      expect(drops.size).toBe(3);
      expect(drops.get("b")).toBe(2);
      expect(drops.get("c")).toBe(1);
      expect(drops.get("f")).toBe(3);
      expect(drops.has("a")).toBe(false);
    });

    it("counts unknown-rarity pulls without recording non-drops", () => {
      const drops = pityByDrop(
        [
          pull({ id: "a", ts: 1000, rarity: null }),
          pull({ id: "b", ts: 2000, rarity: 4 }),
          pull({ id: "c", ts: 3000, rarity: 5 }),
        ],
        5
      );
      expect([...drops.keys()]).toEqual(["c"]);
      expect(drops.get("c")).toBe(3);
    });

    it("agrees with computeRarityStats histogram", () => {
      const pulls = [3, 5, 4, 3, 3, 5].map((rarity, i) =>
        pull({ id: `p${i}`, ts: 1000 + i, rarity })
      );
      const stats = computeRarityStats(pulls, 5, 90);
      const drops = pityByDrop(pulls, 5);
      expect(drops.size).toBe(stats.hits);
      const fromDrops = [...drops.values()].reduce((sum, value) => sum + value, 0);
      const fromHistogram = stats.histogram.reduce(
        (sum, count, pity) => sum + count * pity,
        0
      );
      expect(fromDrops).toBe(fromHistogram);
    });

    it("orders same-second pulls by canonical seq, not id", () => {
      const drops = pityByDrop(
        [
          pull({ id: "10", ts: 1000, rarity: 5, seq: 1, category: "character" }),
          pull({ id: "2", ts: 1000, rarity: 3, seq: 0, category: "character" }),
        ],
        5
      );
      expect(drops.get("10")).toBe(2);
      const stats = computeRarityStats(
        [
          pull({ id: "10", ts: 1000, rarity: 5, seq: 1, category: "character" }),
          pull({ id: "2", ts: 1000, rarity: 3, seq: 0, category: "character" }),
        ],
        5,
        90
      );
      expect(stats.hits).toBe(1);
      expect(stats.avgPity).toBe(2);
    });

    it("falls back to id order for pulls without seq", () => {
      const drops = pityByDrop(
        [
          pull({ id: "b", ts: 1000, rarity: 5 }),
          pull({ id: "a", ts: 1000, rarity: 3 }),
        ],
        5
      );
      expect(drops.get("b")).toBe(2);
    });
  });

  describe("pityTone", () => {
    it("buckets the pity by share of the cap", () => {
      expect(pityTone(7, 90)).toBe("early");
      expect(pityTone(30, 90)).toBe("mid");
      expect(pityTone(60, 90)).toBe("late");
      expect(pityTone(82, 90)).toBe("hard");
      expect(pityTone(90, 90)).toBe("hard");
      expect(pityTone(3, 10)).toBe("early");
      expect(pityTone(4, 10)).toBe("mid");
      expect(pityTone(7, 10)).toBe("late");
      expect(pityTone(10, 10)).toBe("hard");
    });
  });

  describe("fiftyFiftyResult", () => {
    const at = (iso: string) => Date.parse(iso);
    const index = indexWindows(
      toBannerWindows([
        {
          id: "b1",
          type: "character",
          banners: [{ name: "Character Event Warp" }],
          startDate: "2024-01-01",
          endDate: "2024-01-31",
          featured5: [{ name: "Kafka" }],
        },
        {
          id: "b2",
          type: "character",
          banners: [{ name: "No Rate-Up" }],
          startDate: "2024-02-01",
          endDate: "2024-02-29",
        },
      ])
    );

    it("returns win when the pulled 5★ is featured", () => {
      const result = fiftyFiftyResult(
        "hsr",
        pull({ id: "a", ts: at("2024-01-05T00:00:00Z"), rarity: 5, name: "Kafka" }),
        index
      );
      expect(result).toBe("win");
    });

    it("matches short and long name variants", () => {
      expect(
        fiftyFiftyResult(
          "hsr",
          pull({
            id: "b",
            ts: at("2024-01-05T00:00:00Z"),
            rarity: 5,
            name: "Kafka - Night",
          }),
          index
        )
      ).toBe("win");
      const longIndex = indexWindows(
        toBannerWindows([
          {
            id: "b3",
            type: "character",
            banners: [{ name: "X" }],
            startDate: "2024-01-01",
            endDate: "2024-01-31",
            featured5: [{ name: "Kafka the Amber" }],
          },
        ])
      );
      expect(
        fiftyFiftyResult(
          "hsr",
          pull({ id: "c", ts: at("2024-01-05T00:00:00Z"), rarity: 5, name: "Kafka" }),
          longIndex
        )
      ).toBe("win");
    });

    it("returns loss when the banner has rate-up but the pull is off-banner", () => {
      const result = fiftyFiftyResult(
        "hsr",
        pull({ id: "d", ts: at("2024-01-05T00:00:00Z"), rarity: 5, name: "Himeko" }),
        index
      );
      expect(result).toBe("loss");
    });

    it("returns guarantee for a featured pull when the previous rate-up was lost", () => {
      const result = fiftyFiftyResult(
        "hsr",
        pull({ id: "g1", ts: at("2024-01-05T00:00:00Z"), rarity: 5, name: "Kafka" }),
        index,
        true
      );
      expect(result).toBe("guarantee");
    });

    it("chains win/loss/guarantee across banners in pull order", () => {
      const chainIndex = indexWindows(
        toBannerWindows([
          {
            id: "c1",
            type: "character",
            banners: [{ name: "January" }],
            startDate: "2024-01-01",
            endDate: "2024-01-31",
            featured5: [{ name: "Kafka" }],
          },
          {
            id: "c2",
            type: "character",
            banners: [{ name: "February" }],
            startDate: "2024-02-01",
            endDate: "2024-02-29",
            featured5: [{ name: "Kafka" }],
          },
        ])
      );
      const results = fiftyFiftyResults(
        "hsr",
        [
          pull({ id: "c", ts: at("2024-02-10T00:00:00Z"), rarity: 3 }),
          pull({ id: "a", ts: at("2024-01-05T00:00:00Z"), rarity: 5, name: "Himeko" }),
          pull({ id: "b", ts: at("2024-02-05T00:00:00Z"), rarity: 5, name: "Kafka" }),
          pull({ id: "d", ts: at("2024-02-10T00:00:00Z"), rarity: 5, name: "Kafka" }),
          pull({ id: "e", ts: at("2024-02-15T00:00:00Z"), rarity: 5, name: "Himeko" }),
          pull({ id: "f", ts: at("2024-02-20T00:00:00Z"), rarity: 5, name: "Kafka" }),
        ],
        chainIndex
      );
      expect(results.get("a")).toBe("loss");
      expect(results.get("b")).toBe("guarantee");
      expect(results.get("d")).toBe("win");
      expect(results.get("e")).toBe("loss");
      expect(results.get("f")).toBe("guarantee");
      expect(results.has("c")).toBe(false);
    });

    it("detects whether a guarantee is still pending at a point in time", () => {
      const chainIndex = indexWindows(
        toBannerWindows([
          {
            id: "c1",
            type: "character",
            banners: [{ name: "January" }],
            startDate: "2024-01-01",
            endDate: "2024-01-31",
            featured5: [{ name: "Kafka" }],
          },
          {
            id: "c2",
            type: "character",
            banners: [{ name: "February" }],
            startDate: "2024-02-01",
            endDate: "2024-02-29",
            featured5: [{ name: "Kafka" }],
          },
        ])
      );
      const chain = [
        pull({
          id: "loss",
          ts: at("2024-01-05T00:00:00Z"),
          rarity: 5,
          name: "Himeko",
        }),
        pull({
          id: "grant",
          ts: at("2024-02-05T00:00:00Z"),
          rarity: 5,
          name: "Kafka",
        }),
      ];
      expect(
        guaranteePendingAt(
          "hsr",
          chain,
          chainIndex,
          "character",
          at("2024-01-02T00:00:00Z")
        )
      ).toBe(false);
      expect(
        guaranteePendingAt(
          "hsr",
          chain,
          chainIndex,
          "character",
          at("2024-01-10T00:00:00Z")
        )
      ).toBe(true);
      expect(
        guaranteePendingAt(
          "hsr",
          chain,
          chainIndex,
          "character",
          at("2024-02-10T00:00:00Z")
        )
      ).toBe(false);
      expect(
        guaranteePendingAt(
          "hsr",
          [],
          chainIndex,
          "character",
          at("2024-02-10T00:00:00Z")
        )
      ).toBe(false);
    });

    it("returns null without rate-up data, outside rate-up categories, or non-5★", () => {
      expect(
        fiftyFiftyResult(
          "hsr",
          pull({ id: "e", ts: at("2024-02-10T00:00:00Z"), rarity: 5, name: "Himeko" }),
          index
        )
      ).toBeNull();
      expect(
        fiftyFiftyResult(
          "hsr",
          pull({
            id: "f",
            ts: at("2024-01-05T00:00:00Z"),
            rarity: 5,
            name: "Himeko",
            category: "standard",
          }),
          index
        )
      ).toBeNull();
      expect(
        fiftyFiftyResult(
          "hsr",
          pull({ id: "g", ts: at("2024-01-05T00:00:00Z"), rarity: 4, name: "Kafka" }),
          index
        )
      ).toBeNull();
      expect(
        fiftyFiftyResult(
          "hsr",
          pull({ id: "h", ts: at("2023-06-01T00:00:00Z"), rarity: 5, name: "Kafka" }),
          index
        )
      ).toBeNull();
    });

    it("uses per-game pool mappings (wuwa featured pool)", () => {
      const wuwa = indexWindows(
        toBannerWindows([
          {
            id: "w1",
            type: "resonator",
            banners: [{ name: "Featured Resonator" }],
            startDate: "2024-01-01",
            endDate: "2024-01-31",
            featured5: [{ name: "Jianxin" }],
          },
        ])
      );
      expect(
        fiftyFiftyResult(
          "wuwa",
          pull({
            id: "w",
            gameId: "wuwa",
            ts: at("2024-01-05T00:00:00Z"),
            rarity: 5,
            name: "Jianxin",
            category: "1",
          }),
          wuwa
        )
      ).toBe("win");
      expect(
        fiftyFiftyResult(
          "wuwa",
          pull({
            id: "x",
            gameId: "wuwa",
            ts: at("2024-01-05T00:00:00Z"),
            rarity: 5,
            name: "Yangyang",
            category: "1",
          }),
          wuwa
        )
      ).toBe("loss");
      expect(
        fiftyFiftyResult(
          "wuwa",
          pull({
            id: "y",
            gameId: "wuwa",
            ts: at("2024-01-05T00:00:00Z"),
            rarity: 5,
            name: "Yangyang",
            category: "5",
          }),
          wuwa
        )
      ).toBeNull();
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

describe("validateManualPull", () => {
  const emptyIndex = indexWindows([]);
  const at = (iso: string) => Date.parse(iso);
  const windowIndex = indexWindows(
    toBannerWindows([
      {
        id: "b1",
        type: "character",
        banners: [{ name: "Character Event Warp" }],
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        featured5: [{ name: "Kafka" }],
      },
    ])
  );

  it("rejects future-dated drafts", () => {
    const draft = pull({
      id: "future",
      ts: Date.now() + 60_000,
      rarity: 3,
      manual: true,
    });
    expect(validateManualPull("hsr", draft, [], emptyIndex)).toEqual({
      kind: "future",
    });
  });

  it("rejects a draft not older than the oldest imported pull", () => {
    const others = [pull({ id: "imp", ts: 1000, rarity: 3 })];
    const draft = pull({
      id: "draft",
      ts: 2000,
      rarity: 3,
      manual: true,
    });
    expect(validateManualPull("hsr", draft, others, emptyIndex)).toEqual({
      kind: "not-oldest",
      oldestTs: 1000,
    });
  });

  it("accepts a draft older than every imported pull", () => {
    const others = [
      pull({ id: "manual", ts: 500, rarity: 3, manual: true }),
      pull({ id: "imp", ts: 1000, rarity: 3 }),
    ];
    const draft = pull({
      id: "draft",
      ts: 750,
      rarity: 3,
      manual: true,
    });
    expect(validateManualPull("hsr", draft, others, emptyIndex)).toBeNull();
  });

  it("has no oldest constraint for manual-only histories", () => {
    const others = [pull({ id: "manual", ts: 1000, rarity: 3, manual: true })];
    const draft = pull({
      id: "draft",
      ts: 2000,
      rarity: 3,
      manual: true,
    });
    expect(validateManualPull("hsr", draft, others, emptyIndex)).toBeNull();
  });

  it("rejects a non-5★ draft that pushes an existing 5★ over the hard pity cap", () => {
    const cap = maxPityFor("hsr", "character");
    const others = [
      ...Array.from({ length: cap - 1 }, (_, i) =>
        pull({ id: `r3-${i}`, ts: 1000 + i, rarity: 3 })
      ),
      pull({ id: "r5", ts: 2000, rarity: 5 }),
    ];
    const draft = pull({ id: "draft", ts: 1, rarity: 3, manual: true });
    expect(validateManualPull("hsr", draft, others, emptyIndex)).toEqual({
      kind: "pity5-cap",
      cap,
    });
  });

  it("accepts a manual 5★ at the oldest position that resets the run", () => {
    const others = Array.from({ length: 100 }, (_, i) =>
      pull({ id: `r3-${i}`, ts: 1000 + i, rarity: 3 })
    );
    const draft = pull({ id: "draft", ts: 1, rarity: 5, manual: true });
    expect(validateManualPull("hsr", draft, others, emptyIndex)).toBeNull();
  });

  it("rejects a draft that pushes an existing 4★ over the four-star cap", () => {
    const others = [
      ...Array.from({ length: FOUR_STAR_PITY - 1 }, (_, i) =>
        pull({ id: `r3-${i}`, ts: 1000 + i, rarity: 3 })
      ),
      pull({ id: "r4", ts: 2000, rarity: 4 }),
    ];
    const draft = pull({ id: "draft", ts: 1, rarity: 3, manual: true });
    expect(validateManualPull("hsr", draft, others, emptyIndex)).toEqual({
      kind: "pity4-cap",
    });
  });

  it("does not flag violations the imported history already had", () => {
    const cap = maxPityFor("hsr", "character");
    const others = [
      ...Array.from({ length: cap + 10 }, (_, i) =>
        pull({ id: `r3-${i}`, ts: 1000 + i, rarity: 3 })
      ),
      pull({ id: "r5", ts: 5000, rarity: 5 }),
    ];
    const draft = pull({ id: "draft", ts: 1, rarity: 3, manual: true });
    expect(validateManualPull("hsr", draft, others, emptyIndex)).toBeNull();
  });

  it("flags two adjacent off-banner losses", () => {
    const others = [
      pull({
        id: "loss",
        ts: at("2024-01-10T00:00:00Z"),
        rarity: 5,
        name: "Himeko",
      }),
    ];
    const draft = pull({
      id: "draft",
      ts: at("2024-01-05T00:00:00Z"),
      rarity: 5,
      name: "Himeko",
      manual: true,
    });
    expect(validateManualPull("hsr", draft, others, windowIndex)).toEqual({
      kind: "consecutive-loss",
    });
  });

  it("flags a manual loss directly before another loss", () => {
    const others = [
      pull({
        id: "prev",
        ts: at("2024-01-03T00:00:00Z"),
        rarity: 5,
        name: "Himeko",
        manual: true,
      }),
      pull({ id: "later", ts: at("2024-01-20T00:00:00Z"), rarity: 3 }),
    ];
    const draft = pull({
      id: "draft",
      ts: at("2024-01-05T00:00:00Z"),
      rarity: 5,
      name: "Himeko",
      manual: true,
    });
    expect(validateManualPull("hsr", draft, others, windowIndex)).toEqual({
      kind: "consecutive-loss",
    });
  });

  it("accepts a featured pull consumed by the guarantee", () => {
    const others = [
      pull({
        id: "prev",
        ts: at("2024-01-03T00:00:00Z"),
        rarity: 5,
        name: "Himeko",
        manual: true,
      }),
      pull({ id: "later", ts: at("2024-01-20T00:00:00Z"), rarity: 3 }),
    ];
    const draft = pull({
      id: "draft",
      ts: at("2024-01-05T00:00:00Z"),
      rarity: 5,
      name: "Kafka",
      manual: true,
    });
    expect(validateManualPull("hsr", draft, others, windowIndex)).toBeNull();
  });

  it("accepts a declared loss, a declared guarantee, then another loss", () => {
    const others = [
      pull({
        id: "first",
        ts: at("2024-01-03T00:00:00Z"),
        rarity: 5,
        name: "Clara",
        manual: true,
        fifty: "loss",
      }),
      pull({
        id: "guaranteed",
        ts: at("2024-01-10T00:00:00Z"),
        rarity: 5,
        name: "Kafka",
        manual: true,
        fifty: "guarantee",
      }),
    ];
    const draft = pull({
      id: "draft",
      ts: at("2024-01-17T00:00:00Z"),
      rarity: 5,
      name: "Clara",
      manual: true,
      fifty: "loss",
    });
    expect(validateManualPull("hsr", draft, others, windowIndex)).toBeNull();
  });
});
