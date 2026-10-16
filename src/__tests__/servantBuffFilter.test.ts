import { describe, it, expect } from "vitest";
import {
  matchesEffectFilters,
  matchingEffectRows,
  getServantEffectIndex,
} from "@/lib/servantEffects";
import type {
  EffectFilterCriteria,
  ServantEffectEntry,
} from "@/types/servantEffects";

function entry(overrides: Partial<ServantEffectEntry>): ServantEffectEntry {
  return {
    slug: "test",
    dexNo: 1,
    rarity: 5,
    np: { card: "buster", type: "aoe" },
    effects: [],
    ...overrides,
  };
}

const criteria = (
  partial: Partial<EffectFilterCriteria>
): EffectFilterCriteria => ({
  cats: [],
  targets: [],
  npTypes: [],
  mode: "any",
  ...partial,
});

const supportBuffer = entry({
  slug: "support-buffer",
  np: { card: "arts", type: "support" },
  effects: [
    { source: "skill", slot: 1, target: "all", cats: ["npGaugeUp", "atkUp"] },
    { source: "skill", slot: 2, target: "one", cats: ["busterUp"] },
    { source: "skill", slot: 3, target: "self", cats: ["quickUp", "critUp"] },
    { source: "np", slot: 1, target: "all", cats: ["defUp"] },
  ],
});

describe("matchesEffectFilters", () => {
  it("passes everything with empty criteria", () => {
    expect(matchesEffectFilters(supportBuffer, criteria({}))).toBe(true);
  });

  it("matches any selected buff by default", () => {
    expect(
      matchesEffectFilters(supportBuffer, criteria({ cats: ["busterUp", "heal"] }))
    ).toBe(true);
    expect(
      matchesEffectFilters(supportBuffer, criteria({ cats: ["heal"] }))
    ).toBe(false);
  });

  it("requires every buff in all mode", () => {
    expect(
      matchesEffectFilters(
        supportBuffer,
        criteria({ cats: ["busterUp", "npGaugeUp"], mode: "all" })
      )
    ).toBe(true);
    expect(
      matchesEffectFilters(
        supportBuffer,
        criteria({ cats: ["busterUp", "heal"], mode: "all" })
      )
    ).toBe(false);
  });

  it("scopes buffs to the selected targets", () => {
    expect(
      matchesEffectFilters(
        supportBuffer,
        criteria({ cats: ["busterUp"], targets: ["all"] })
      )
    ).toBe(false);
    expect(
      matchesEffectFilters(
        supportBuffer,
        criteria({ cats: ["busterUp"], targets: ["one"] })
      )
    ).toBe(true);
  });

  it("requires all-mode cats to be covered within the selected targets", () => {
    expect(
      matchesEffectFilters(
        supportBuffer,
        criteria({
          cats: ["npGaugeUp", "atkUp"],
          targets: ["all"],
          mode: "all",
        })
      )
    ).toBe(true);
    expect(
      matchesEffectFilters(
        supportBuffer,
        criteria({ cats: ["npGaugeUp", "busterUp"], targets: ["all"], mode: "all" })
      )
    ).toBe(false);
  });

  it("filters by np type independently of rows", () => {
    expect(
      matchesEffectFilters(supportBuffer, criteria({ npTypes: ["support"] }))
    ).toBe(true);
    expect(
      matchesEffectFilters(supportBuffer, criteria({ npTypes: ["aoe"] }))
    ).toBe(false);
    expect(
      matchesEffectFilters(
        supportBuffer,
        criteria({ npTypes: ["support"], cats: ["heal"] })
      )
    ).toBe(false);
  });

  it("matches a target-only criterion against any row in that target bucket", () => {
    expect(
      matchesEffectFilters(supportBuffer, criteria({ targets: ["all"] }))
    ).toBe(true);
    expect(
      matchesEffectFilters(supportBuffer, criteria({ targets: ["enemy" as never] }))
    ).toBe(false);
  });
});

describe("matchingEffectRows", () => {
  it("returns all rows when no filters are set", () => {
    expect(matchingEffectRows(supportBuffer, criteria({}))).toHaveLength(4);
  });

  it("returns only rows intersecting the selected cats and targets", () => {
    const rows = matchingEffectRows(
      supportBuffer,
      criteria({ cats: ["npGaugeUp", "quickUp"], targets: ["all", "self"] })
    );
    expect(rows).toHaveLength(2);
    expect(rows.map((r) => r.slot)).toEqual([1, 3]);
  });

  it("returns nothing when the np type excludes the servant", () => {
    expect(
      matchingEffectRows(supportBuffer, criteria({ npTypes: ["aoe"] }))
    ).toHaveLength(0);
  });
});

describe("real data filters", () => {
  const index = getServantEffectIndex();

  it("finds party np chargers", () => {
    const results = [...index.values()].filter((e) =>
      matchesEffectFilters(e, criteria({ cats: ["npGaugeUp"], targets: ["all"] }))
    );
    expect(results.length).toBeGreaterThan(30);
    expect(results.some((e) => e.slug === "zhuge-liang-el-melloi-ii")).toBe(true);
    expect(results.some((e) => e.slug === "altria-pendragon")).toBe(false);
  });

  it("narrows party np chargers in all mode", () => {
    const anyCount = [...index.values()].filter((e) =>
      matchesEffectFilters(
        e,
        criteria({ cats: ["npGaugeUp", "atkUp"], targets: ["all"] })
      )
    ).length;
    const allCount = [...index.values()].filter((e) =>
      matchesEffectFilters(
        e,
        criteria({ cats: ["npGaugeUp", "atkUp"], targets: ["all"], mode: "all" })
      )
    ).length;
    expect(allCount).toBeGreaterThan(0);
    expect(allCount).toBeLessThan(anyCount);
  });

  it("finds support np servants", () => {
    const results = [...index.values()].filter((e) =>
      matchesEffectFilters(e, criteria({ npTypes: ["support"] }))
    );
    expect(results.length).toBeGreaterThan(20);
    expect(results.some((e) => e.slug === "altria-caster")).toBe(true);
  });
});
