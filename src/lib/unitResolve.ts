import type { UnitGame } from "@/types/units";
import { UNIT_NAME_ALIASES } from "./unitAliases";

export interface UnitIndexEntry {
  id: string;
  name: string;
}

export interface UnitIndex {
  byExact: Map<string, string>;
  byNorm: Map<string, string>;
}

export function normalizeUnitName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function buildUnitIndex(
  units: readonly UnitIndexEntry[],
  game: UnitGame
): UnitIndex {
  const byExact = new Map<string, string>();
  const byNorm = new Map<string, string>();
  for (const unit of units) {
    if (!byExact.has(unit.name)) byExact.set(unit.name, unit.id);
    const norm = normalizeUnitName(unit.name);
    if (norm && !byNorm.has(norm)) byNorm.set(norm, unit.id);
  }
  const aliases = UNIT_NAME_ALIASES[game] ?? {};
  for (const [from, to] of Object.entries(aliases)) {
    const key = normalizeUnitName(from);
    if (!key || byNorm.has(key)) continue;
    const targetId = byExact.get(to) ?? byNorm.get(normalizeUnitName(to));
    if (targetId !== undefined) byNorm.set(key, targetId);
  }
  return { byExact, byNorm };
}

export function resolveUnitName(name: string, index: UnitIndex): string | null {
  const exact = index.byExact.get(name);
  if (exact) return exact;
  const norm = normalizeUnitName(name);
  const hit = norm ? index.byNorm.get(norm) : undefined;
  return hit ?? null;
}

export function syntheticStatusKey(name: string): string {
  return `name:${normalizeUnitName(name)}`;
}
