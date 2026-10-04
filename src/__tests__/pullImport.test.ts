import { describe, it, expect } from "vitest";
import {
  buildManualPull,
  categoryLabel,
  detectPullSource,
  normalizeName,
  parsePullFile,
  parseStardbPulls,
  parseWuwaPulls,
} from "@/lib/pullImport";
import type { GamePull, PullGame, PullMap } from "@/types/pulls";

const withMaps = (maps: Partial<Record<PullGame, PullMap>>) =>
  maps as Record<PullGame, PullMap>;

const wuwaMap: PullMap = {
  game: "wuwa",
  key: "name-norm",
  source: "test",
  generated: "2026-10-04",
  items: {
    encore: { name: "Encore", rarity: 5, kind: "resonator", unit: "992285" },
    baizhi: { name: "Baizhi", rarity: 4, kind: "resonator", unit: "992296" },
    pistolsofnight: {
      name: "Pistols of Night",
      rarity: 3,
      kind: "weapon",
      unit: null,
    },
  },
};

const hsrMap: PullMap = {
  game: "hsr",
  key: "id",
  source: "test",
  generated: "2026-10-04",
  items: {
    "1202": { name: "Himeko", rarity: 5, kind: "character", unit: "850001" },
    "20011": {
      name: "Data Bank",
      rarity: 3,
      kind: "light_cone",
      unit: null,
    },
  },
};

const wuwaFile = {
  siteVersion: "0.5",
  version: "1.0",
  date: "2026-10-03",
  playerId: "900011443",
  pulls: [
    {
      cardPoolType: 5,
      resourceId: 1201,
      qualityLevel: 4,
      name: "Baizhi",
      time: "2024-05-23T01:45:08Z",
    },
    {
      cardPoolType: 1,
      resourceId: 1311,
      qualityLevel: 5,
      name: "Encore",
      time: "2024-06-07T21:29:57Z",
    },
    {
      cardPoolType: 1,
      resourceId: 21030013,
      qualityLevel: 3,
      name: "Pistols of Night",
      time: "2024-06-07T21:29:57Z",
    },
    {
      cardPoolType: 1,
      resourceId: 21030013,
      qualityLevel: 3,
      name: "Pistols of Night",
      time: "2024-06-07T21:29:57Z",
    },
    {
      cardPoolType: 99,
      resourceId: 1,
      qualityLevel: 5,
      name: "Mystery Relic",
      time: "2024-06-08T00:00:00Z",
    },
  ],
};

const stardbFile = {
  user: {
    username: "tester",
    hsr: {
      achievements: [],
      uids: [
        {
          uid: "800003779",
          verified: true,
          private: false,
          warps: {
            departure: [],
            standard: [
              {
                id: "1698664200000094679",
                item_id: 1202,
                type: "character",
                timestamp: "2023-10-30T11:14:47Z",
                official: false,
              },
            ],
            character: [
              {
                id: "1700017800002822879",
                item_id: 20011,
                type: "light_cone",
                timestamp: "2023-11-15T03:44:35Z",
                official: false,
              },
              {
                id: "1700017800002822880",
                item_id: 20011,
                type: "light_cone",
                timestamp: "2023-11-15T03:44:35Z",
                official: false,
              },
              {
                id: "1700017800002822881",
                item_id: 9999,
                type: "character",
                timestamp: "2023-11-15T03:44:35Z",
                official: false,
              },
            ],
          },
        },
      ],
    },
  },
};

const multiFile = {
  user: {
    username: "multi",
    gi: {
      uids: [
        {
          uid: "805218236",
          wishes: {
            beginner: [],
            standard: [],
            character: [
              {
                item_id: 10000003,
                type: "character",
                timestamp: "2024-01-01T00:00:00Z",
                official: true,
              },
            ],
            weapon: [],
            chronicled: [],
          },
        },
      ],
    },
    hsr: {
      uids: [
        {
          uid: "800003779",
          warps: {
            departure: [],
            standard: [],
            character: [
              {
                item_id: 1202,
                type: "character",
                timestamp: "2024-01-02T00:00:00Z",
                official: true,
              },
            ],
            light_cone: [
              {
                item_id: 20011,
                type: "light_cone",
                timestamp: "2024-01-03T00:00:00Z",
                official: true,
              },
            ],
          },
        },
      ],
    },
    zzz: {
      uids: [
        {
          uid: "100000001",
          signals: {
            standard: [],
            character: [
              {
                item_id: 1001,
                type: "character",
                timestamp: "2024-01-04T00:00:00Z",
                official: true,
              },
            ],
            w_engine: [],
            bangboo: [],
          },
        },
      ],
    },
  },
};

describe("pullImport", () => {
  describe("normalizeName", () => {
    it("lowercases, folds punctuation and ampersands", () => {
      expect(normalizeName("Pistols of Night")).toBe("pistolsofnight");
      expect(normalizeName("Ruan Mei & Co")).toBe("ruanmeiandco");
      expect(normalizeName("Aeon's Title")).toBe("aeonstitle");
    });
  });

  describe("categoryLabel", () => {
    it("labels stardb categories per game", () => {
      expect(categoryLabel("hsr", "character")).toBe("Character Event Warp");
      expect(categoryLabel("hsr", "light_cone")).toBe("Light Cone Event Warp");
      expect(categoryLabel("genshin", "chronicled")).toBe("Chronicled Wish");
      expect(categoryLabel("zzz", "bangboo")).toBe("Bangboo Channel");
    });

    it("labels wuwa pools and falls back to Pool N", () => {
      expect(categoryLabel("wuwa", "1")).toBe("Featured Resonator");
      expect(categoryLabel("wuwa", "5")).toBe("Novice Convene");
      expect(categoryLabel("wuwa", "7")).toBe("Giveback Event Convene");
      expect(categoryLabel("wuwa", "42")).toBe("Pool 42");
    });
  });

  describe("detectPullSource", () => {
    it("detects wuwatracker exports", () => {
      expect(detectPullSource(wuwaFile)).toEqual({ kind: "wuwatracker" });
    });

    it("detects stardb exports per game", () => {
      expect(detectPullSource(stardbFile)).toEqual({ kind: "stardb", game: "hsr" });
      expect(
        detectPullSource({ user: { gi: { uids: [] } } })
      ).toEqual({ kind: "stardb", game: "genshin" });
    });

    it("returns null for unrelated files", () => {
      expect(detectPullSource(null)).toBeNull();
      expect(detectPullSource({ hello: "world" })).toBeNull();
      expect(detectPullSource({ pulls: [] })).toBeNull();
    });

    it("detects the hinted game in a multi-game export", () => {
      expect(detectPullSource(multiFile, "genshin")).toEqual({
        kind: "stardb",
        game: "genshin",
      });
      expect(detectPullSource(multiFile, "hsr")).toEqual({
        kind: "stardb",
        game: "hsr",
      });
      expect(detectPullSource(multiFile, "zzz")).toEqual({
        kind: "stardb",
        game: "zzz",
      });
      expect(detectPullSource(multiFile, "wuwa")).toBeNull();
    });

    it("defaults to the first game when no hint is given", () => {
      expect(detectPullSource(multiFile)).toEqual({
        kind: "stardb",
        game: "genshin",
      });
    });

    it("rejects a wuwa-format file for other games", () => {
      expect(detectPullSource(wuwaFile, "wuwa")).toEqual({
        kind: "wuwatracker",
      });
      expect(detectPullSource(wuwaFile, "genshin")).toBeNull();
    });
  });

  describe("parseWuwaPulls", () => {
    const parsed = parseWuwaPulls(wuwaFile, wuwaMap)!;

    it("parses every record sorted ascending by time", () => {
      expect(parsed.game).toBe("wuwa");
      expect(parsed.total).toBe(5);
      expect(parsed.pulls).toHaveLength(5);
      expect(parsed.pulls.map((pull) => pull.ts)).toEqual(
        [...parsed.pulls.map((pull) => pull.ts)].sort((a, b) => a - b)
      );
    });

    it("resolves names, rarity and unit ids from the pull map", () => {
      const encore = parsed.pulls.find((pull) => pull.name === "Encore")!;
      expect(encore.rarity).toBe(5);
      expect(encore.unitId).toBe("992285");
      expect(encore.category).toBe("1");
      expect(encore.gameId).toBe("wuwa");
    });

    it("keeps same-second duplicates as distinct pulls", () => {
      const pistols = parsed.pulls.filter(
        (pull) => pull.name === "Pistols of Night"
      );
      expect(pistols).toHaveLength(2);
      expect(new Set(pistols.map((pull) => pull.id)).size).toBe(2);
      expect(pistols[0].id.endsWith("|0")).toBe(true);
      expect(pistols[1].id.endsWith("|1")).toBe(true);
    });

    it("reports unresolved entries without throwing", () => {
      expect(parsed.warnings).toHaveLength(1);
      expect(parsed.warnings[0]).toMatchObject({
        name: "Mystery Relic",
        count: 1,
      });
      const mystery = parsed.pulls.find((pull) => pull.name === "Mystery Relic")!;
      expect(mystery.unitId).toBeNull();
      expect(mystery.rarity).toBe(5);
    });

    it("collects unique pulled unit ids", () => {
      expect([...parsed.pulledUnitIds].sort()).toEqual(["992285", "992296"]);
    });

    it("produces identical ids when re-imported", () => {
      const again = parseWuwaPulls(wuwaFile, wuwaMap)!;
      expect(again.pulls.map((pull) => pull.id)).toEqual(
        parsed.pulls.map((pull) => pull.id)
      );
    });

    it("records source array position as seq", () => {
      expect(parsed.pulls.map((pull) => pull.seq)).toEqual([0, 1, 2, 3, 4]);
    });
  });

  describe("parseStardbPulls", () => {
    const parsed = parseStardbPulls(stardbFile, "hsr", hsrMap)!;

    it("parses grouped warps with their category", () => {
      expect(parsed.game).toBe("hsr");
      expect(parsed.total).toBe(4);
      expect(parsed.pulls.map((pull) => pull.category)).toEqual([
        "standard",
        "character",
        "character",
        "character",
      ]);
    });

    it("disambiguates same-timestamp duplicates with an occurrence suffix", () => {
      const dupes = parsed.pulls.filter((pull) => pull.itemId === "20011");
      expect(dupes).toHaveLength(2);
      expect(dupes[0].id).not.toBe(dupes[1].id);
      expect(dupes[0].name).toBe("Data Bank");
    });

    it("keeps unknown item ids as warnings", () => {
      expect(parsed.warnings).toHaveLength(1);
      expect(parsed.warnings[0].itemId).toBe("9999");
      const unknown = parsed.pulls.find((pull) => pull.itemId === "9999")!;
      expect(unknown.name).toBe("Item 9999");
      expect(unknown.rarity).toBeNull();
      expect(unknown.unitId).toBeNull();
    });

    it("collects unit ids that can be marked owned", () => {
      expect(parsed.pulledUnitIds).toEqual(["850001"]);
    });

    it("rejects wuwa as a stardb game", () => {
      expect(parseStardbPulls(stardbFile, "wuwa", hsrMap)).toBeNull();
    });

    it("keeps canonical bucket order for same-second pulls via seq", () => {
      expect(parsed.pulls.map((pull) => [pull.category, pull.seq])).toEqual([
        ["standard", 0],
        ["character", 0],
        ["character", 1],
        ["character", 2],
      ]);
    });

    it("keeps raw bucket positions when records are skipped", () => {
      const file = {
        user: {
          hsr: {
            uids: [
              {
                warps: {
                  character: [
                    { item_id: 20011, timestamp: "2023-11-15T03:44:35Z" },
                    { item_id: 20011, timestamp: "invalid" },
                    { item_id: 1202, timestamp: "2023-11-15T03:44:35Z" },
                  ],
                },
              },
            ],
          },
        },
      };
      const result = parseStardbPulls(file, "hsr", hsrMap)!;
      expect(result.pulls.map((pull) => pull.seq)).toEqual([0, 2]);
    });
  });

  describe("parsePullFile", () => {
    it("routes each format to its parser", () => {
      expect(parsePullFile(wuwaFile, withMaps({ wuwa: wuwaMap }))!.game).toBe(
        "wuwa"
      );
      expect(parsePullFile(stardbFile, withMaps({ hsr: hsrMap }))!.game).toBe(
        "hsr"
      );
    });

    it("returns null for unrecognized files", () => {
      expect(
        parsePullFile({ nope: true }, withMaps({ hsr: hsrMap }))
      ).toBeNull();
    });

    it("parses the hinted game section of a multi-game export", () => {
      const parsed = parsePullFile(
        multiFile,
        withMaps({ hsr: hsrMap }),
        "hsr"
      )!;
      expect(parsed.game).toBe("hsr");
      expect(parsed.total).toBe(2);
      expect(parsed.pulls.map((pull) => pull.category)).toEqual([
        "character",
        "light_cone",
      ]);
      expect(
        parsePullFile(multiFile, withMaps({ hsr: hsrMap }), "wuwa")
      ).toBeNull();
    });
  });

  describe("buildManualPull", () => {
    const base = {
      game: "hsr" as PullGame,
      ts: 1700000000000,
      category: "character",
      itemId: "1202",
      name: "Himeko",
      rarity: 5,
      unitId: "850001",
    };

    it("creates a manual pull with a free dedupe id", () => {
      const pull = buildManualPull({ ...base, existing: [] });
      expect(pull).toEqual({
        id: `${base.ts}|character|1202|0`,
        gameId: "hsr",
        itemId: "1202",
        unitId: "850001",
        name: "Himeko",
        rarity: 5,
        ts: base.ts,
        category: "character",
        manual: true,
      });
      expect(pull.seq).toBeUndefined();
    });

    it("bumps the occurrence past pulls sharing the base id", () => {
      const first = buildManualPull({ ...base, existing: [] });
      const second = buildManualPull({ ...base, existing: [first] });
      const third = buildManualPull({ ...base, existing: [first, second] });
      expect(second.id).toBe(`${base.ts}|character|1202|1`);
      expect(third.id).toBe(`${base.ts}|character|1202|2`);
    });

    it("skips ids taken by export-derived pulls", () => {
      const exported: GamePull = {
        id: `${base.ts}|character|1202|0`,
        gameId: "hsr",
        itemId: "1202",
        unitId: null,
        name: "Himeko",
        rarity: 5,
        ts: base.ts,
        category: "character",
        seq: 3,
      };
      const pull = buildManualPull({ ...base, existing: [exported] });
      expect(pull.id).toBe(`${base.ts}|character|1202|1`);
      expect(pull.manual).toBe(true);
    });

    it("keeps a provided seq so edits preserve export ordering", () => {
      const pull = buildManualPull({ ...base, existing: [], seq: 7 });
      expect(pull.seq).toBe(7);
    });
  });
});
