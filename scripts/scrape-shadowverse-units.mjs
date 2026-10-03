import { writeFileSync } from "node:fs";

const API = "https://shadowverse.fandom.com/api.php";
const UA = "Mozilla/5.0 (compatible; banner-tracker scraper)";
const OUT = new URL("../src/data/shadowverse-units.json", import.meta.url);

const SECTION_NAMES = [
  [/^Default Leaders$/i, "Default"],
  [/^Shadowverse Classic Leaders$/i, "Classic"],
  [/^Exchange Ticket Leaders$/i, "Exchange"],
  [/^Limited Leaders$/i, "Limited"],
  [/^Premium .*Battle Pass.* Leaders$/i, "Battle Pass"],
  [/^Special Leaders$/i, "Special"],
  [/^Frieren: Beyond Journey's End Leaders$/i, "Frieren"],
];

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

function normalizeSection(raw) {
  const clean = raw
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, "$2")
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/={2,}\s*|\s*={2,}/g, "")
    .trim();
  for (const [re, name] of SECTION_NAMES) {
    if (re.test(clean)) return name;
  }
  throw new Error(`unknown leader section: "${clean}"`);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function fetchWikitext() {
  const data = await api({ action: "parse", page: "Leader/Worlds Beyond", prop: "wikitext" });
  const wikitext = data.parse?.wikitext?.["*"];
  if (!wikitext) throw new Error("Leader/Worlds Beyond has no wikitext");
  return wikitext;
}

function parseEntries(wikitext) {
  const entries = [];
  let section = null;
  let inGallery = false;
  for (const line of wikitext.split("\n")) {
    const header = line.match(/^(==+)\s*(.+?)\s*==+$/);
    if (header) {
      const level = header[1].length;
      if (level === 2) section = normalizeSection(header[2]);
      inGallery = false;
      continue;
    }
    if (/<gallery/i.test(line)) {
      inGallery = true;
      continue;
    }
    if (/<\/gallery>/i.test(line)) {
      inGallery = false;
      continue;
    }
    if (!inGallery || !section) continue;
    const m = line.match(/^\s*(?:File:)?(.+?\.(?:png|jpe?g))\s*\|\s*(.+?)\s*$/i);
    if (!m) continue;
    const [, fileName, caption] = m;
    const links = [...caption.matchAll(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g)];
    if (links.length < 2) throw new Error(`caption missing links: "${caption}"`);
    const leaderPage = links[0][1].trim();
    const leaderName = (links[0][2] || links[0][1]).trim();
    const className = (links[1][2] || links[1][1]).trim();
    entries.push({ section, fileName, leaderPage, leaderName, className });
  }
  if (entries.length < 55) throw new Error(`only ${entries.length} gallery entries`);
  return entries;
}

function qualifyDuplicates(entries) {
  const groups = new Map();
  for (const e of entries) {
    if (!groups.has(e.leaderName)) groups.set(e.leaderName, []);
    groups.get(e.leaderName).push(e);
  }
  const units = [];
  for (const [name, group] of groups) {
    if (group.length === 1) {
      group[0].leaderName = name;
      units.push(group[0]);
      continue;
    }
    for (const e of group) {
      const paren = e.fileName.match(/\(([^)]+)\)/);
      if (paren) e.leaderName = `${name} (${paren[1]})`;
      units.push(e);
    }
  }
  return units;
}

async function fetchImageUrls(fileNames) {
  const urls = new Map();
  for (const batch of chunk(fileNames.map((f) => `File:${f}`), 50)) {
    const data = await api({
      action: "query",
      titles: batch.join("|"),
      prop: "imageinfo",
      iiprop: "url",
    });
    for (const page of Object.values(data.query.pages)) {
      urls.set(page.title.replace(/^File:/, ""), page.imageinfo?.[0]?.url || null);
    }
  }
  return urls;
}

async function main() {
  console.error("Fetching Leader/Worlds Beyond wikitext...");
  const wikitext = await fetchWikitext();
  const parsed = qualifyDuplicates(parseEntries(wikitext));
  console.error(`  ${parsed.length} leaders after dedupe`);

  console.error("Resolving emblems...");
  const imageUrls = await fetchImageUrls(parsed.map((p) => p.fileName));

  const errors = [];
  const skipped = [];
  const units = [];
  const seen = new Set();
  for (const p of parsed) {
    const imageUrl = imageUrls.get(p.fileName);
    if (!imageUrl?.startsWith("https://")) {
      skipped.push(`${p.leaderName}: no emblem (${p.fileName})`);
      continue;
    }
    const id = slugify(p.leaderName);
    if (seen.has(id)) {
      errors.push(`${p.leaderName}: duplicate id ${id}`);
      continue;
    }
    seen.add(id);
    units.push({
      id,
      name: p.leaderName,
      imageUrl,
      url: `https://shadowverse.fandom.com/wiki/${encodeURIComponent(p.leaderPage.replace(/ /g, "_"))}`,
      className: p.className,
      obtain: p.section,
    });
  }

  if (errors.length) {
    console.error("ERRORS:");
    errors.forEach((e) => console.error("  " + e));
    throw new Error(`${errors.length} errors`);
  }
  if (skipped.length) {
    console.error(`SKIPPED (broken images on wiki):`);
    skipped.forEach((s) => console.error("  " + s));
  }
  if (skipped.length > 5) throw new Error(`too many missing emblems: ${skipped.length}`);
  if (units.length < 60) throw new Error(`only ${units.length} leaders`);

  const tally = (key) => {
    const counts = {};
    units.forEach((u) => (counts[u[key]] = (counts[u[key]] || 0) + 1));
    return Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(", ");
  };
  writeFileSync(OUT, JSON.stringify(units, null, 2) + "\n", "utf8");
  console.error(`Wrote ${units.length} shadowverse leaders`);
  console.error(`  classes: ${tally("className")}`);
  console.error(`  obtain: ${tally("obtain")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
