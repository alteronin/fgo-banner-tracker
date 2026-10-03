import { writeFileSync } from "node:fs";
import * as cheerio from "cheerio";

const PAGE_URL = "https://shadowverse-wb.com/en/cards/";
const OUT = new URL("../src/data/shadowverse-banners.json", import.meta.url);

const SETS = {
  "Revenants of Azvaldt": {
    date: "2026-08-27",
    leaders: ["Barbaros", "Magachiyo"],
  },
  "Chronicle of Destiny": {
    date: "2026-06-29",
    leaders: ["Lumiore", "Zoe"],
  },
  "Anathema's Gambit": {
    date: "2026-04-28",
    leaders: ["Gildaria", "Adahime"],
  },
  "Apocalypse Pact": {
    date: "2026-02-26",
    leaders: ["Kandima", "Shymm"],
  },
  "Blossoming Fate": {
    date: "2025-12-29",
    leaders: ["Imari", "Unkei"],
  },
  "Skybound Dragons": {
    date: "2025-10-29",
    leaders: ["Beelzebub", "Belial", "Ewiyar", "Fediel", "Galleon", "Lu Woh", "Wamdus", "Wilnas"],
  },
  "Heirs of the Omen": {
    date: "2025-08-27",
    leaders: ["Galmieux", "Sinciro"],
  },
  "Infinity Evolved": {
    date: "2025-07-17",
    leaders: ["Aether", "Filene", "Titania"],
  },
  "Legends Rise": {
    date: "2025-06-17",
    leaders: ["Albert", "Cerberus", "Daria", "Orchis"],
  },
};

const COLLABS = [
  {
    id: "collab-frieren",
    name: "Frieren: Beyond Journey's End",
    startDate: "2025-12-29",
    endDate: "2026-01-27",
    leaders: ["Aura", "Fern", "Frieren", "Stark"],
    url: "https://collaboration.shadowverse-wb.com/frieren/en/",
    image: "https://collaboration.shadowverse-wb.com/frieren/en/ogp/ogp.png",
  },
];

function cleanText(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

async function main() {
  console.error("Fetching card set list...");
  const res = await fetch(PAGE_URL, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; banner-tracker scraper)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();

  const $ = cheerio.load(html);
  const sets = [];
  const seen = new Set();
  $("a[href*='/cards/pack/']").each((_, a) => {
    const $a = $(a);
    const name = cleanText($a.text());
    if (!name || seen.has(name)) return;
    seen.add(name);
    const href = $a.attr("href");
    const img = $a.find("img").first().attr("src");
    if (!img) throw new Error(`${name}: no pack image on listing page`);
    sets.push({
      name,
      url: href.startsWith("/") ? `https://shadowverse-wb.com${href}` : href,
      image: img.startsWith("/") ? `https://shadowverse-wb.com${img}` : img,
    });
  });
  console.error(`Found ${sets.length} card sets: ${sets.map((s) => s.name).join(", ")}`);
  if (sets.length < 9) throw new Error("expected at least 9 card sets");

  const errors = [];
  const entries = [];
  for (const s of sets) {
    const meta = SETS[s.name];
    if (!meta) {
      errors.push(`unknown card set (no researched date/leaders): ${s.name}`);
      continue;
    }
    if (!meta.leaders.length) {
      errors.push(`${s.name}: no leaders researched`);
      continue;
    }
    entries.push({
      id: `set-${s.url.split("/").filter(Boolean).pop()}`,
      type: "set",
      version: null,
      phase: null,
      banners: [{ name: s.name, url: s.url, image: s.image }],
      startDate: meta.date,
      endDate: null,
      featured5: meta.leaders.map((name) => ({ name, url: null, image: null })),
      featured4: [],
    });
  }

  for (const c of COLLABS) {
    const span = (Date.parse(c.endDate) - Date.parse(c.startDate)) / 86400000;
    if (span <= 0 || span > 60) {
      errors.push(`${c.id}: bad collab span ${span}d`);
      continue;
    }
    entries.push({
      id: c.id,
      type: "collab",
      version: null,
      phase: null,
      banners: [{ name: c.name, url: c.url, image: c.image }],
      startDate: c.startDate,
      endDate: c.endDate,
      featured5: c.leaders.map((name) => ({ name, url: null, image: null })),
      featured4: [],
    });
  }

  if (errors.length) {
    console.error("ERRORS:");
    errors.forEach((e) => console.error("  " + e));
    throw new Error(`${errors.length} errors`);
  }

  entries.sort((a, b) => (a.startDate < b.startDate ? 1 : a.startDate > b.startDate ? -1 : 0));

  const idSeen = new Set();
  for (const e of entries) {
    if (idSeen.has(e.id)) throw new Error(`duplicate id ${e.id}`);
    idSeen.add(e.id);
    if (e.endDate && e.endDate <= e.startDate) throw new Error(`bad range: ${e.id}`);
    if (!e.featured5.length) throw new Error(`no featured5: ${e.id}`);
    if (!e.banners[0].image) throw new Error(`no banner image: ${e.id}`);
    if (e.banners[0].url && !e.banners[0].url.startsWith("https://"))
      throw new Error(`bad url: ${e.id}`);
  }

  writeFileSync(OUT, JSON.stringify(entries, null, 2) + "\n", "utf8");
  console.error(`Wrote ${entries.length} entries`);
  console.error(
    `  sets: ${entries.filter((e) => e.type === "set").length}, collabs: ${entries.filter((e) => e.type === "collab").length}`
  );
  console.error(
    `  range: ${entries[0].startDate} (${entries[0].id}) -> ${entries[entries.length - 1].startDate} (${entries[entries.length - 1].id})`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
