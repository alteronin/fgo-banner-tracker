import { writeFileSync } from "node:fs";
import * as cheerio from "cheerio";
import { fetchRoster, fetchHtml, assertRoster } from "./lib/game8-roster.mjs";

const CHARS_PAGE = "https://game8.co/games/Honkai-Star-Rail/archives/404256";
const LC_PAGE = "https://game8.co/games/Honkai-Star-Rail/archives/406599";
const OUT = new URL("../src/data/hsr-units.json", import.meta.url);

async function fetchLightCones() {
  const html = await fetchHtml(LC_PAGE);
  const $ = cheerio.load(html);
  const cones = [];
  $("table").each((_, t) => {
    const $t = $(t);
    const heads = $t.find("th").slice(0, 4).map((_, th) => $(th).text().replace(/\s+/g, " ").trim()).get();
    if (heads.slice(0, 3).join("|") !== "Light Cone|Rarity|Path") return;
    $t.find("tr").slice(1).each((_, tr) => {
      const $cells = $(tr).find("td");
      if ($cells.length < 3) return;
      const $first = $cells.eq(0);
      const link = $first.find("a").first();
      const name = link.text().replace(/\s+/g, " ").trim() || $first.text().replace(/\s+/g, " ").trim();
      const image = $first.find("img").first().attr("data-src") || "";
      const url = link.attr("href") || "";
      const rarity = $cells.eq(1).text().replace(/\s+/g, " ").trim();
      const path = $cells.eq(2).text().replace(/\s+/g, " ").trim();
      if (!name) return;
      const archiveId = (url.match(/\/archives\/(\d+)/) || [])[1];
      if (!archiveId) throw new Error(`light cone ${name}: no archive id in ${url}`);
      if (!image.startsWith("https://")) throw new Error(`light cone ${name}: no image`);
      const rarityDigit = (rarity.match(/\d/) || [])[0];
      if (!rarityDigit) throw new Error(`light cone ${name}: bad rarity "${rarity}"`);
      cones.push({
        id: `lc-${archiveId}`,
        name,
        imageUrl: image,
        url,
        rarity: rarityDigit,
        path,
        type: "light-cone",
      });
    });
  });
  if (cones.length < 100) throw new Error(`only ${cones.length} light cones`);
  return cones;
}

async function main() {
  console.error("Fetching HSR characters...");
  const chars = await fetchRoster(CHARS_PAGE);
  assertRoster(chars, { name: "hsr-chars", minCount: 80, fields: ["rarity", "path", "element"] });
  const charUnits = chars.map((item) => ({
    id: item.id,
    name: item.name.trim(),
    imageUrl: item.imageUrl,
    url: item.url,
    rarity: item.rarity,
    path: item.path,
    element: item.element,
    type: "character",
  }));

  console.error("Fetching HSR light cones...");
  const cones = await fetchLightCones();
  assertRoster(cones, { name: "hsr-light-cones", minCount: 100, fields: ["rarity", "path", "type"] });

  const units = [...charUnits, ...cones];
  const names = new Set();
  for (const u of units) {
    if (names.has(u.name)) throw new Error(`duplicate unit name across chars/cones: ${u.name}`);
    names.add(u.name);
  }

  writeFileSync(OUT, JSON.stringify(units, null, 2) + "\n", "utf8");
  console.error(`Wrote ${units.length} hsr units (${charUnits.length} characters, ${cones.length} light cones)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
