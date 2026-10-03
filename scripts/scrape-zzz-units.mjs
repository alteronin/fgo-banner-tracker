import { writeFileSync } from "node:fs";
import { fetchRoster, assertRoster } from "./lib/game8-roster.mjs";

const PAGE_URL = "https://game8.co/games/Zenless-Zone-Zero/archives/435684";
const OUT = new URL("../src/data/zzz-units.json", import.meta.url);

async function main() {
  console.error("Fetching ZZZ roster...");
  const items = await fetchRoster(PAGE_URL);
  assertRoster(items, { name: "zzz", minCount: 45, fields: ["rarity", "attribute", "specialty"] });

  const units = items.map((item) => ({
    id: item.id,
    name: item.name.trim(),
    imageUrl: item.imageUrl,
    url: item.url,
    rarity: item.rarity,
    attribute: item.attribute,
    specialty: item.specialty,
  }));

  writeFileSync(OUT, JSON.stringify(units, null, 2) + "\n", "utf8");
  const byAttr = {};
  units.forEach((u) => (byAttr[u.attribute] = (byAttr[u.attribute] || 0) + 1));
  console.error(`Wrote ${units.length} zzz units`);
  console.error(`  attributes: ${Object.entries(byAttr).map(([k, v]) => `${k}=${v}`).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
