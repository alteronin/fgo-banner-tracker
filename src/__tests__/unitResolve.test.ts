import { describe, it, expect } from "vitest";
import {
  buildUnitIndex,
  normalizeUnitName,
  resolveUnitName,
  syntheticStatusKey,
} from "@/lib/unitResolve";

const ZZZ_UNITS = [
  { id: "1028278", name: "Jane" },
  { id: "1132771", name: "Astra" },
  { id: "1271310", name: "Orphie and Magus" },
  { id: "1150649", name: "Soldier 0 Anby" },
];

const HSR_UNITS = [
  { id: "lc-408531", name: "Landau's Choice" },
  { id: "lc-448342", name: "Dream's Montage" },
];

describe("normalizeUnitName", () => {
  it("lowercases and collapses punctuation and whitespace", () => {
    expect(normalizeUnitName("Soldier 0 - Anby")).toBe("soldier 0 anby");
    expect(normalizeUnitName("  Jane   Doe  ")).toBe("jane doe");
    expect(normalizeUnitName("Nihilux - Aha")).toBe("nihilux aha");
  });

  it("keeps letters and digits, replaces apostrophes", () => {
    expect(normalizeUnitName("Landau's Choice")).toBe("landau s choice");
    expect(normalizeUnitName("Amos' Bow")).toBe("amos bow");
    expect(normalizeUnitName("")).toBe("");
  });
});

describe("buildUnitIndex + resolveUnitName", () => {
  it("resolves exact names", () => {
    const index = buildUnitIndex(HSR_UNITS, "hsr");
    expect(resolveUnitName("Landau's Choice", index)).toBe("lc-408531");
  });

  it("resolves normalized matches", () => {
    const index = buildUnitIndex(ZZZ_UNITS, "zzz");
    expect(resolveUnitName("soldier 0 - anby", index)).toBe("1150649");
    expect(resolveUnitName("Soldier 0  Anby", index)).toBe("1150649");
  });

  it("resolves aliases for that game only", () => {
    const index = buildUnitIndex(ZZZ_UNITS, "zzz");
    expect(resolveUnitName("Jane Doe", index)).toBe("1028278");
    expect(resolveUnitName("Astra Yao", index)).toBe("1132771");
    expect(resolveUnitName("Orphie", index)).toBe("1271310");
  });

  it("ignores aliases from other games", () => {
    const index = buildUnitIndex(HSR_UNITS, "hsr");
    expect(resolveUnitName("Jane Doe", index)).toBeNull();
  });

  it("returns null for unknown names", () => {
    const index = buildUnitIndex(HSR_UNITS, "hsr");
    expect(resolveUnitName("Nihilux - Aha", index)).toBeNull();
    expect(resolveUnitName("Landau", index)).toBeNull();
  });

  it("prefers exact matches over aliases", () => {
    const units = [
      { id: "exact", name: "Jane Doe" },
      { id: "short", name: "Jane" },
    ];
    const index = buildUnitIndex(units, "zzz");
    expect(resolveUnitName("Jane Doe", index)).toBe("exact");
    expect(resolveUnitName("Jane", index)).toBe("short");
  });
});

describe("syntheticStatusKey", () => {
  it("builds a namespaced key from the normalized name", () => {
    expect(syntheticStatusKey("Nihilux - Aha")).toBe("name:nihilux aha");
    expect(syntheticStatusKey("Jane Doe")).toBe("name:jane doe");
  });

  it("never collides with roster ids", () => {
    const index = buildUnitIndex(ZZZ_UNITS, "zzz");
    for (const unit of ZZZ_UNITS) {
      expect(syntheticStatusKey(unit.name).startsWith("name:")).toBe(true);
      expect(index.byExact.has(syntheticStatusKey(unit.name))).toBe(false);
    }
  });
});
