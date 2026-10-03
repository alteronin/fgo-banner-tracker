import { writeFileSync } from "node:fs";
import { fetchRoster, assertRoster } from "./lib/game8-roster.mjs";

const PAGE_URL = "https://game8.co/games/Genshin-Impact/archives/296707";
const OUT = new URL("../src/data/genshin-units.json", import.meta.url);

async function main() {
  console.error("Fetching Genshin roster...");
  const items = await fetchRoster(PAGE_URL);
  assertRoster(items, { name: "genshin", minCount: 100, fields: ["rarity", "element", "weapon"] });

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
  console.error(`Wrote ${units.length} genshin units`);
  console.error(`  elements: ${Object.entries(byElement).map(([k, v]) => `${k}=${v}`).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
