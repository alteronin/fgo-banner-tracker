const NULL_DATE_SORT_KEY = "9999-99-99";

export interface RerunAccessors<T> {
  idOf: (item: T) => string;
  dateOf: (item: T) => string | null;
  unitsOf: (item: T) => string[];
}

/**
 * Classifies banners as reruns: an item is a rerun when any of its units
 * already appeared on a strictly earlier-dated item.
 *
 * - Items are walked in (date asc, id asc) order; null/missing dates sort last.
 * - Items sharing the same date never flag each other — a date-group's units
 *   are merged into the seen-set only after the whole group is processed.
 * - Empty unit lists never flag and never seed the seen-set.
 */
export function computeRerunIds<T>(
  items: readonly T[],
  accessors: RerunAccessors<T>
): Set<string> {
  const { idOf, dateOf, unitsOf } = accessors;

  const ordered = items
    .map((item) => ({
      id: idOf(item),
      date: dateOf(item) ?? NULL_DATE_SORT_KEY,
      units: unitsOf(item),
    }))
    .sort((a, b) => {
      const byDate = a.date.localeCompare(b.date);
      if (byDate !== 0) return byDate;
      return a.id.localeCompare(b.id);
    });

  const rerunIds = new Set<string>();
  const seen = new Set<string>();

  let groupDate: string | null = null;
  let pendingUnits: string[] = [];

  const flushGroup = (): void => {
    for (const unit of pendingUnits) seen.add(unit);
    pendingUnits = [];
  };

  for (const entry of ordered) {
    if (groupDate !== null && entry.date !== groupDate) {
      flushGroup();
      groupDate = entry.date;
    }
    groupDate = entry.date;

    if (entry.units.length > 0) {
      const isRerun = entry.units.some((unit) => seen.has(unit));
      if (isRerun) rerunIds.add(entry.id);
      pendingUnits.push(...entry.units);
    }
  }

  return rerunIds;
}
