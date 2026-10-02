import { writeFileSync } from "node:fs";
import * as cheerio from "cheerio";

const PAGE_URL = "https://game8.co/games/Zenless-Zone-Zero/archives/435687";
const OUT = new URL("../src/data/zzz-banners.json", import.meta.url);

const GENERIC_AGENT_BANNERS = new Set(["Exclusive Rescreening"]);

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

function parseCellDates(raw) {
  const t = cleanText(raw);
  const m = t.match(/(\d{1,2}\/\d{1,2}(?:\/\d{4})?)\s*-\s*(\d{1,2}\/\d{1,2}\/\d{4})/);
  if (!m) return { error: `unparseable dates: [${t.slice(0, 80)}]` };

  const startParts = m[1].split("/").map(Number);
  const endParts = m[2].split("/").map(Number);
  const sm = startParts[0];
  const sd = startParts[1];
  const sy4 = startParts.length === 3 ? startParts[2] : null;
  const em = endParts[0];
  const ed = endParts[1];
  const ey = endParts[2];

  let sy = sy4;
  if (sy === null) sy = sm > em ? ey - 1 : ey;
  if (ey - sy > 1) return { error: `implausible year span: ${m[1]} - ${m[2]}` };

  const start = `${sy}-${pad(sm)}-${pad(sd)}`;
  const end = `${ey}-${pad(em)}-${pad(ed)}`;
  if (start >= end) return { error: `start >= end: ${start} -> ${end}` };
  const span = (Date.parse(end) - Date.parse(start)) / 86400000;
  if (span > 60) return { error: `span ${span}d > 60: ${start} -> ${end}` };

  const phaseMatch = t.match(/\(Phase\s*(\d)\)/);
  return {
    start,
    end,
    phase: phaseMatch ? +phaseMatch[1] : null,
  };
}

function agentFeatured(name) {
  let n = cleanText(name)
    .replace(/\s*Rerun\s+Banner$/i, "")
    .replace(/\s+Banner$/i, "")
    .trim();
  if (!n || GENERIC_AGENT_BANNERS.has(n)) return [];
  return [{ name: n, url: null, image: null }];
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
  let $target = null;
  $("table").each((_, table) => {
    const head = cleanText($(table).find("tr").first().text());
    if (head.includes("All Agent and W-Engine Banners")) $target = $(table);
  });
  if (!$target) throw new Error("banner history table not found");

  const entries = [];
  const errors = [];
  let currentVersion = null;
  let rowIndex = 0;

  $target.find("tr").each((_, row) => {
    const $row = $(row);
    const $ths = $row.children("th");
    const $tds = $row.children("td");
    if ($ths.length && !$tds.length) return;

    if ($ths.length) {
      const v = cleanText($ths.first().text());
      if (!/^\d+\.\d+$/.test(v)) {
        errors.push(`row ${rowIndex}: bad version cell [${v}]`);
        return;
      }
      currentVersion = v;
    }
    rowIndex++;

    if ($tds.length !== 2) {
      errors.push(`row ${rowIndex}: expected 2 td cells, got ${$tds.length}`);
      return;
    }
    if (!currentVersion) {
      errors.push(`row ${rowIndex}: banner row before any version cell`);
      return;
    }

    $tds.each((cellIdx, td) => {
      const type = cellIdx === 0 ? "agent" : "wengine";
      const $td = $(td);
      const cellText = cleanText($td.text());
      const $a = $td.find("a[href]").first();
      const linkName = cleanText($a.text());
      if (!linkName) {
        errors.push(`row ${rowIndex} ${type}: missing banner link name`);
        return;
      }
      const dates = parseCellDates(cellText);
      if (dates.error) {
        errors.push(`row ${rowIndex} ${type} [${linkName}]: ${dates.error}`);
        return;
      }
      const img = $td.find("img").first();
      const image = img.attr("data-src") || img.attr("src") || null;

      entries.push({
        type,
        version: currentVersion,
        phase: dates.phase,
        banners: [
          {
            name: linkName,
            url: absUrl($a.attr("href")),
            image: image && !image.startsWith("data:") ? image : null,
          },
        ],
        startDate: dates.start,
        endDate: dates.end,
        featured5: type === "agent" ? agentFeatured(linkName) : [],
        featured4: [],
      });
    });
  });

  if (errors.length) {
    console.error("ERRORS:");
    errors.forEach((e) => console.error("  " + e));
    throw new Error(`${errors.length} cell errors`);
  }

  const idSeen = new Set();
  const withIds = entries.map((e) => {
    const slug = e.banners[0].name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let id = `${e.type}-${e.startDate}-${slug}`;
    if (idSeen.has(id)) id = `${id}-2`;
    idSeen.add(id);
    return { id, ...e };
  });

  withIds.sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate < b.startDate ? 1 : -1;
    if (a.endDate !== b.endDate) return a.endDate < b.endDate ? 1 : -1;
    return a.type === b.type ? 0 : a.type === "agent" ? -1 : 1;
  });

  const noImage = withIds.filter((e) => !e.banners[0].image);
  const noUrl = withIds.filter((e) => !e.banners[0].url);
  const badVersion = withIds.filter((e) => !/^\d+\.\d+$/.test(e.version));
  if (noImage.length || noUrl.length || badVersion.length) {
    noImage.forEach((e) => console.error(`no image: ${e.id}`));
    noUrl.forEach((e) => console.error(`no url: ${e.id}`));
    badVersion.forEach((e) => console.error(`bad version: ${e.id}`));
    throw new Error("validation failed");
  }

  writeFileSync(OUT, JSON.stringify(withIds, null, 2) + "\n", "utf8");
  const versions = [
    ...new Set(withIds.map((e) => e.version)),
  ].sort((a, b) => parseFloat(b) - parseFloat(a));
  const stats = {
    agent: withIds.filter((e) => e.type === "agent").length,
    wengine: withIds.filter((e) => e.type === "wengine").length,
    noPhase: withIds.filter((e) => e.phase === null).length,
    featured: withIds.filter((e) => e.featured5.length > 0).length,
  };
  console.error(`Wrote ${withIds.length} entries`);
  console.error(
    `  agent: ${stats.agent}, wengine: ${stats.wengine}, no phase: ${stats.noPhase}, with featured: ${stats.featured}`
  );
  console.error(`  versions: ${versions.join(", ")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
