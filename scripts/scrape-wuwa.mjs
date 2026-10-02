import { writeFileSync } from "node:fs";
import * as cheerio from "cheerio";

const PAGE_URL = "https://game8.co/games/Wuthering-Waves/archives/494979";
const OUT = new URL("../src/data/wuwa-banners.json", import.meta.url);

const MONTHS = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function cleanText(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function absUrl(href) {
  if (!href) return null;
  return href.startsWith("/") ? `https://game8.co${href}` : href;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function parseMonthDate(raw) {
  const m = cleanText(raw).match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (!m) return null;
  const mo = MONTHS[m[1].toLowerCase()];
  if (!mo) return null;
  return `${m[3]}-${pad(mo)}-${pad(+m[2])}`;
}

function linkEntries($, $cell, zone, fullText) {
  const out = [];
  const cursor = { pos: 0 };
  $cell.find("a[href]").each((_, a) => {
    const $a = $(a);
    const name = cleanText($a.text());
    if (!name) return;
    const pos = fullText.indexOf(name, cursor.pos);
    if (pos !== -1) cursor.pos = pos + name.length;
    const inZone = zone(fullText, pos);
    if (!inZone) return;
    const img = $a.find("img").first();
    const image = img.attr("data-src") || img.attr("src") || null;
    out.push({
      name,
      url: absUrl($a.attr("href")),
      image: image && !image.startsWith("data:") ? image : null,
    });
  });
  return out;
}

async function main() {
  console.error("Fetching page...");
  const res = await fetch(PAGE_URL, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; banner-tracker scraper)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  console.error(`Fetched ${(html.length / 1024 / 1024).toFixed(1)}MB`);

  const $ = cheerio.load(html);
  const entries = [];
  const errors = [];
  let currentVersion = null;
  let selectorMode = false;
  let bannerTables = 0;

  $("h3, h4, table").each((_, node) => {
    if (node.name === "h3" || node.name === "h4") {
      const t = cleanText($(node).text());
      const m = t.match(/^Banners for (\d+\.\d+)$/);
      if (m) {
        currentVersion = m[1];
        selectorMode = false;
        return;
      }
      if (/^Special Reverbs Selector Banners$/i.test(t)) {
        selectorMode = true;
        return;
      }
      return;
    }

    const $table = $(node);
    const head = cleanText($table.find("tr").first().text());
    if (!/^Banners\s+Banner Details$/i.test(head)) return;
    if (!currentVersion) {
      errors.push("banner table with no version heading");
      return;
    }
    bannerTables++;

    $table.find("tr").each((rowIdx, row) => {
      if (rowIdx === 0) return;
      const $cells = $(row).children("th,td");
      if ($cells.length !== 2) {
        errors.push(`table row ${rowIdx}: ${$cells.length} cells`);
        return;
      }
      const $banners = $cells.eq(0);
      const $details = $cells.eq(1);
      const detailsText = cleanText($details.text());

      const banners = [];
      $banners.find("a[href]").each((_, a) => {
        const $a = $(a);
        const name = cleanText($a.text());
        if (!name) return;
        const img = $a.find("img").first();
        const image = img.attr("data-src") || img.attr("src") || null;
        banners.push({
          name,
          url: absUrl($a.attr("href")),
          image: image && !image.startsWith("data:") ? image : null,
        });
      });
      if (!banners.length) {
        errors.push(`table row ${rowIdx}: no banner links`);
        return;
      }

      let start = null;
      let end = null;
      let phase = null;
      const dateMatch = detailsText.match(
        /Phase\s+(\d+)\s+Start:\s+([A-Za-z]+\s+\d{1,2},\s*\d{4})\s+End:\s+([A-Za-z]+\s+\d{1,2},\s*\d{4})/
      );
      if (dateMatch) {
        phase = +dateMatch[1];
        start = parseMonthDate(dateMatch[2]);
        end = parseMonthDate(dateMatch[3]);
        if (!start || !end) {
          errors.push(`table row ${rowIdx}: bad date text`);
          return;
        }
        if (start >= end) {
          errors.push(`table row ${rowIdx}: start >= end ${start} ${end}`);
          return;
        }
        const span = (Date.parse(end) - Date.parse(start)) / 86400000;
        if (span > 60) {
          errors.push(`table row ${rowIdx}: span ${span}d > 60`);
          return;
        }
      } else if (!selectorMode && /Phase\s+\d/.test(detailsText)) {
        errors.push(`table row ${rowIdx}: phase text without parseable dates`);
        return;
      }

      const i5 = detailsText.indexOf("Limited 5★");
      const i4 = detailsText.indexOf("Rate-up 4★");
      const iw = detailsText.indexOf("Featured Weapon(s):");
      if (i5 === -1) {
        errors.push(`table row ${rowIdx}: missing "Limited 5★" marker`);
        return;
      }
      const z5End = i4 !== -1 ? i4 : iw !== -1 ? iw : detailsText.length;
      const featured5 = linkEntries(
        $, $details,
        (_t, pos) => pos > i5 && pos < z5End,
        detailsText
      );
      const featured4 = i4 === -1 ? [] : linkEntries(
        $, $details,
        (_t, pos) => pos > i4 && (iw === -1 || pos < iw),
        detailsText
      );
      const weapons = iw === -1 ? [] : linkEntries(
        $, $details,
        (_t, pos) => pos > iw,
        detailsText
      );

      entries.push({
        type: selectorMode ? "selector" : "resonator",
        version: currentVersion,
        phase,
        banners,
        startDate: start,
        endDate: end,
        featured5: featured5.map((f) => ({
          name: f.name.replace(/\s*\(Debut\)$/, ""),
          url: f.url,
          image: f.image,
        })),
        featured4,
        featuredWeapons: weapons,
      });
    });
  });

  if (errors.length) {
    console.error("ERRORS:");
    errors.forEach((e) => console.error("  " + e));
    throw new Error(`${errors.length} errors`);
  }

  const idSeen = new Set();
  const withIds = entries.map((e) => {
    const slug = e.banners[0].name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let id = `wuwa-${e.version}-${e.type}-${slug}`;
    if (idSeen.has(id)) id = `${id}-2`;
    idSeen.add(id);
    return { id, ...e };
  });

  withIds.sort((a, b) => {
    const sa = a.startDate ?? "0000-00-00";
    const sb = b.startDate ?? "0000-00-00";
    if (sa !== sb) return sa < sb ? 1 : -1;
    return (a.phase ?? 0) - (b.phase ?? 0);
  });

  const noImage = withIds.filter((e) => !e.banners[0].image);
  const noUrl = withIds.filter((e) => !e.banners[0].url);
  const noFeatured = withIds.filter((e) => e.featured5.length === 0);
  const noStart = withIds.filter((e) => e.startDate === null);
  if (noImage.length || noUrl.length) {
    noImage.forEach((e) => console.error(`no image: ${e.id}`));
    noUrl.forEach((e) => console.error(`no url: ${e.id}`));
    throw new Error("validation failed");
  }

  writeFileSync(OUT, JSON.stringify(withIds, null, 2) + "\n", "utf8");
  const versions = [...new Set(withIds.map((e) => e.version))].sort(
    (a, b) => parseFloat(b) - parseFloat(a)
  );
  const types = {};
  for (const e of withIds) types[e.type] = (types[e.type] ?? 0) + 1;
  console.error(`Wrote ${withIds.length} entries (tables: ${bannerTables})`);
  console.error(`  types: ${JSON.stringify(types)}`);
  console.error(`  versions: ${versions.join(", ")}`);
  console.error(`  no start (selector/TBA): ${noStart.length}, empty featured5: ${noFeatured.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
