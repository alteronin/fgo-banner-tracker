// Script to extract all servant data from GamePress
// Uses sitemap for slugs + individual page fetches for icon URLs
// Run: node scripts/scrape-servants.mjs

import { writeFileSync, readFileSync, existsSync } from "fs";
import * as cheerio from "cheerio";

const SITEMAP_URL = "https://grandorder.gamepress.gg/sitemap.xml";
const BATCH_SIZE = 20;
const DELAY_MS = 500;

async function main() {
  // Step 1: Get all servant slugs from sitemap
  console.error("Fetching sitemap...");
  const slugs = await getSlugsFromSitemap();
  console.error(`Found ${slugs.length} servant slugs`);

  // Step 2: Load any cached data
  const cachePath = "src/data/servants-cache.json";
  const cache = existsSync(cachePath)
    ? JSON.parse(readFileSync(cachePath, "utf8"))
    : {};
  console.error(`Cache has ${Object.keys(cache).length} servants`);

  // Step 3: Fetch missing servants in batches
  const missing = slugs.filter((s) => !cache[s]);
  console.error(`Need to fetch ${missing.length} servants`);

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    const batch = missing.slice(i, i + BATCH_SIZE);
    console.error(
      `  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(missing.length / BATCH_SIZE)}: ${batch.length} servants...`
    );

    const results = await Promise.allSettled(
      batch.map((slug) => fetchServant(slug))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      if (result.status === "fulfilled" && result.value) {
        cache[batch[j]] = result.value;
      } else {
        console.error(`    Failed: ${batch[j]} - ${result.status === "rejected" ? result.reason?.message : "empty"}`);
      }
    }

    // Save cache after each batch
    writeFileSync(cachePath, JSON.stringify(cache, null, 2));

    if (i + BATCH_SIZE < missing.length) {
      await sleep(DELAY_MS);
    }
  }

  // Step 4: Build final servant list
  const servants = Object.values(cache)
    .filter((s) => s && s.slug && s.name)
    .sort((a, b) => a.name.localeCompare(b.name));

  writeFileSync("src/data/servants.json", JSON.stringify(servants, null, 2));
  console.error(`\nWrote ${servants.length} servants to src/data/servants.json`);
}

async function getSlugsFromSitemap() {
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) throw new Error(`Sitemap HTTP ${res.status}`);
  const xml = await res.text();

  const slugs = [];
  const pattern = /<loc>https:\/\/grandorder\.gamepress\.gg\/c\/servants\/([^<]+)<\/loc>/g;
  let match;
  while ((match = pattern.exec(xml)) !== null) {
    slugs.push(match[1]);
  }
  return slugs;
}

async function fetchServant(slug) {
  const url = `https://grandorder.gamepress.gg/c/servants/${slug}`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) return null;

  const html = await res.text();
  const $ = cheerio.load(html);

  const name = $("h1").first().text().trim() ||
    $('meta[property="og:title"]').attr("content")?.split("|")[0]?.trim() || "";
  
  // Get icon from og:image or from the page's img
  let iconUrl =
    $('meta[property="og:image"]').attr("content") ||
    $('img[src*="Icon"]').attr("src") ||
    $('img[src*="icon"]').attr("src") ||
    "";

  // Clean up icon URL
  iconUrl = iconUrl.replace(/\[/g, "%5B").replace(/\]/g, "%5D");
  // Ensure it points to mana.wiki
  if (iconUrl && !iconUrl.startsWith("http")) {
    iconUrl = "https://static.mana.wiki/" + iconUrl.replace(/^\//, "");
  }

  // Try to get class and rarity from the page
  let className = "";
  let rarity = "";

  // Look for class info
  $("span, div").each((_, el) => {
    const text = $(el).text().trim();
    if (
      ["Saber", "Archer", "Lancer", "Rider", "Caster", "Assassin", "Berserker", "Ruler", "Moon Cancer", "Alter Ego", "Foreigner", "Shielder", "Pretender"].includes(text)
    ) {
      if (!className) className = text;
    }
  });

  // Look for rarity (star count)
  $("span").each((_, el) => {
    const text = $(el).text().trim();
    if (/^[1-9]$/.test(text)) {
      const parent = $(el).parent();
      if (parent.find("img[src*='star'], img[src*='Star'], img[alt*='star']").length > 0 || rarity === "") {
        rarity = text;
      }
    }
  });

  if (!name) return null;

  return {
    slug,
    name,
    iconUrl,
    rarity,
    className,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
