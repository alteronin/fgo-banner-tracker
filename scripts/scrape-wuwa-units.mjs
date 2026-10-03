import { writeFileSync } from "node:fs";
import * as cheerio from "cheerio";
import { fetchRoster, fetchHtml, assertRoster } from "./lib/game8-roster.mjs";

const ROSTER_PAGE = "https://game8.co/games/Wuthering-Waves/archives/452489";
const WEAPONS_PAGE = "https://game8.co/games/Wuthering-Waves/archives/452490";
const OUT = new URL("../src/data/wuwa-units.json", import.meta.url);

function text($, el) {
  return $(el).text().replace(/\s+/g, " ").trim();
}

async function fetchWeapons() {
  const html = await fetchHtml(WEAPONS_PAGE);
  const $ = cheerio.load(html);
  const weapons = [];
  $("table").each((_, t) => {
    const heads = $(t).find("th").slice(0, 3).map((_, th) => text($, th)).get();
    if (heads.slice(0, 3).join("|") !== "Weapon|Type|Rarity") return;
    $(t).find("tr").slice(1).each((_, tr) => {
      const $cells = $(tr).find("td");
      if ($cells.length < 3) return;
      const $first = $cells.eq(0);
      const link = $first.find("a").first();
      const name = link.clone().children().remove().end().text().replace(/\s+/g, " ").trim();
      const image = $first.find("img").first().attr("data-src") || "";
      const url = link.attr("href") || "";
      const type = text($, $cells.eq(1));
      const rarityLabel = text($, $cells.eq(2));
      if (!name) return;
      const archiveId = (url.match(/\/archives\/(\d+)/) || [])[1];
      if (!archiveId) throw new Error(`weapon ${name}: no archive id in ${url}`);
      if (!image.startsWith("https://")) throw new Error(`weapon ${name}: no image`);
      const rarity = (rarityLabel.match(/\d/) || [])[0];
      if (!rarity) throw new Error(`weapon ${name}: bad rarity "${rarityLabel}"`);
      if (!["Sword", "Broadblade", "Gauntlet", "Pistol", "Rectifier"].includes(type)) {
        throw new Error(`weapon ${name}: bad type "${type}"`);
      }
      weapons.push({
        id: `w-${archiveId}`,
        name,
        imageUrl: image,
        url,
        rarity,
        element: null,
        weapon: type,
        type: "weapon",
      });
    });
  });
  if (weapons.length < 100) throw new Error(`only ${weapons.length} weapons`);
  return weapons;
}

async function main() {
  console.error("Fetching WuWa resonators...");
  const items = await fetchRoster(ROSTER_PAGE);
  assertRoster(items, { name: "wuwa", minCount: 45, fields: ["rarity", "element", "weapon"] });

  const resonators = items.map((item) => ({
    id: item.id,
    name: item.name.trim(),
    imageUrl: item.imageUrl,
    url: item.url,
    rarity: item.rarity,
    element: item.element,
    weapon: item.weapon,
    type: "resonator",
  }));

  console.error("Fetching WuWa weapons...");
  const weapons = await fetchWeapons();

  const units = [...resonators, ...weapons];
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
  const byRarity = {};
  units.forEach((u) => (byRarity[u.rarity] = (byRarity[u.rarity] || 0) + 1));
  console.error(`Wrote ${units.length} wuwa units`);
  console.error(`  ${Object.entries(byType).map(([k, v]) => `${k}=${v}`).join(", ")}`);
  console.error(`  rarity: ${Object.entries(byRarity).map(([k, v]) => `${k}star=${v}`).join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
