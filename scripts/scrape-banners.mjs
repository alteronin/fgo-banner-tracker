// Script to scrape banner data from GamePress
// Run: node scripts/scrape-banners.mjs

const URL = "https://grandorder.gamepress.gg/summon-banner-list";

async function scrape() {
  console.log("Fetching page...");
  const res = await fetch(URL);
  const html = await res.text();

  console.log("Parsing HTML...");
  // Extract window.__remixContext JSON
  const match = html.match(/window\.__remixContext\s*=\s*(\{.*?\});\s*<\/script/s);
  if (!match) {
    // Try alternative pattern
    const match2 = html.match(/window\.__remixContext\s*=\s*(\{.*?\});/s);
    if (!match2) {
      console.error("Could not find __remixContext in page");
      process.exit(1);
    }
    var contextJson = match2[1];
  } else {
    var contextJson = match[1];
  }

  let context;
  try {
    context = JSON.parse(contextJson);
  } catch (e) {
    console.error("Failed to parse JSON:", e.message);
    // Try to find the summonEventList directly
    const listMatch = html.match(/"summonEventList"\s*:\s*(\[.*?\])\s*[,}]/s);
    if (listMatch) {
      context = { summonEventList: JSON.parse(listMatch[1]) };
    } else {
      process.exit(1);
    }
  }

  // Navigate to the banner list
  const loaderData = context?.state?.loaderData;
  let banners;

  if (loaderData) {
    // Find the summon-banner-list key
    for (const [key, value] of Object.entries(loaderData)) {
      if (key.includes("summon-banner-list") && value?.summonEventList) {
        banners = value.summonEventList;
        break;
      }
    }
  }

  if (!banners) {
    console.error("Could not find summonEventList in context");
    process.exit(1);
  }

  console.log(`Found ${banners.length} banners`);

  // Transform to our format
  const transformed = banners.map((banner) => {
    const servants = (banner.servant_profile_future_banner || []).map((s) => ({
      name: s.banner_servant?.name || "Unknown",
      slug: s.banner_servant?.slug || "unknown",
      rateUpType: s.banner_reference === "single" ? "single" : "shared",
    }));

    return {
      id: banner.id || slugify(banner.name),
      name: banner.name,
      imageUrl: banner.icon?.url || "",
      startDate: banner.jp_start_date || "",
      endDate: banner.jp_end_date || "",
      servants,
    };
  });

  // Sort by date descending
  transformed.sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Write to file
  const fs = await import("fs");
  const path = new URL("../src/data/banners.json", import.meta.url);
  fs.writeFileSync(path, JSON.stringify(transformed, null, 2));
  console.log(`Written ${transformed.length} banners to src/data/banners.json`);

  // Show year breakdown
  const counts = {};
  transformed.forEach((b) => {
    const y = b.startDate.slice(0, 4);
    counts[y] = (counts[y] || 0) + 1;
  });
  console.log("\nYear breakdown:");
  Object.entries(counts)
    .sort()
    .forEach(([y, c]) => console.log(`  ${y}: ${c}`));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

scrape().catch(console.error);
