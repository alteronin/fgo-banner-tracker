import { writeFileSync } from "node:fs";
import { fetchRoster, assertRoster } from "./lib/game8-roster.mjs";

const PAGE_URL = "https://game8.co/games/Wuthering-Waves/archives/452489";
const OUT = new URL("../src/data/wuwa-units.json", import.meta.url);

async function main() {
  console.error("Fetching WuWa roster...");
  const items = await fetchRoster(PAGE_URL);
  assertRoster(items, { name: "wuwa", minCount: 45, fields: ["rarity", "element", "weapon"] });

  const units = items.map((item) => ({
    id: item.id,
    name: item.name.trim(),
    imageUrl: item.imageUrl,
    url: item.url,
    rarity: item.rarity,
    element: item.element,
    weapon: item.weapon,
  }));

  writeFileSync(OUT, JSON.stringify(units, null, 2) + "\n", "utf8");
  const byElement = {};
  units.forEach((u) => (byElement[u.element] = (byElement[u.element] || 0) + 1));
  console.error(`Wrote ${units.length} wuwa units`);
  console.error(`  elements: ${Object.entries(byElement).map(([k, v]) => `${k}=${v}`).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
