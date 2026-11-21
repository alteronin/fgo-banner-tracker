import { describe, it, expect } from "vitest";
import { computeRerunIds } from "@/lib/rerun";

interface Item {
  id: string;
  date: string | null;
  units: string[];
}

const accessors = {
  idOf: (item: Item) => item.id,
  dateOf: (item: Item) => item.date,
  unitsOf: (item: Item) => item.units,
};

describe("computeRerunIds", () => {
  it("flags a later banner only when all its units were seen earlier", () => {
    const items: Item[] = [
      { id: "b2", date: "2026-02-01", units: ["alice"] },
      { id: "b1", date: "2026-01-01", units: ["alice"] },
    ];
    const result = computeRerunIds(items, accessors);
    expect(result.has("b1")).toBe(false);
    expect(result.has("b2")).toBe(true);
  });

  it("does not flag the earliest appearance of each unit", () => {
    const items: Item[] = [
      { id: "a", date: "2026-01-01", units: ["alice"] },
      { id: "b", date: "2026-01-15", units: ["bob"] },
      { id: "c", date: "2026-02-01", units: ["carol"] },
    ];
    expect(computeRerunIds(items, accessors).size).toBe(0);
  });

  it("does NOT flag when the banner has any new unit (even if others repeat)", () => {
    const items: Item[] = [
      { id: "b1", date: "2026-01-01", units: ["alice"] },
      { id: "b2", date: "2026-02-01", units: ["alice", "bob"] },
    ];
    const result = computeRerunIds(items, accessors);
    expect(result.has("b2")).toBe(false);
  });

  it("flags when a mixed banner's units are all previously seen", () => {
    const items: Item[] = [
      { id: "seed-a", date: "2026-01-01", units: ["alice"] },
      { id: "seed-b", date: "2026-01-02", units: ["bob"] },
      { id: "all-seen", date: "2026-02-01", units: ["alice", "bob"] },
      { id: "one-new", date: "2026-02-02", units: ["alice", "carol"] },
    ];
    const result = computeRerunIds(items, accessors);
    expect(result.has("all-seen")).toBe(true);
    expect(result.has("one-new")).toBe(false);
  });

  it("never cross-flags banners sharing the same date", () => {
    const items: Item[] = [
      { id: "b1", date: "2026-01-01", units: ["alice"] },
      { id: "b2", date: "2026-01-01", units: ["alice"] },
    ];
    const result = computeRerunIds(items, accessors);
    expect(result.size).toBe(0);
  });

  it("same-date group seeds only after the whole group (strictly earlier)", () => {
    const items: Item[] = [
      { id: "day1-a", date: "2026-01-01", units: ["alice"] },
      { id: "day1-b", date: "2026-01-01", units: ["alice"] },
      { id: "day2-a", date: "2026-01-02", units: ["alice"] },
    ];
    const result = computeRerunIds(items, accessors);
    expect(result.has("day1-a")).toBe(false);
    expect(result.has("day1-b")).toBe(false);
    expect(result.has("day2-a")).toBe(true);
  });

  it("same-day banner with a new unit is not flagged even if a twin repeats", () => {
    const items: Item[] = [
      { id: "seed", date: "2026-01-01", units: ["alice"] },
      { id: "day2-repeat", date: "2026-01-02", units: ["alice"] },
      { id: "day2-mixed", date: "2026-01-02", units: ["alice", "bob"] },
    ];
    const result = computeRerunIds(items, accessors);
    expect(result.has("day2-repeat")).toBe(true);
    expect(result.has("day2-mixed")).toBe(false);
  });

  it("empty unit lists never flag and never seed", () => {
    const items: Item[] = [
      { id: "empty1", date: "2026-01-01", units: [] },
      { id: "empty2", date: "2026-01-02", units: [] },
      { id: "with-unit", date: "2026-01-03", units: ["alice"] },
    ];
    const result = computeRerunIds(items, accessors);
    expect(result.size).toBe(0);
  });

  it("null dates sort last and can be flagged but do not seed earlier items", () => {
    const items: Item[] = [
      { id: "null-date", date: null, units: ["alice"] },
      { id: "early", date: "2026-01-01", units: ["alice"] },
      { id: "mid", date: "2026-01-02", units: ["bob"] },
    ];
    const result = computeRerunIds(items, accessors);
    expect(result.has("early")).toBe(false);
    expect(result.has("mid")).toBe(false);
    expect(result.has("null-date")).toBe(true);
  });

  it("ties on date break by id (deterministic)", () => {
    const items: Item[] = [
      { id: "z-first-by-id", date: "2026-01-01", units: ["alice"] },
      { id: "a-second-by-id", date: "2026-01-01", units: ["alice"] },
    ];
    // Same date: neither flags regardless of id order
    expect(computeRerunIds(items, accessors).size).toBe(0);

    const crossDate: Item[] = [
      { id: "z-early", date: "2026-01-01", units: ["alice"] },
      { id: "a-late", date: "2026-01-02", units: ["alice"] },
    ];
    const result = computeRerunIds(crossDate, accessors);
    expect(result.has("z-early")).toBe(false);
    expect(result.has("a-late")).toBe(true);
  });

  it("handles empty input", () => {
    expect(computeRerunIds([], accessors).size).toBe(0);
  });
});
