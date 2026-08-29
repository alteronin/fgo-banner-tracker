// Script to extract banners and save to src/data/banners.json
// Run: node scripts/scrape-all.mjs

import * as cheerio from "cheerio";
import { writeFileSync } from "fs";

const URL = "https://grandorder.gamepress.gg/summon-banner-list";

async function main() {
  console.error("Fetching page...");
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  console.error(`Fetched ${(html.length / 1024 / 1024).toFixed(1)}MB`);

  const $ = cheerio.load(html);
  const banners = [];

  $("div.table-row").each((_, row) => {
    const $row = $(row);

    const $img = $row.find('img[src*="static.mana.wiki/grandorder/"]');
    if (!$img.length) return;

    const imageUrl = ($img.attr("src") || "").replace(/\[/g, "%5B").replace(/\]/g, "%5D");

    const bannerName = $row.find("span.font-semibold.text-xs").first().text().trim();

    // Extract dates
    const regions = [];
    $row.find("li > div.text-xs.flex").each((_, div) => {
      const $div = $(div);
      const regionEl = $div.find("div.font-bold").first();
      const regionName = regionEl.text().replace(":", "").trim();
      const dateDivs = $div.find("div:not(.font-bold)");
      if (dateDivs.length >= 2 && regionName) {
        regions.push({
          region: regionName,
          startDate: $(dateDivs[0]).text().trim(),
          endDate: $(dateDivs[1]).text().trim(),
        });
      }
    });

    // Use Japan dates if available, otherwise first region
    const jpRegion = regions.find((r) => r.region === "Japan");
    const useRegion = jpRegion || regions[0];
    const startDate = useRegion?.startDate || "";
    const endDate = useRegion?.endDate || "";

    // Extract servants
    const servants = [];
    $row.find("span.inline-flex").each((_, badge) => {
      const badgeText = $(badge).text().trim();
      if (badgeText === "Single" || badgeText === "Shared") {
        const $ul = $(badge).next("ul");
        if ($ul.length) {
          $ul.find('a[href*="/c/servants/"]').each((_, a) => {
            const name = $(a).text().trim();
            const slug = $(a).attr("href")?.replace("/c/servants/", "") || "";
            if (name) {
              servants.push({
                name,
                slug,
                rateUpType: badgeText.toLowerCase(),
              });
            }
          });
        }
      }
    });

    if (bannerName && startDate) {
      banners.push({
        id: slugify(bannerName),
        name: bannerName,
        imageUrl,
        startDate,
        endDate,
        servants,
      });
    }
  });

  console.error(`Extracted ${banners.length} banners`);

  // Sort by date descending
  banners.sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Write to file
  writeFileSync("src/data/banners.json", JSON.stringify(banners, null, 2));
  console.error(`Written to src/data/banners.json`);

  // Year breakdown
  const yearCounts = {};
  for (const b of banners) {
    const year = b.startDate.slice(0, 4) || "unknown";
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }
  console.error("Year breakdown:");
  Object.entries(yearCounts)
    .sort()
    .forEach(([y, c]) => console.error(`  ${y}: ${c}`));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
