import { writeFileSync } from "node:fs";

const API = "https://honkaiimpact3.fandom.com/api.php";
const UA = "Mozilla/5.0 (compatible; banner-tracker scraper)";
const OUT = new URL("../src/data/hi3-units.json", import.meta.url);

async function api(params, attempts = 4) {
  const url = `${API}?${new URLSearchParams({ format: "json", ...params })}`;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA } });
      if (res.status === 429 || res.status >= 500) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return await res.json();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchCategoryMembers() {
  const titles = [];
  let cont;
  do {
    const params = {
      action: "query",
      list: "categorymembers",
      cmtitle: "Category:Battlesuits",
      cmlimit: "500",
      cmtype: "page",
    };
    if (cont) params.cmcontinue = cont;
    const data = await api(params);
    titles.push(...data.query.categorymembers.map((m) => m.title));
    cont = data.continue?.cmcontinue;
  } while (cont);
  return titles;
}

async function fetchBattlesuitData() {
  const data = await api({ action: "parse", page: "Module:Battlesuit/data", prop: "wikitext" });
  const wikitext = data.parse?.wikitext?.["*"];
  if (!wikitext) throw new Error("Module:Battlesuit/data has no wikitext");
  const entries = new Map();
  const starts = [...wikitext.matchAll(/\["((?:[^"\\]|\\.)*)"\]\s*=\s*\{/g)];
  for (let i = 0; i < starts.length; i++) {
    const name = starts[i][1];
    const end = i + 1 < starts.length ? starts[i + 1].index : wikitext.length;
    const block = wikitext.slice(starts[i].index, end);
    const grab = (key) => {
      const m = block.match(new RegExp(`\\b${key}\\s*=\\s*"([^"]*)"`));
      return m ? m[1] : null;
    };
    const character = grab("character");
    const baseRank = grab("base_rank");
    const gameType = grab("game_type");
    if (!character || !baseRank || !gameType) continue;
    entries.set(name, {
      character,
      rank: baseRank,
      type: gameType,
      weapon: grab("weapon"),
      dmgType: grab("dmg_type"),
      version: grab("version_all"),
    });
  }
  if (entries.size < 90) throw new Error(`parsed only ${entries.size} battlesuit data entries`);
  return entries;
}

async function fetchImageUrls(names) {
  const urls = new Map();
  const wanted = names.map((n) => `File:${n.replace(/:/g, " -")} (Thumbnail).png`);
  for (const batch of chunk(wanted, 50)) {
    const data = await api({
      action: "query",
      titles: batch.join("|"),
      prop: "imageinfo",
      iiprop: "url",
    });
    for (const page of Object.values(data.query.pages)) {
      const fileTitle = page.title.replace(/^File:/, "");
      urls.set(fileTitle, page.imageinfo?.[0]?.url || null);
    }
  }
  return urls;
}

async function main() {
  console.error("Fetching battlesuit category...");
  const titles = await fetchCategoryMembers();
  console.error(`  ${titles.length} battlesuits`);
  if (titles.length < 90) throw new Error(`only ${titles.length} battlesuits`);

  console.error("Fetching Module:Battlesuit/data...");
  const dataEntries = await fetchBattlesuitData();
  console.error(`  ${dataEntries.size} data entries`);

  console.error("Resolving portraits...");
  const imageUrls = await fetchImageUrls(titles);

  const errors = [];
  const units = [];
  for (const title of titles) {
    const entry = dataEntries.get(title);
    if (!entry) {
      errors.push(`${title}: no data module entry`);
      continue;
    }
    const fileKey = `${title.replace(/:/g, " -")} (Thumbnail).png`;
    const imageUrl = imageUrls.get(fileKey);
    if (!imageUrl?.startsWith("https://")) {
      errors.push(`${title}: no portrait (${fileKey})`);
      continue;
    }
    units.push({
      id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: title,
      imageUrl,
      url: `https://honkaiimpact3.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
      character: entry.character,
      rank: entry.rank,
      type: entry.type,
      weapon: entry.weapon,
      dmgType: entry.dmgType,
      version: entry.version,
    });
  }

  if (errors.length) {
    console.error("ERRORS:");
    errors.forEach((e) => console.error("  " + e));
    throw new Error(`${errors.length} errors`);
  }

  const seen = new Set();
  for (const u of units) {
    if (seen.has(u.name)) throw new Error(`duplicate battlesuit ${u.name}`);
    seen.add(u.name);
  }

  writeFileSync(OUT, JSON.stringify(units, null, 2) + "\n", "utf8");
  const tally = (key) => {
    const counts = {};
    units.forEach((u) => (counts[u[key]] = (counts[u[key]] || 0) + 1));
    return Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", ");
  };
  console.error(`Wrote ${units.length} hi3 battlesuits`);
  console.error(`  ranks: ${tally("rank")}`);
  console.error(`  types: ${tally("type")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
