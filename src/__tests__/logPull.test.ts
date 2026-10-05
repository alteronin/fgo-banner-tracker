import { describe, it, expect } from "vitest";
import {
  buildLoggedPull,
  checkLoggable,
  findMapItemByName,
  getLogIndex,
  hasPullInBanner,
  logCategoryFor,
  STANDARD_POOLS,
  type LogContext,
} from "@/lib/logPull";
import type { GamePull, PullGame } from "@/types/pulls";

function ctx(overrides: Partial<LogContext> = {}): LogContext {
  return {
    game: "genshin",
    bannerType: "character",
    bannerTitle: "Sparkling Steps",
    bannerStart: "2021-06-09",
    bannerEnd: "2021-06-29",
    ...overrides,
  };
}

function pull(overrides: Partial<GamePull>): GamePull {
  return {
    id: "id",
    gameId: "genshin",
    itemId: "1",
    unitId: null,
    name: "Item",
    rarity: 3,
    ts: 1625000000000,
    category: "character",
    ...overrides,
  };
}

const KLEE_UNIT = "610146";

describe("logCategoryFor", () => {
  it("maps banner types to pull categories per game", () => {
    expect(logCategoryFor(ctx())).toBe("character");
    expect(logCategoryFor(ctx({ bannerType: "weapon" }))).toBe("weapon");
    expect(logCategoryFor(ctx({ game: "hsr", bannerType: "lightcone" }))).toBe(
      "light_cone"
    );
    expect(logCategoryFor(ctx({ game: "zzz", bannerType: "agent" }))).toBe(
      "character"
    );
    expect(logCategoryFor(ctx({ game: "zzz", bannerType: "wengine" }))).toBe(
      "w_engine"
    );
    expect(logCategoryFor(ctx({ game: "wuwa", bannerType: "resonator" }))).toBe(
      "1"
    );
  });

  it("returns null for non-rate-up banner types", () => {
    expect(logCategoryFor(ctx({ bannerType: "chronicled" }))).toBeNull();
    expect(logCategoryFor(ctx({ game: "wuwa", bannerType: "selector" }))).toBeNull();
  });

  it("prefers an explicit category override", () => {
    expect(
      logCategoryFor(
        ctx({ game: "wuwa", bannerType: "resonator", category: "2" })
      )
    ).toBe("2");
  });
});

describe("findMapItemByName", () => {
  it("resolves 5★ items case-insensitively", () => {
    const klee = findMapItemByName("genshin", "klee");
    expect(klee).not.toBeNull();
    expect(klee!.rarity).toBe(5);
    expect(klee!.itemId).toBe("10000029");
    expect(klee!.unitId).toBe(KLEE_UNIT);
  });

  it("returns null for unknown names", () => {
    expect(findMapItemByName("genshin", "Magachiyo")).toBeNull();
  });

  it("resolves wuwa names through the name-keyed map", () => {
    const verina = findMapItemByName("wuwa", "Verina");
    expect(verina).not.toBeNull();
    expect(verina!.rarity).toBe(5);
  });

  it("resolves short banner names through a unique substring match", () => {
    const ayaka = findMapItemByName("genshin", "Ayaka");
    expect(ayaka).not.toBeNull();
    expect(ayaka!.name).toBe("Kamisato Ayaka");
    expect(ayaka!.rarity).toBe(5);
    expect(ayaka!.unitId).toBe("630618");
    expect(findMapItemByName("genshin", "Raiden")!.name).toBe("Raiden Shogun");
    expect(findMapItemByName("genshin", "Kokomi")!.name).toBe(
      "Sangonomiya Kokomi"
    );
    expect(findMapItemByName("hsr", "Topaz")!.name).toBe("Topaz & Numby");
    expect(findMapItemByName("zzz", "Jane Doe")!.name).toBe("Jane");
  });

  it("does not substring-match names shorter than four characters", () => {
    expect(findMapItemByName("genshin", "Ab")).toBeNull();
  });
});

describe("STANDARD_POOLS", () => {
  it("resolves every pool entry to a 5★ pull-map item", () => {
    for (const game of Object.keys(STANDARD_POOLS) as PullGame[]) {
      for (const [category, names] of Object.entries(STANDARD_POOLS[game])) {
        expect(names.length, `${game}/${category} pool empty`).toBeGreaterThan(0);
        for (const name of names) {
          const item = findMapItemByName(game, name);
          expect(item, `${game}/${category}: ${name} missing`).not.toBeNull();
          expect(
            item!.rarity,
            `${game}/${category}: ${name} not 5★`
          ).toBe(5);
        }
      }
    }
  });

  it("matches the researched pool sizes", () => {
    expect(STANDARD_POOLS.genshin.character).toHaveLength(8);
    expect(STANDARD_POOLS.genshin.weapon).toHaveLength(10);
    expect(STANDARD_POOLS.hsr.character).toHaveLength(7);
    expect(STANDARD_POOLS.hsr.light_cone).toHaveLength(7);
    expect(STANDARD_POOLS.zzz.character).toHaveLength(6);
    expect(STANDARD_POOLS.zzz.w_engine).toHaveLength(6);
    expect(STANDARD_POOLS.wuwa["1"]).toHaveLength(5);
  });
});

describe("checkLoggable", () => {
  it("offers logging when the banner uses a short unit name", () => {
    const prompt = checkLoggable({
      ctx: ctx({
        bannerTitle: "The Heron's Court",
        bannerStart: "2021-07-21",
        bannerEnd: "2021-08-10",
      }),
      name: "Ayaka",
    });
    expect(prompt).not.toBeNull();
    expect(prompt!.item.name).toBe("Kamisato Ayaka");
    expect(prompt!.item.unitId).toBe("630618");
    expect(prompt!.bannerStart).toBe("2021-07-21");
  });

  it("offers logging for a past banner", () => {
    const prompt = checkLoggable({
      ctx: ctx(),
      name: "Klee",
    });
    expect(prompt).not.toBeNull();
    expect(prompt!.category).toBe("character");
    expect(prompt!.item.itemId).toBe("10000029");
    expect(prompt!.bannerStart).toBe("2021-06-09");
  });

  it("offers logging when no pulls exist yet", () => {
    const prompt = checkLoggable({ ctx: ctx(), name: "Klee" });
    expect(prompt).not.toBeNull();
  });

  it("refuses non-rate-up banner types, dates and non-5★ items", () => {
    expect(
      checkLoggable({
        ctx: ctx({ bannerType: "chronicled" }),
        name: "Klee",
      })
    ).toBeNull();
    expect(
      checkLoggable({ ctx: ctx({ bannerStart: null }), name: "Klee" })
    ).toBeNull();
    expect(
      checkLoggable({ ctx: ctx(), name: "Xiangling" })
    ).toBeNull();
  });
});

describe("buildLoggedPull", () => {
  it("builds a manual pull with the declared outcome", () => {
    const klee = findMapItemByName("genshin", "Klee")!;
    const built = buildLoggedPull({
      game: "genshin",
      ts: 1623211200000,
      category: "character",
      received: klee,
      outcome: "win",
      existing: [],
    });
    expect(built.manual).toBe(true);
    expect(built.fifty).toBe("win");
    expect(built.rarity).toBe(5);
    expect(built.name).toBe("Klee");
    expect(built.itemId).toBe("10000029");
    expect(built.unitId).toBe(KLEE_UNIT);
    expect(built.id).toBe(`${built.ts}|character|10000029|0`);
  });

  it("increments the occurrence when the id is taken", () => {
    const klee = findMapItemByName("genshin", "Klee")!;
    const first = buildLoggedPull({
      game: "genshin",
      ts: 1623211200000,
      category: "character",
      received: klee,
      outcome: "loss",
      existing: [],
    });
    const second = buildLoggedPull({
      game: "genshin",
      ts: 1623211200000,
      category: "character",
      received: klee,
      outcome: "loss",
      existing: [first],
    });
    expect(second.id).toBe(`${first.ts}|character|10000029|1`);
    expect(second.fifty).toBe("loss");
  });
});

describe("hasPullInBanner", () => {
  const klee = findMapItemByName("genshin", "Klee")!;

  function params(overrides: Partial<Parameters<typeof hasPullInBanner>[0]>) {
    return {
      game: "genshin" as const,
      name: "Klee",
      unitId: klee.unitId,
      bannerStart: "2021-06-09",
      bannerEnd: "2021-06-29",
      pulls: [] as GamePull[],
      ...overrides,
    };
  }

  it("finds a pull whose date falls inside the banner window", () => {
    expect(
      hasPullInBanner(
        params({
          pulls: [
            pull({
              ts: Date.parse("2021-06-15T12:00:00Z"),
              unitId: KLEE_UNIT,
              rarity: 5,
              name: "Klee",
            }),
          ],
        })
      )
    ).toBe(true);
  });

  it("ignores pulls outside the banner window", () => {
    expect(
      hasPullInBanner(
        params({
          pulls: [
            pull({
              ts: Date.parse("2021-08-01T12:00:00Z"),
              unitId: KLEE_UNIT,
              rarity: 5,
              name: "Klee",
            }),
          ],
        })
      )
    ).toBe(false);
  });

  it("falls back to name matching when ids are missing", () => {
    expect(
      hasPullInBanner(
        params({
          unitId: null,
          pulls: [
            pull({
              ts: Date.parse("2021-06-15T12:00:00Z"),
              unitId: null,
              itemId: "other",
              name: "Klee",
            }),
          ],
        })
      )
    ).toBe(true);
  });

  it("returns null when the banner window is unknown", () => {
    expect(hasPullInBanner(params({ bannerStart: null }))).toBeNull();
  });
});

describe("getLogIndex", () => {
  it("indexes real banner windows per game", () => {
    const index = getLogIndex("genshin");
    expect(index.get("character")!.length).toBeGreaterThan(0);
    expect(getLogIndex("wuwa").get("resonator")!.length).toBeGreaterThan(0);
  });
});
