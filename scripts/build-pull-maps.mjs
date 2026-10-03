import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "src", "data");
const UA = "fgo-banner-tracker build script";

const RAW = {
  hsrCharacters: "https://stardb.gg/api/characters",
  hsrLightCones: "https://stardb.gg/api/light-cones",
  giDbCharactersDir: "https://api.github.com/repos/theBowja/genshin-db/contents/src/data/English/characters",
  giDbWeaponsDir: "https://api.github.com/repos/theBowja/genshin-db/contents/src/data/English/weapons",
  zzzAgents: "https://unpkg.com/zzz-data@0.0.1/data/agents.json",
  zzzWEngines: "https://unpkg.com/zzz-data@0.0.1/data/w-engines.json",
  zzzBangboos: "https://unpkg.com/zzz-data@0.0.1/data/bangboos.json",
  zzzCharacterIds: "https://raw.githubusercontent.com/donutman07/Zenless-Zone-Zero-ZZZ-Character-IDs/main/ZZZCharacterIDs.md",
};

const WIKI = "https://zenless-zone-zero.fandom.com/api.php";

function readJson(file) {
  return fs.readFile(path.join(DATA, file), "utf8").then(JSON.parse);
}

async function fetchText(url, headers = {}) {
  const res = await fetch(url, { headers: { "user-agent": UA, ...headers } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function fetchJson(url, headers = {}) {
  return JSON.parse(await fetchText(url, headers));
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}]+/gu, "");

function buildRosterIndex(roster) {
  const byExact = new Map();
  const byNorm = new Map();
  for (const unit of roster) {
    if (!byExact.has(unit.name)) byExact.set(unit.name, unit);
    const n = norm(unit.name);
    if (!byNorm.has(n)) byNorm.set(n, []);
    byNorm.get(n).push(unit);
  }
  return { byExact, byNorm };
}

function resolveUnit(name, index, accept) {
  if (!name) return null;

  const exact = index.byExact.get(name);
  if (exact && accept(exact)) return exact;

  const folded = index.byNorm.get(norm(name));
  if (folded) {
    const hits = folded.filter(accept);
    if (hits.length === 1) return hits[0];
  }

  const seg = String(name)
    .split(/\s*[•·]\s*/)
    .pop();
  const segFolded = index.byNorm.get(norm(seg));
  if (segFolded) {
    const hits = segFolded.filter(accept);
    if (hits.length === 1) return hits[0];
  }

  const needle = norm(name);
  const hits = [];
  for (const [key, units] of index.byNorm) {
    if (key.length < 3 || key === needle) continue;
    for (const unit of units) {
      if (!accept(unit)) continue;
      if (needle.includes(key) || key.includes(needle)) hits.push(unit);
    }
  }
  if (!hits.length) return null;
  const longest = Math.max(...hits.map((u) => norm(u.name).length));
  const best = hits.filter((u) => norm(u.name).length === longest);
  return best.length === 1 ? best[0] : null;
}

function toStars(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const map = { S: 5, A: 4, B: 3, 5: 5, 4: 4, 3: 3, SuperRare: 5, VeryRare: 4, Rare: 3 };
  return map[value] ?? (/^[0-9]$/.test(value) ? Number(value) : null);
}

async function buildHsr() {
  const [chars, cones] = await Promise.all([
    fetchJson(RAW.hsrCharacters),
    fetchJson(RAW.hsrLightCones),
  ]);
  const items = [];
  for (const c of chars) items.push({ id: String(c.id), name: c.name, rarity: toStars(c.rarity), kind: "character" });
  for (const c of cones) items.push({ id: String(c.id), name: c.name, rarity: toStars(c.rarity), kind: "light_cone" });
  return { game: "hsr", key: "id", source: RAW.hsrCharacters, items };
}

async function buildGenshin() {
  const [charDir, weaponDir] = await Promise.all([
    fetchJson(RAW.giDbCharactersDir),
    fetchJson(RAW.giDbWeaponsDir),
  ]);
  const files = [
    ...charDir.filter((f) => f.name.endsWith(".json")).map((f) => ({ ...f, kind: "character" })),
    ...weaponDir.filter((f) => f.name.endsWith(".json")).map((f) => ({ ...f, kind: "weapon" })),
  ];
  const rows = await mapLimit(files, 12, async (f) => {
    const data = await fetchJson(f.download_url);
    return { id: String(data.id), name: data.name, rarity: toStars(data.rarity), kind: f.kind };
  });
  return { game: "genshin", key: "id", source: RAW.giDbCharactersDir, items: rows.filter((r) => r.id) };
}

async function wikiCategory(category) {
  const titles = [];
  let cont = undefined;
  do {
    const params = new URLSearchParams({
      action: "query",
      list: "categorymembers",
      cmtitle: category,
      cmlimit: "500",
      format: "json",
    });
    if (cont) params.set("cmcontinue", cont);
    const data = await fetchJson(`${WIKI}?${params}`);
    titles.push(...(data.query?.categorymembers ?? []).map((m) => m.title));
    cont = data.continue?.cmcontinue;
  } while (cont);
  return titles;
}

async function wikiContent(titles) {
  const out = [];
  for (let i = 0; i < titles.length; i += 8) {
    const batch = titles.slice(i, i + 8);
    const params = new URLSearchParams({
      action: "query",
      prop: "revisions|categories",
      rvprop: "content",
      rvslots: "main",
      cllimit: "max",
      titles: batch.join("|"),
      format: "json",
      redirects: "1",
    });
    let data = await fetchJson(`${WIKI}?${params}`);
    const collected = [];
    for (const page of Object.values(data.query?.pages ?? {})) collected.push(page);
    let guard = 0;
    while (data.continue && guard++ < 20) {
      const extra = new URLSearchParams(data.continue);
      const next = new URLSearchParams(params);
      for (const [k, v] of extra) next.set(k, v);
      data = await fetchJson(`${WIKI}?${next}`);
      const pages = Object.values(data.query?.pages ?? {});
      if (pages.length === 1 && data.continue?.clcontinue) {
        const target = collected.find((p) => p.pageid === pages[0].pageid);
        if (target) {
          target.categories = [...(target.categories ?? []), ...(pages[0].categories ?? [])];
          continue;
        }
      }
      for (const page of pages) collected.push(page);
    }
    for (const page of collected) {
      out.push({
        title: page.title,
        content: page.revisions?.[0]?.slots?.main?.["*"] ?? "",
        categories: (page.categories ?? []).map((c) => c.title),
      });
    }
  }
  return out;
}

function categoryStars(categories) {
  for (const c of categories) {
    const m = c.match(/(S|A|B)-Rank/);
    if (m) return m[1] === "S" ? 5 : m[1] === "A" ? 4 : 3;
  }
  return null;
}

function infoboxId(content, template) {
  if (!content.includes(`{{${template}`)) return null;
  const m = content.match(/\|\s*id\s*=\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

async function buildZzz() {
  const [agents, wEngines, bangboos, idsMd] = await Promise.all([
    fetchJson(RAW.zzzAgents),
    fetchJson(RAW.zzzWEngines),
    fetchJson(RAW.zzzBangboos),
    fetchText(RAW.zzzCharacterIds),
  ]);

  const items = new Map();
  for (const a of agents.agents) {
    items.set(String(a.id), { id: String(a.id), name: a.enName, rarity: toStars(a.rarity), kind: "character" });
  }

  const mdIds = new Map();
  for (const line of idsMd.split(/\r?\n/)) {
    const m = line.match(/^\|\s*(\d{3,5})\s*\|\s*([^|]+?)\s*\|/);
    if (m) mdIds.set(m[1], m[2]);
  }

  const engineTitles = await wikiCategory("Category:W-Engines");
  const bangbooTitles = await wikiCategory("Category:Bangboo");
  const [enginePages, bangbooPages] = await Promise.all([
    wikiContent(engineTitles),
    wikiContent(bangbooTitles),
  ]);

  for (const page of enginePages) {
    const id = infoboxId(page.content, "W-Engine Infobox");
    if (id)
      items.set(String(id), { id: String(id), name: page.title, rarity: categoryStars(page.categories), kind: "w_engine" });
  }
  for (const page of bangbooPages) {
    const id = infoboxId(page.content, "Bangboo Infobox");
    if (id)
      items.set(String(id), { id: String(id), name: page.title, rarity: categoryStars(page.categories), kind: "bangboo" });
  }

  const rarities = [
    ...wEngines.wEngines.map((w) => [String(w.id), w.rarity]),
    ...bangboos.bangboos.map((b) => [String(b.id), b.rarity]),
  ];
  for (const [id, rarity] of rarities) {
    const existing = items.get(id);
    if (existing) existing.rarity = toStars(rarity);
    else items.set(id, { id, name: null, rarity: toStars(rarity), kind: id.startsWith("54") ? "bangboo" : "w_engine" });
  }

  for (const [id, name] of mdIds) {
    if (!items.has(String(id))) items.set(String(id), { id: String(id), name, rarity: null, kind: "character" });
  }

  return { game: "zzz", key: "id", source: RAW.zzzAgents, items: [...items.values()] };
}

async function buildWuwa() {
  const roster = await readJson("wuwa-units.json");
  const items = roster.map((u) => ({
    id: norm(u.name),
    name: u.name,
    rarity: toStars(u.rarity),
    kind: u.type === "weapon" ? "weapon" : "resonator",
  }));
  return { game: "wuwa", key: "name-norm", source: "src/data/wuwa-units.json", items };
}

const RESOLVABLE_KINDS = {
  hsr: { character: ["character"], light_cone: ["light-cone"] },
  genshin: { character: null },
  zzz: { character: null },
  wuwa: { resonator: ["resonator"], weapon: ["weapon"] },
};

function attachUnits(map, roster, game) {
  const index = buildRosterIndex(roster);
  const allowed = RESOLVABLE_KINDS[game] ?? {};
  const unresolved = [];
  for (const item of map.items) {
    const rule = Object.prototype.hasOwnProperty.call(allowed, item.kind) ? allowed[item.kind] : false;
    let unit = null;
    if (rule !== false && item.name) {
      const accept = rule === null ? () => true : (u) => rule.includes(u.type ?? "");
      unit = resolveUnit(item.name, index, accept);
    }
    item.unit = unit ? unit.id : null;
    if (item.kind === "character" || item.kind === "resonator" || item.kind === "light_cone") {
      if (unit) item.rarity = toStars(unit.rarity);
      else if (!item.rarity) unresolved.push(item.name ?? item.id);
    }
    if (!item.name) unresolved.push(item.id);
    item.name = item.name ?? null;
    item.rarity = item.rarity ?? null;
  }
  return unresolved;
}

async function main() {
  const builders = [
    [buildHsr, "hsr"],
    [buildGenshin, "genshin"],
    [buildZzz, "zzz"],
    [buildWuwa, "wuwa"],
  ];

  const rosters = {};
  for (const game of ["hsr", "genshin", "zzz", "wuwa"]) rosters[game] = await readJson(`${game}-units.json`);

  for (const [build, game] of builders) {
    const map = await build();
    const unresolved = attachUnits(map, rosters[game], game);
    const entries = {};
    for (const item of map.items) {
      const key = map.key === "name-norm" ? norm(item.name) : item.id;
      if (!key) continue;
      entries[key] = { name: item.name, rarity: item.rarity, kind: item.kind, unit: item.unit };
    }
    const out = {
      game: map.game,
      key: map.key,
      source: map.source,
      generated: new Date().toISOString().slice(0, 10),
      items: entries,
    };
    await fs.writeFile(path.join(DATA, `${game}-pull-map.json`), JSON.stringify(out) + "\n", "utf8");
    const list = Object.values(out.items);
    const unitless = list.filter((i) => !i.unit && (i.kind === "character" || i.kind === "resonator" || i.kind === "light_cone"));
    const nameless = list.filter((i) => !i.name);
    const rarityless = list.filter((i) => i.rarity === null);
    console.log(`\n${game}  items=${list.length}  withUnit=${list.filter((i) => i.unit).length}`);
    console.log(`  unitless (${unitless.length}): ${unitless.map((i) => i.name).slice(0, 12).join(", ") || "-"}`);
    console.log(`  nameless (${nameless.length}): ${nameless.map((i) => i.kind).slice(0, 12).join(", ") || "-"}`);
    console.log(`  rarityless (${rarityless.length}): ${rarityless.map((i) => i.name ?? i.kind).slice(0, 12).join(", ") || "-"}`);
    if (unresolved.length) console.log(`  flags: ${unresolved.slice(0, 12).join(", ")}`);
  }
}

await main();
