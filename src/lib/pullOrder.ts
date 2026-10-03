import type { GamePull } from "@/types/pulls";

export function comparePullOrder(a: GamePull, b: GamePull): number {
  if (a.ts !== b.ts) return a.ts - b.ts;
  if (
    a.category === b.category &&
    a.seq !== undefined &&
    b.seq !== undefined &&
    a.seq !== b.seq
  ) {
    return a.seq - b.seq;
  }
  return a.id.localeCompare(b.id);
}
