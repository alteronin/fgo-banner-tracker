import { describe, it, expect } from "vitest";
import {
  UNIT_GAMES,
  getUnitRow,
  getUnitRows,
  getUnitsConfig,
  isUnitGame,
} from "@/lib/units";
import type { UnitGame } from "@/types/units";

const COUNTS: Record<UnitGame, number> = {
  genshin: 127,
  hsr: 263,
  zzz: 60,
  wuwa: 172,
  hi3: 110,
  shadowverse: 63,
};

describe("units data", () => {
  describe.each(Object.keys(COUNTS) as UnitGame[])("%s", (game) => {
    it(`has exactly ${COUNTS[game]} units`, () => {
      expect(getUnitRows(game)).toHaveLength(COUNTS[game]);
    });

    it("has unique ids, names, https images and urls", () => {
      const ids = new Set<string>();
      const names = new Set<string>();
      for (const row of getUnitRows(game)) {
        expect(row.id).toBeTruthy();
        expect(row.name).toBeTruthy();
        expect(row.imageUrl).toMatch(/^https:\/\//);
        expect(row.url).toMatch(/^https:\/\//);
        expect(ids.has(row.id)).toBe(false);
        expect(names.has(row.name)).toBe(false);
        ids.add(row.id);
        names.add(row.name);
      }
    });

    it("maps category, subtitle and sort rarity", () => {
      for (const row of getUnitRows(game)) {
        expect(row.category).toBeTruthy();
        expect(row.subtitle).toBeTruthy();
        expect(row.subtitle).toContain(row.category);
        expect(typeof row.sortRarity).toBe("number");
        expect(row.sortRarity).toBeGreaterThanOrEqual(0);
      }
    });

    it("exposes a config with labels", () => {
      const config = getUnitsConfig(game);
      expect(config.game).toBe(game);
      expect(config.noun).toBeTruthy();
      expect(config.searchPlaceholder).toBeTruthy();
      expect(config.categoryLabel).toBeTruthy();
    });
  });

  it("covers exactly the six unit games", () => {
    expect(UNIT_GAMES).toEqual([
      "genshin",
      "hsr",
      "zzz",
      "wuwa",
      "hi3",
      "shadowverse",
    ]);
    expect(isUnitGame("genshin")).toBe(true);
    expect(isUnitGame("fgo")).toBe(false);
    expect(isUnitGame("unknown")).toBe(false);
  });

  it("splits hsr into characters and light cones", () => {
    const rows = getUnitRows("hsr");
    const lightCones = rows.filter((r) => r.subtitle.startsWith("Light Cone"));
    expect(lightCones).toHaveLength(170);
    expect(rows.length - lightCones.length).toBe(93);
    for (const cone of lightCones) {
      expect(cone.id).toMatch(/^lc-/);
    }
  });

  it("splits wuwa into resonators and weapons", () => {
    const rows = getUnitRows("wuwa");
    const weapons = rows.filter((r) => r.filters.type === "Weapon");
    const resonators = rows.filter((r) => r.filters.type === "Resonator");
    expect(weapons).toHaveLength(113);
    expect(resonators).toHaveLength(59);
    for (const w of weapons) {
      expect(w.id).toMatch(/^w-/);
      expect(w.filters.element ?? null).toBeNull();
      expect(w.subtitle).toBe(`Weapon · ${w.filters.weapon}`);
    }
    for (const r of resonators) {
      expect(r.filters.element).toBeTruthy();
      expect(r.subtitle).toBe(`${r.filters.element} · ${r.filters.weapon}`);
    }
  });

  it("keeps hi3 rank scores within 1-3", () => {
    for (const row of getUnitRows("hi3")) {
      expect([1, 2, 3]).toContain(row.sortRarity);
    }
  });

  it("skips shadowverse leaders with broken wiki images", () => {
    const rows = getUnitRows("shadowverse");
    const ids = rows.map((r) => r.id);
    expect(ids).toContain("eudie");
    expect(ids).toContain("lilanthim");
    expect(ids.some((id) => id.includes("summer"))).toBe(false);
    const obtain = new Set(rows.map((r) => r.subtitle.split(" · ")[1]));
    expect(obtain).toEqual(
      new Set(["Default", "Classic", "Exchange", "Battle Pass", "Special", "Frieren"])
    );
  });

  it("lookup by id returns rows and undefined for unknown", () => {
    const [first] = getUnitRows("zzz");
    expect(getUnitRow("zzz", first.id)).toBe(first);
    expect(getUnitRow("zzz", "does-not-exist")).toBeUndefined();
  });

  it("has no rarity label for shadowverse", () => {
    expect(getUnitsConfig("shadowverse").rarityLabel).toBeNull();
    expect(getUnitsConfig("genshin").rarityLabel).toBe("Rarity");
    expect(getUnitsConfig("hi3").rarityLabel).toBe("Rank");
  });
});
