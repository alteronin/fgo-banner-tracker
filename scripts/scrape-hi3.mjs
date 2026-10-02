import { writeFileSync } from "node:fs";

const API = "https://honkaiimpact3.fandom.com/api.php";
const OUT = new URL("../src/data/hi3-banners.json", import.meta.url);
const UA = "banner-tracker scraper (contact: site admin)";

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, april: 4, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function api(params, attempts = 4) {
  const url = `${API}?${new URLSearchParams({
    format: "json",
    formatversion: "2",
    ...params,
  })}`;
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (res.ok) return res.json();
    if (res.status === 429 || res.status >= 500) {
      await sleep(1000 * (i + 1));
      continue;
    }
    throw new Error(`HTTP ${res.status}`);
  }
  throw new Error("fetch failed after retries");
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function parseTemplateParams(wikitext, templateName) {
  const start = wikitext.indexOf(`{{${templateName}`);
  if (start === -1) return null;
  const params = {};
  const body = wikitext.slice(start);
  let currentKey = null;
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim();
    if (line === "}}") break;
    if (line.startsWith("|")) {
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      currentKey = line.slice(1, eq).trim();
      params[currentKey] = line.slice(eq + 1).trim();
    } else if (currentKey && line) {
      params[currentKey] += "\n" + line;
    }
  }
  return params;
}

function stripWikiNoise(s) {
  return (s || "")
    .replace(/<ref[^>]*\/>/gi, "")
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, "");
}

function parseDebut(value) {
  const v = stripWikiNoise(value).split(/{{|<ref/i)[0];
  const m = v.match(/\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/);
  if (!m) return null;
  const mo = MONTHS[m[1].toLowerCase()];
  if (!mo) return null;
  const dd = String(+m[2]).padStart(2, "0");
  return `${m[3]}-${String(mo).padStart(2, "0")}-${dd}`;
}

function summaryFeatured(summary) {
  const s = stripWikiNoise(summary || "");
  const out = [];
  for (const line of s.split("\n")) {
    if (!/debut/i.test(line)) continue;
    const re = /\{\{currency\|([^|}]+)(?:\|[^}]*)?\}\}/gi;
    let m;
    while ((m = re.exec(line)) !== null) {
      const name = m[1].replace(/\s+/g, " ").trim();
      if (name) out.push(name);
    }
  }
  return out;
}

function nextVersionOf(params) {
  const raw = stripWikiNoise(params?.next || "");
  const m = raw.match(/Version\s+([\d.]+)/i) || raw.match(/^\s*([\d.]+)\s*$/);
  return m ? m[1] : null;
}

async function main() {
  const titleList = [];
  let cont = null;
  do {
    const params = {
      action: "query",
      list: "categorymembers",
      cmtitle: "Category:Versions",
      cmlimit: "500",
      cmtype: "page",
    };
    if (cont) params.cmcontinue = cont;
    const data = await api(params);
    for (const m of data.query?.categorymembers ?? []) {
      if (/^Version \d+(\.\d+)+$/.test(m.title)) titleList.push(m.title);
    }
    cont = data.continue?.cmcontinue;
    await sleep(80);
  } while (cont);
  console.error(`Found ${titleList.length} version pages`);
  if (titleList.length < 70) throw new Error("suspiciously few version pages");

  const pages = new Map();
  for (const chunkTitles of chunk(titleList, 40)) {
    const data = await api({
      action: "query",
      prop: "revisions",
      rvslots: "main",
      rvprop: "content",
      titles: chunkTitles.join("|"),
    });
    for (const p of data.query?.pages ?? []) {
      if (p.missing) continue;
      pages.set(p.title, p.revisions?.[0]?.slots?.main?.content ?? "");
    }
    await sleep(120);
  }
  console.error(`Fetched wikitext for ${pages.size} pages`);

  const parsed = new Map();
  const errors = [];
  for (const [title, wikitext] of pages) {
    let params = parseTemplateParams(wikitext, "Version Entry");
    let imageFile = `${title} (Banner).png`;
    if (!params) {
      params = parseTemplateParams(wikitext, "Version Infobox");
      if (params?.image?.trim()) imageFile = params.image.trim();
    }
    if (!params) {
      errors.push(`${title}: no Version Entry/Infobox template`);
      continue;
    }
    const versionM = title.match(/^Version (\d+(?:\.\d+)+)$/);
    if (!versionM) {
      errors.push(`${title}: unexpected title`);
      continue;
    }
    const start =
      (params.debut_NA ? parseDebut(params.debut_NA) : null) ??
      (params.debut_EU ? parseDebut(params.debut_EU) : null) ??
      (params.debut_SEA ? parseDebut(params.debut_SEA) : null) ??
      (params.release ? parseDebut(params.release) : null);
    if (!start) {
      errors.push(`${title}: no parseable debut date`);
      continue;
    }
    parsed.set(title, {
      version: versionM[1],
      start,
      next: nextVersionOf(params),
      featured: summaryFeatured(params.summary),
      imageFile,
    });
  }
  if (errors.length) {
    console.error("PARSE ERRORS:");
    errors.forEach((e) => console.error("  " + e));
    throw new Error(`${errors.length} parse errors`);
  }
  console.error(`Parsed ${parsed.size} versions with debut dates`);

  const bannerTitles = [...new Set([...parsed.values()].map((i) => `File:${i.imageFile}`))];
  const imageUrls = new Map();
  for (const chunkTitles of chunk(bannerTitles, 40)) {
    const data = await api({
      action: "query",
      prop: "imageinfo",
      iiprop: "url",
      titles: chunkTitles.join("|"),
    });
    for (const p of data.query?.pages ?? []) {
      if (p.missing) continue;
      const url = p.imageinfo?.[0]?.url;
      if (url) imageUrls.set(p.title, url);
    }
    await sleep(120);
  }
  console.error(`Resolved ${imageUrls.size} banner images`);

  const byStartAsc = [...parsed.entries()].sort(([, a], [, b]) => {
    if (a.start !== b.start) return a.start < b.start ? -1 : 1;
    return parseFloat(a.version) - parseFloat(b.version);
  });

  const entries = [];
  for (const [title, info] of parsed) {
    const nextTitle = info.next ? `Version ${info.next}` : null;
    const nextInfo = nextTitle ? parsed.get(nextTitle) : null;
    let end = nextInfo ? nextInfo.start : null;
    if (!end) {
      const idx = byStartAsc.findIndex(([t]) => t === title);
      for (let i = idx + 1; i < byStartAsc.length; i++) {
        const cand = byStartAsc[i][1].start;
        if (cand > info.start) {
          end = cand;
          break;
        }
      }
    }
    if (end && end < info.start) {
      errors.push(`${title}: end ${end} < start ${info.start}`);
      continue;
    }
    const imageUrl = imageUrls.get(`File:${info.imageFile}`) ?? null;
    entries.push({
      id: `version-${info.version}`,
      type: "battlesuit",
      version: info.version,
      phase: null,
      banners: [
        {
          name: info.featured[0] || `Version ${info.version}`,
          url: `https://honkaiimpact3.fandom.com/wiki/${encodeURIComponent(
            title.replace(/ /g, "_")
          )}`,
          image: imageUrl,
        },
      ],
      startDate: info.start,
      endDate: end,
      featured5: info.featured.map((name) => ({ name, url: null, image: null })),
      featured4: [],
    });
  }
  if (errors.length) {
    console.error("BUILD ERRORS:");
    errors.forEach((e) => console.error("  " + e));
    throw new Error(`${errors.length} build errors`);
  }

  entries.sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate < b.startDate ? 1 : -1;
    return parseFloat(b.version) - parseFloat(a.version);
  });

  const idSeen = new Set();
  for (const e of entries) {
    if (idSeen.has(e.id)) throw new Error(`duplicate id ${e.id}`);
    idSeen.add(e.id);
  }

  const noStart = entries.filter((e) => !e.startDate);
  const noImage = entries.filter((e) => !e.banners[0].image);
  const noFeatured = entries.filter((e) => e.featured5.length === 0);
  const noEnd = entries.filter((e) => e.endDate === null);
  if (noStart.length) {
    noStart.forEach((e) => console.error(`no start: ${e.id}`));
    throw new Error("validation failed");
  }

  writeFileSync(OUT, JSON.stringify(entries, null, 2) + "\n", "utf8");
  console.error(`Wrote ${entries.length} entries`);
  console.error(
    `  newest ${entries[0].id} ${entries[0].startDate} -> oldest ${entries[entries.length - 1].id} ${entries[entries.length - 1].startDate}`
  );
  console.error(
    `  no image: ${noImage.length}, no featured5: ${noFeatured.length}, no end (latest): ${noEnd.length}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
