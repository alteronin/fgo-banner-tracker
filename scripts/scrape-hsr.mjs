import { writeFileSync } from "node:fs";
import * as cheerio from "cheerio";

const PAGE_URL = "https://game8.co/games/Honkai-Star-Rail/archives/474951";
const OUT = new URL("../src/data/hsr-banners.json", import.meta.url);

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

function cleanText(s) {
  return (s || "").replace(/\s+/g, " ").trim();
}

function cleanName(s) {
  return cleanText(s)
    .replace(/[=\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cheerioTextOf(node) {
  if (node.type === "text") return node.data || "";
  let out = "";
  for (const child of node.children || []) out += cheerioTextOf(child);
  return out;
}

function absUrl(href) {
  if (!href) return null;
  return href.startsWith("/") ? `https://game8.co${href}` : href;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function parseHsrDates(raw) {
  const monthAlt = "(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)";
  const re = new RegExp(
    monthAlt +
      "[a-z]*\\.?\\s+(\\d{1,2})(?:,\\s*(\\d{4}))?\\s*-\\s*" +
      "(?:" +
      monthAlt +
      "[a-z]*\\.?\\s+(\\d{1,2})(?:,\\s*(\\d{4}))?" +
      "|(TBA))",
    "i"
  );
  const m = cleanText(raw).match(re);
  if (!m) return { error: `unparseable dates: [${cleanText(raw).slice(0, 80)}]` };

  const sm = MONTHS[m[1].toLowerCase().slice(0, 3)];
  const sd = +m[2];
  const sy4 = m[3] ? +m[3] : null;

  let start, end = null;
  if (m[7]) {
    if (sy4 === null) return { error: "TBA end without start year" };
    start = `${sy4}-${pad(sm)}-${pad(sd)}`;
  } else {
    const em = MONTHS[m[4].toLowerCase().slice(0, 3)];
    const ed = +m[5];
    let ey4 = m[6] ? +m[6] : null;
    if (ey4 === null) {
      if (sy4 === null) return { error: "neither date has a year" };
      ey4 = sy4;
    }
    let sy = sy4;
    if (sy === null) sy = sm > em ? ey4 - 1 : ey4;
    if (ey4 - sy > 1) ey4 = sy;
    start = `${sy}-${pad(sm)}-${pad(sd)}`;
    end = `${ey4}-${pad(em)}-${pad(ed)}`;
  }

  if (end && start >= end) return { error: `start >= end: ${start} -> ${end}` };
  if (end) {
    const span = (Date.parse(end) - Date.parse(start)) / 86400000;
    if (span > 60) return { error: `span ${span}d > 60: ${start} -> ${end}` };
  }
  return { start, end };
}

function dateTextFromCell(text) {
  const t = cleanText(text);
  const from = t.indexOf("Banner Dates:");
  if (from === -1) return null;
  const rest = t.slice(from);
  const to = rest.search(/Featured/i);
  return to === -1 ? rest : rest.slice(0, to);
}

function bannersFromCell($, $cell) {
  const out = [];
  $cell.find("a[href]").each((_, a) => {
    const $a = $(a);
    const img = $a.find("img").first();
    if (!img.length) return;
    const image = img.attr("data-src") || img.attr("src");
    if (!image || image.startsWith("data:")) return;
    let name = cleanText($a.text());
    if (!name) {
      const alt = img.attr("alt") || "";
      name = cleanText(
        alt
          .replace(/^.*?Banner History\s*-\s*/i, "")
          .replace(/\s*Banner$/i, "")
      );
    }
    if (!name) return;
    out.push({
      name: cleanName(name).replace(/\s+Banner$/i, ""),
      url: absUrl($a.attr("href")),
      image,
    });
  });
  return out;
}

function stripFeaturedAlt(alt) {
  return cleanText((alt || "").replace(/^(HSR|Honkai Star Rail)\s*-\s*/i, ""));
}

function featuredBetween($, $cell, labelRe) {
  const nodes = $cell.find("b, a[href]").toArray();
  const startIdx = nodes.findIndex(
    (n) => n.name === "b" && labelRe.test(cleanText(cheerioTextOf(n)))
  );
  if (startIdx === -1) return [];
  const out = [];
  for (let i = startIdx + 1; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.name === "b") break;
    const $a = $(n);
    const img = $a.find("img").first();
    const name =
      cleanText($a.text()) ||
      stripFeaturedAlt(img.attr("alt"));
    if (!name) continue;
    const image = img.attr("data-src") || img.attr("src") || null;
    out.push({
      name: cleanName(name),
      url: absUrl($a.attr("href")),
      image: image && !image.startsWith("data:") ? image : null,
    });
  }
  return out.filter((x) => x.image);
}

function isHistoryTable($, $table) {
  const firstRow = $table.find("tr").first();
  return /banner history/i.test(cleanText(firstRow.text()));
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
  const stats = { character: 0, lightcone: 0 };
  const dateErrors = [];
  const skippedRows = [];
  let historyTables = 0;

  $("table").each((_, table) => {
    const $table = $(table);
    if (!isHistoryTable($, $table)) return;
    historyTables++;

    let currentVersion = null;
    let currentPhase = null;
    let dataIdx = 0;

    $table.find("tr").each((rowIdx, row) => {
      const $row = $(row);
      const cells = $row.children("th,td");

      if (cells.length === 1) {
        const text = cleanText(cells.text());
        if (!/banner history/i.test(text)) return;
        const m = text.match(/HSR\s+(\d+\.\d+)\s+Phase\s+(\d+)/i);
        currentVersion = m ? m[1] : null;
        currentPhase = m ? +m[2] : null;
        dataIdx = 0;
        return;
      }

      if (cells.length !== 2) {
        skippedRows.push(`table row ${rowIdx}: ${cells.length} cells`);
        return;
      }

      const $info = cells.last();
      const infoText = cleanText($info.text());
      if (!infoText.includes("Banner Dates")) return;

      dataIdx++;
      if (dataIdx > 4) {
        throw new Error(
          `section has >4 data rows (row ${rowIdx}) — type classification would be wrong`
        );
      }

      const type = dataIdx % 2 === 1 ? "character" : "lightcone";
      const banners = bannersFromCell($, cells.first());
      if (!banners.length) {
        skippedRows.push(`row ${rowIdx}: no banners extracted`);
        return;
      }

      const dateRaw = dateTextFromCell($info.text());
      if (!dateRaw) {
        skippedRows.push(`row ${rowIdx}: no date text`);
        return;
      }
      const { start, end, error } = parseHsrDates(dateRaw);
      if (error) dateErrors.push(`${type} ${currentVersion ?? "collab"}: ${error}`);

      entries.push({
        type,
        version: currentVersion,
        phase: currentPhase,
        banners,
        startDate: start ?? null,
        endDate: end ?? null,
        featured5: featuredBetween($, $info, /Featured\s*5/i),
        featured4: featuredBetween($, $info, /Featured\s*4/i),
      });
      stats[type]++;
    });
  });

  if (dateErrors.length) {
    console.error("DATE ERRORS:");
    dateErrors.forEach((e) => console.error("  " + e));
    throw new Error(`${dateErrors.length} unparseable dates`);
  }
  if (skippedRows.length) {
    console.error("SKIPPED ROWS:");
    skippedRows.forEach((e) => console.error("  " + e));
    throw new Error(`${skippedRows.length} skipped rows`);
  }

  const contentSeen = new Set();
  const deduped = [];
  let dupes = 0;
  for (const e of entries) {
    const key = [
      e.type,
      e.version,
      e.phase,
      e.startDate,
      e.endDate,
      e.banners.map((b) => b.name).join(" ~ "),
    ].join("|");
    if (contentSeen.has(key)) {
      dupes++;
      continue;
    }
    contentSeen.add(key);
    deduped.push(e);
  }

  const idSeen = new Set();
  const withIds = deduped.map((e) => {
    const slug = e.banners[0].name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let id = `${e.type}-${e.version ?? "collab"}-p${e.phase ?? "x"}-${slug}`;
    if (idSeen.has(id)) id = `${id}-2`;
    idSeen.add(id);
    return { id, ...e };
  });

  withIds.sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate < b.startDate ? 1 : -1;
    const order = { character: 0, lightcone: 1 };
    return order[a.type] - order[b.type];
  });

  const noImage = withIds.filter((e) => !e.banners[0].image);
  const noStart = withIds.filter((e) => !e.startDate);
  const badRange = withIds.filter((e) => e.endDate && e.startDate >= e.endDate);
  const longSpan = withIds.filter(
    (e) =>
      e.endDate &&
      (Date.parse(e.endDate) - Date.parse(e.startDate)) / 86400000 > 60
  );
  const badVersion = withIds.filter(
    (e) => e.version !== null && !/^\d+\.\d+$/.test(e.version)
  );
  const relativeUrls = withIds.flatMap((e) =>
    [...e.banners, ...e.featured5, ...e.featured4].filter(
      (x) => x.url && x.url.startsWith("/")
    )
  );
  if (
    noImage.length ||
    noStart.length ||
    badRange.length ||
    longSpan.length ||
    badVersion.length ||
    relativeUrls.length
  ) {
    noImage.forEach((e) => console.error(`no image: ${e.id}`));
    noStart.forEach((e) => console.error(`no start: ${e.id}`));
    badRange.forEach((e) => console.error(`bad range: ${e.id}`));
    longSpan.forEach((e) => console.error(`span>60d: ${e.id}`));
    badVersion.forEach((e) => console.error(`bad version: ${e.id}`));
    relativeUrls.forEach((e) => console.error(`relative url: ${e.name}`));
    throw new Error("validation failed");
  }

  writeFileSync(OUT, JSON.stringify(withIds, null, 2) + "\n", "utf8");
  const versions = [
    ...new Set(withIds.map((e) => e.version).filter((v) => v !== null)),
  ].sort((a, b) => parseFloat(b) - parseFloat(a));
  const emptyFeatured5 = withIds.filter((e) => e.featured5.length === 0);
  console.error(`Wrote ${withIds.length} entries to ${OUT.path ?? OUT}`);
  console.error(
    `  character: ${stats.character}, lightcone: ${stats.lightcone}, deduped: ${dupes}`
  );
  console.error(`  history tables: ${historyTables}, versions: ${versions.join(", ")}`);
  console.error(
    `  null version: ${withIds.filter((e) => e.version === null).length}, null end: ${withIds.filter((e) => e.endDate === null).length}`
  );
  console.error(`  empty featured5: ${emptyFeatured5.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
