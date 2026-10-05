import { writeFileSync } from "node:fs";
import * as cheerio from "cheerio";
import { fetchRoster, fetchHtml, assertRoster } from "./lib/game8-roster.mjs";

const PAGE_URL = "https://game8.co/games/Genshin-Impact/archives/296707";
const WEAPONS_PAGE = "https://game8.co/games/Genshin-Impact/archives/304647";
const OUT = new URL("../src/data/genshin-units.json", import.meta.url);

async function fetchWeapons() {
  const html = await fetchHtml(WEAPONS_PAGE);
  const $ = cheerio.load(html);
  const weapons = [];
  $("table").each((_, t) => {
    const heads = $(t)
      .find("th")
      .slice(0, 4)
      .map((_, th) => $(th).text().replace(/\s+/g, " ").trim())
      .get();
    if (!(heads[1] === "Weapon" && heads[2] === "Rarity" && heads[3] === "Weapon Type")) {
      return;
    }
    $(t)
      .find("tr")
      .slice(1)
      .each((_, tr) => {
        const $cells = $(tr).find("td");
        if ($cells.length < 4) return;
        const $name = $cells.eq(1);
        const link = $name.find("a").first();
        const name = link.text().replace(/\s+/g, " ").trim();
        const image = $name.find("img").first().attr("data-src") || "";
        const url = link.attr("href") || "";
        const rarity = $cells.eq(2).text().trim();
        const weapon = $cells.eq(3).text().replace(/\s+/g, " ").trim();
        if (!name) return;
        const archiveId = (url.match(/\/archives\/(\d+)/) || [])[1];
        if (!archiveId) throw new Error(`weapon ${name}: no archive id in ${url}`);
        if (!image.startsWith("https://")) throw new Error(`weapon ${name}: no image`);
        if (rarity !== "5") throw new Error(`weapon ${name}: rarity "${rarity}" (expected 5)`);
        if (!["Sword", "Claymore", "Polearm", "Bow", "Catalyst"].includes(weapon)) {
          throw new Error(`weapon ${name}: bad type "${weapon}"`);
        }
        weapons.push({
          id: `w-${archiveId}`,
          name,
          imageUrl: image,
          url,
          rarity,
          element: null,
          weapon,
          type: "weapon",
        });
      });
  });
  if (weapons.length < 50) throw new Error(`only ${weapons.length} weapons`);
  return weapons;
}

async function main() {
  console.error("Fetching Genshin roster...");
  const items = await fetchRoster(PAGE_URL);
  assertRoster(items, { name: "genshin", minCount: 100, fields: ["rarity", "element", "weapon"] });

  const characters = items.map((item) => ({
    id: item.id,
    name: item.name.trim(),
    imageUrl: item.imageUrl,
    url: item.url,
    rarity: item.rarity,
    element: item.element,
    weapon: item.weapon,
    type: "character",
  }));

  console.error("Fetching Genshin 5-star weapons...");
  const weapons = await fetchWeapons();

  const units = [...characters, ...weapons];
  const ids = new Set();
  const names = new Set();
  for (const u of units) {
    if (ids.has(u.id)) throw new Error(`duplicate id ${u.id}`);
    if (names.has(u.name)) throw new Error(`duplicate name ${u.name}`);
    ids.add(u.id);
    names.add(u.name);
  }

  writeFileSync(OUT, JSON.stringify(units, null, 2) + "\n", "utf8");
  const byType = {};
  units.forEach((u) => (byType[u.type] = (byType[u.type] || 0) + 1));
  const byElement = {};
  units.forEach((u) => (byElement[u.element ?? "none"] = (byElement[u.element ?? "none"] || 0) + 1));
  console.error(`Wrote ${units.length} genshin units`);
  console.error(`  types: ${Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  console.error(`  elements: ${Object.entries(byElement).map(([k, v]) => `${k}=${v}`).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
