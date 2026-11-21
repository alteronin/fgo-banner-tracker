import { describe, it, expect } from "vitest";
import {
  compareTrackerBanners,
  type TrackerSortOption,
} from "@/lib/trackerSort";

interface Item {
  id: string;
  date: string | null;
  title: string;
  featured: number;
}

const accessors = {
  dateOf: (item: Item) => item.date,
  titleOf: (item: Item) => item.title,
  featuredCountOf: (item: Item) => item.featured,
  idOf: (item: Item) => item.id,
};

const items: Item[] = [
  { id: "a", date: "2026-02-01", title: "Beta Banner", featured: 2 },
  { id: "b", date: "2026-01-01", title: "Alpha Banner", featured: 5 },
  { id: "c", date: null, title: "No Date", featured: 1 },
  { id: "d", date: "2026-03-01", title: "Alpha Banner", featured: 3 },
];

function sorted(sort: TrackerSortOption): string[] {
  return [...items]
    .sort((a, b) => compareTrackerBanners(a, b, sort, accessors))
    .map((item) => item.id);
}

describe("compareTrackerBanners", () => {
  it("date-desc: newest first, null dates last", () => {
    expect(sorted("date-desc")).toEqual(["d", "a", "b", "c"]);
  });

  it("date-asc: oldest first, null dates still last", () => {
    expect(sorted("date-asc")).toEqual(["b", "a", "d", "c"]);
  });

  it("name-asc: title ascending", () => {
    expect(sorted("name-asc")).toEqual(["b", "d", "a", "c"]);
  });

  it("name-desc: title descending", () => {
    expect(sorted("name-desc")).toEqual(["c", "a", "b", "d"]);
  });

  it("featured-desc: most featured first", () => {
    expect(sorted("featured-desc")).toEqual(["b", "d", "a", "c"]);
  });

  it("featured-asc: least featured first", () => {
    expect(sorted("featured-asc")).toEqual(["c", "a", "d", "b"]);
  });

  it("breaks ties by id for determinism", () => {
    const tied: Item[] = [
      { id: "z", date: "2026-01-01", title: "Same", featured: 1 },
      { id: "a", date: "2026-01-01", title: "Same", featured: 1 },
    ];
    const result = [...tied].sort((x, y) =>
      compareTrackerBanners(x, y, "date-asc", accessors)
    );
    expect(result.map((i) => i.id)).toEqual(["a", "z"]);
  });

  it("both null dates tie then fall back to id", () => {
    const nulls: Item[] = [
      { id: "z", date: null, title: "B", featured: 1 },
      { id: "a", date: null, title: "A", featured: 1 },
    ];
    const result = [...nulls].sort((x, y) =>
      compareTrackerBanners(x, y, "date-asc", accessors)
    );
    expect(result.map((i) => i.id)).toEqual(["a", "z"]);
  });
});
