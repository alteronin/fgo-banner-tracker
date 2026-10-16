import { describe, it, expect } from "vitest";
import { getServants } from "@/lib/data";
import {
  BUFF_CATEGORIES,
  getServantEffectEntries,
  getServantEffectIndex,
} from "@/lib/servantEffects";
import type { BuffCategoryKey } from "@/types/servantEffects";

const SKIPPED = [
  "Mr. Hyde",
  "Mysterious Heroine Z",
  "The Black Grail (Enemy)",
  "U-Olga Marie (NPC Version)",
];

describe("servant effects data", () => {
  const entries = getServantEffectEntries();

  it("has 483 entries with unique slugs", () => {
    expect(entries).toHaveLength(483);
    const slugs = new Set(entries.map((e) => e.slug));
    expect(slugs.size).toBe(483);
  });

  it("only references slugs that exist in the servant roster", () => {
    const roster = new Set(getServants().map((s) => s.slug));
    for (const entry of entries) {
      expect(roster.has(entry.slug)).toBe(true);
    }
  });

  it("documents the four roster servants without Atlas matches", () => {
    const slugs = new Set(entries.map((e) => e.slug));
    const roster = getServants().filter((s) => !slugs.has(s.slug));
    expect(roster.map((s) => s.name).sort()).toEqual([...SKIPPED].sort());
  });

  it("has valid dex numbers and rarity", () => {
    for (const entry of entries) {
      expect(entry.dexNo).toBeGreaterThan(0);
      expect(entry.rarity).toBeGreaterThanOrEqual(0);
      expect(entry.rarity).toBeLessThanOrEqual(5);
    }
  });

  it("has valid np card and type", () => {
    for (const entry of entries) {
      expect(["arts", "buster", "quick", null]).toContain(entry.np.card);
      expect(["st", "aoe", "support"]).toContain(entry.np.type);
    }
  });

  it("has well-formed effect rows", () => {
    const targets = new Set(["self", "one", "all"]);
    const sources = new Set(["skill", "np"]);
    const known = new Set<string>(BUFF_CATEGORIES.map((c) => c.key));
    for (const entry of entries) {
      for (const row of entry.effects) {
        expect(sources.has(row.source)).toBe(true);
        expect(row.slot).toBeGreaterThanOrEqual(1);
        expect(targets.has(row.target)).toBe(true);
        expect(row.cats.length).toBeGreaterThan(0);
        for (const cat of row.cats) {
          expect(known.has(cat)).toBe(true);
        }
        if (row.cd != null) {
          expect(row.cd).toBeGreaterThan(0);
        }
      }
    }
  });

  it("uses every buff category at least once", () => {
    const used = new Set<BuffCategoryKey>();
    for (const entry of entries) {
      for (const row of entry.effects) {
        for (const cat of row.cats) used.add(cat);
      }
    }
    for (const { key } of BUFF_CATEGORIES) {
      expect(used.has(key)).toBe(true);
    }
  });

  it("keeps Mash's two roster forms on the shared dex entry", () => {
    const index = getServantEffectIndex();
    expect(index.has("mash-kyrielight")).toBe(true);
    expect(index.has("mash-ortinax")).toBe(true);
    expect(index.get("mash-kyrielight")!.dexNo).toBe(1);
  });

  it("maps golden servants correctly", () => {
    const index = getServantEffectIndex();

    const artoria = index.get("altria-pendragon")!;
    expect(artoria.rarity).toBe(5);
    expect(artoria.np).toEqual({ card: "buster", type: "aoe" });
    expect(
      artoria.effects.some(
        (r) =>
          r.source === "skill" &&
          r.slot === 2 &&
          r.target === "self" &&
          r.cats.includes("busterUp")
      )
    ).toBe(true);
    expect(
      artoria.effects.some(
        (r) => r.source === "np" && r.target === "self" && r.cats.includes("npGaugeUp")
      )
    ).toBe(true);

    const zhuge = index.get("zhuge-liang-el-melloi-ii")!;
    expect(zhuge.np.type).toBe("support");
    expect(
      zhuge.effects.filter(
        (r) => r.target === "all" && r.cats.includes("npGaugeUp")
      ).length
    ).toBeGreaterThanOrEqual(2);

    const castoria = index.get("altria-caster")!;
    expect(castoria.np.type).toBe("support");
    expect(
      castoria.effects.some(
        (r) => r.target === "one" && r.cats.includes("artsUp")
      )
    ).toBe(true);

    const skadi = index.get("scathach-skadi")!;
    expect(
      skadi.effects.some(
        (r) => r.target === "one" && r.cats.includes("quickUp")
      )
    ).toBe(true);
  });

  it("has english names for most rows", () => {
    const rows = entries.flatMap((e) => e.effects);
    const named = rows.filter((r) => r.nameEn).length;
    expect(named / rows.length).toBeGreaterThan(0.7);
  });
});
