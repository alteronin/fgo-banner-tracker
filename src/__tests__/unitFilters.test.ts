import { describe, it, expect } from "vitest";
import {
  UNIT_GAMES,
  getUnitRows,
  getUnitsConfig,
  matchesFilterGroups,
} from "@/lib/units";

describe("filter group configs", () => {
  it("every game exposes at least one filter group with values", () => {
    for (const game of UNIT_GAMES) {
      const groups = getUnitsConfig(game).filterGroups;
      expect(groups.length).toBeGreaterThan(0);
      for (const group of groups) {
        expect(group.key).toBeTruthy();
        expect(group.label).toBeTruthy();
        expect(group.values.length).toBeGreaterThan(0);
      }
    }
  });

  it("locks expected group keys per game", () => {
    expect(getUnitsConfig("genshin").filterGroups.map((g) => g.key)).toEqual([
      "element",
      "weapon",
      "type",
    ]);
    expect(getUnitsConfig("hsr").filterGroups.map((g) => g.key)).toEqual([
      "element",
      "path",
      "type",
    ]);
    expect(getUnitsConfig("zzz").filterGroups.map((g) => g.key)).toEqual([
      "attribute",
      "specialty",
    ]);
    expect(getUnitsConfig("wuwa").filterGroups.map((g) => g.key)).toEqual([
      "element",
      "weapon",
      "type",
    ]);
    expect(getUnitsConfig("hi3").filterGroups.map((g) => g.key)).toEqual([
      "type",
      "dmg",
    ]);
    expect(
      getUnitsConfig("shadowverse").filterGroups.map((g) => g.key)
    ).toEqual(["class"]);
  });

  it("locks canonical group values per game", () => {
    const group = (game: (typeof UNIT_GAMES)[number], key: string) => {
      const found = getUnitsConfig(game).filterGroups.find((g) => g.key === key);
      expect(found).toBeDefined();
      return found!.values;
    };

    expect(group("genshin", "element")).toEqual([
      "Pyro",
      "Hydro",
      "Anemo",
      "Electro",
      "Dendro",
      "Cryo",
      "Geo",
    ]);
    expect(group("genshin", "weapon")).toEqual([
      "Sword",
      "Claymore",
      "Polearm",
      "Bow",
      "Catalyst",
    ]);
    expect(group("genshin", "type")).toEqual(["Character", "Weapon"]);
    expect(group("hsr", "element")).toEqual([
      "Fire",
      "Ice",
      "Lightning",
      "Wind",
      "Physical",
      "Quantum",
      "Imaginary",
    ]);
    expect(group("hsr", "path")).toEqual([
      "The Destruction",
      "The Hunt",
      "The Erudition",
      "The Nihility",
      "The Harmony",
      "The Abundance",
      "The Preservation",
      "The Remembrance",
      "The Elation",
    ]);
    expect(group("hsr", "type")).toEqual(["Character", "Light Cone"]);
    expect(group("zzz", "attribute")).toEqual([
      "Fire",
      "Ice",
      "Electric",
      "Ether",
      "Physical",
      "Wind",
      "Lumiflux",
    ]);
    expect(group("zzz", "specialty")).toEqual([
      "Attack",
      "Stun",
      "Anomaly",
      "Support",
      "Defense",
      "Rupture",
      "Armorer",
    ]);
    expect(group("wuwa", "element")).toEqual([
      "Aero",
      "Fusion",
      "Glacio",
      "Electro",
      "Havoc",
      "Spectro",
    ]);
    expect(group("wuwa", "weapon")).toEqual([
      "Sword",
      "Broadblade",
      "Gauntlet",
      "Pistol",
      "Rectifier",
    ]);
    expect(group("wuwa", "type")).toEqual(["Resonator", "Weapon"]);
    expect(group("hi3", "type")).toEqual(["MECH", "PSY", "BIO", "IMG", "QUA", "SD"]);
    expect(group("hi3", "dmg")).toEqual(["Physical", "Lightning", "Fire", "Ice"]);
    expect(group("shadowverse", "class")).toEqual([
      "Swordcraft",
      "Forestcraft",
      "Dragoncraft",
      "Havencraft",
      "Runecraft",
      "Portalcraft",
      "Abysscraft",
    ]);
  });

  it("group values are unique and every value appears in some row", () => {
    for (const game of UNIT_GAMES) {
      const groups = getUnitsConfig(game).filterGroups;
      const rows = getUnitRows(game);
      for (const group of groups) {
        expect(new Set(group.values).size).toBe(group.values.length);
        for (const value of group.values) {
          expect(rows.some((r) => r.filters[group.key] === value)).toBe(true);
        }
      }
    }
  });
});

describe("row filter mapping", () => {
  it("genshin rows carry weapon filters and typed elements", () => {
    const rows = getUnitRows("genshin");
    const weapons = rows.filter((r) => r.filters.type === "Weapon");
    const characters = rows.filter((r) => r.filters.type === "Character");
    expect(weapons.length).toBe(73);
    expect(characters.length).toBe(127);
    for (const w of weapons) {
      expect(w.filters.element ?? null).toBeNull();
      expect(w.filters.weapon).toBeTruthy();
      expect(w.subtitle).toBe(`Weapon · ${w.filters.weapon}`);
    }
    for (const c of characters) {
      expect(c.filters.element).toBeTruthy();
      expect(c.filters.weapon).toBeTruthy();
      expect(c.subtitle).toBe(`${c.filters.element} · ${c.filters.weapon}`);
    }
  });

  it("hsr light cones have null element and Character/Light Cone type", () => {
    const rows = getUnitRows("hsr");
    const lightCones = rows.filter((r) => r.filters.type === "Light Cone");
    const characters = rows.filter((r) => r.filters.type === "Character");
    expect(lightCones.length).toBe(170);
    expect(characters.length).toBe(93);
    for (const lc of lightCones) expect(lc.filters.element ?? null).toBeNull();
    for (const c of characters) expect(c.filters.element).toBeTruthy();
    for (const row of rows) expect(row.filters.path).toBeTruthy();
  });

  it("zzz rows carry attribute and specialty filters", () => {
    for (const row of getUnitRows("zzz")) {
      expect(row.filters.attribute).toBe(row.category);
      expect(row.filters.specialty).toBeTruthy();
    }
  });

  it("wuwa weapons have null element and Resonator/Weapon type", () => {
    const rows = getUnitRows("wuwa");
    const weapons = rows.filter((r) => r.filters.type === "Weapon");
    const resonators = rows.filter((r) => r.filters.type === "Resonator");
    expect(weapons.length).toBe(113);
    expect(resonators.length).toBe(59);
    for (const w of weapons) expect(w.filters.element ?? null).toBeNull();
    for (const r of resonators) expect(r.filters.element).toBeTruthy();
    for (const row of rows) expect(row.filters.weapon).toBeTruthy();
  });

  it("hi3 rows carry type and damage filters", () => {
    for (const row of getUnitRows("hi3")) {
      expect(row.filters.type).toBe(row.category);
      expect(row.filters.dmg).toBeTruthy();
    }
  });

  it("shadowverse rows carry class filters", () => {
    for (const row of getUnitRows("shadowverse")) {
      expect(row.filters.class).toBe(row.category);
    }
  });
});

describe("matchesFilterGroups", () => {
  it("passes when nothing is selected", () => {
    expect(matchesFilterGroups({ element: "Anemo" }, {})).toBe(true);
    expect(matchesFilterGroups({ element: "Anemo" }, { element: [] })).toBe(true);
  });

  it("passes on a matching single selection and fails on mismatch", () => {
    expect(matchesFilterGroups({ element: "Anemo" }, { element: ["Anemo"] })).toBe(
      true
    );
    expect(matchesFilterGroups({ element: "Anemo" }, { element: ["Pyro"] })).toBe(
      false
    );
  });

  it("ORs values within a group", () => {
    const filters = { element: "Pyro" };
    expect(matchesFilterGroups(filters, { element: ["Anemo", "Pyro"] })).toBe(true);
    expect(matchesFilterGroups(filters, { element: ["Anemo", "Geo"] })).toBe(false);
  });

  it("ANDs across groups", () => {
    const filters = { element: "Anemo", weapon: "Sword" };
    expect(
      matchesFilterGroups(filters, { element: ["Anemo"], weapon: ["Sword"] })
    ).toBe(true);
    expect(
      matchesFilterGroups(filters, { element: ["Anemo"], weapon: ["Bow"] })
    ).toBe(false);
  });

  it("never matches a null value even when selected", () => {
    expect(
      matchesFilterGroups({ element: null }, { element: ["Fire"] })
    ).toBe(false);
    expect(matchesFilterGroups({ element: null }, { element: [] })).toBe(true);
  });

  it("fails when a selected key is absent from filters", () => {
    expect(matchesFilterGroups({}, { element: ["Anemo"] })).toBe(false);
  });
});
