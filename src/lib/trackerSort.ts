export type TrackerSortOption =
  | "date-desc"
  | "date-asc"
  | "name-asc"
  | "name-desc"
  | "featured-desc"
  | "featured-asc";

export interface TrackerSortAccessors<T> {
  dateOf: (item: T) => string | null;
  titleOf: (item: T) => string;
  featuredCountOf: (item: T) => number;
  idOf: (item: T) => string;
}

function compareNullableDates(
  a: string | null,
  b: string | null,
  desc: boolean
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return desc ? b.localeCompare(a) : a.localeCompare(b);
}

export function compareTrackerBanners<T>(
  a: T,
  b: T,
  sort: TrackerSortOption,
  accessors: TrackerSortAccessors<T>
): number {
  const { dateOf, titleOf, featuredCountOf, idOf } = accessors;

  let primary = 0;
  switch (sort) {
    case "date-desc":
      primary = compareNullableDates(dateOf(a), dateOf(b), true);
      break;
    case "date-asc":
      primary = compareNullableDates(dateOf(a), dateOf(b), false);
      break;
    case "name-asc":
      primary = titleOf(a).localeCompare(titleOf(b));
      break;
    case "name-desc":
      primary = titleOf(b).localeCompare(titleOf(a));
      break;
    case "featured-desc":
      primary = featuredCountOf(b) - featuredCountOf(a);
      break;
    case "featured-asc":
      primary = featuredCountOf(a) - featuredCountOf(b);
      break;
  }

  if (primary !== 0) return primary;
  return idOf(a).localeCompare(idOf(b));
}
