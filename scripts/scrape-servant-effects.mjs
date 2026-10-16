// Servant buff/effect scraper — Atlas Academy API (JP structure + NA English names)
// Joins to our GamePress roster via the dex number embedded in mana.wiki icon URLs.
// Run: node scripts/scrape-servant-effects.mjs

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";

const JP_EXPORT = "https://api.atlasacademy.io/export/JP/nice_servant.json";
const NA_EXPORT = "https://api.atlasacademy.io/export/NA/nice_servant.json";
const CACHE_DIR = ".atlas-cache";
const OUT_PATH = "src/data/servant-effects.json";

const BUFF_CATEGORIES = [
  "busterUp",
  "artsUp",
  "quickUp",
  "cardAllUp",
  "npDamageUp",
  "npGaugeUp",
  "npPerTurn",
  "npGainUp",
  "atkUp",
  "critUp",
  "starGenUp",
  "starAbsorbUp",
  "specialAtkUp",
  "defUp",
  "heal",
];
const CAT_RANK = new Map(BUFF_CATEGORIES.map((c, i) => [c, i]));

function targetBucket(funcTargetType) {
  switch (funcTargetType) {
    case "self":
      return "self";
    case "ptOne":
    case "ptOneOther":
    case "ptRandom":
    case "ptOneHpLowestRate":
      return "one";
    case "ptAll":
    case "ptOther":
    case "ptFull":
    case "ptOtherFull":
    case "ptSelfAnotherFirst":
      return "all";
    default:
      return null;
  }
}

function buffCatsFor(func) {
  const cats = [];
  for (const buff of func.buffs ?? []) {
    if (buff.type === "upCommandall") {
      const name = buff.name ?? "";
      if (name.startsWith("Buster")) cats.push("busterUp");
      else if (name.startsWith("Arts")) cats.push("artsUp");
      else if (name.startsWith("Quick")) cats.push("quickUp");
      else if (buff.id === 1589 || name.startsWith("カード性能")) cats.push("cardAllUp");
    } else if (buff.type === "upNpdamage") cats.push("npDamageUp");
    else if (buff.type === "regainNp") cats.push("npPerTurn");
    else if (buff.type === "upDropnp") cats.push("npGainUp");
    else if (buff.type === "upAtk") cats.push("atkUp");
    else if (buff.type === "upCriticaldamage") cats.push("critUp");
    else if (buff.type === "upCriticalpoint") cats.push("starGenUp");
    else if (buff.type === "upStarweight") cats.push("starAbsorbUp");
    else if (buff.type === "upDamage") cats.push("specialAtkUp");
    else if (buff.type === "upDefence") cats.push("defUp");
  }
  if (func.funcType === "gainNp") cats.push("npGaugeUp");
  if (func.funcType === "gainHp") cats.push("heal");
  return cats;
}

function isDamageNp(funcType) {
  return /^damageNp/.test(funcType ?? "");
}

const CARD_MAP = { 1: "arts", 2: "buster", 3: "quick" };

function npTypeOf(nps) {
  const dmg = nps.flatMap((np) => np.functions ?? []).find((f) => isDamageNp(f.funcType));
  if (!dmg) return "support";
  if (dmg.funcTargetType === "enemyAll") return "aoe";
  return "st";
}

async function fetchExport(url, cacheName) {
  const cachePath = `${CACHE_DIR}/${cacheName}`;
  if (existsSync(cachePath)) {
    console.error(`Using cached ${cachePath}`);
    return JSON.parse(readFileSync(cachePath, "utf8"));
  }
  console.error(`Downloading ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const text = await res.text();
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cachePath, text);
  return JSON.parse(text);
}

function dexOf(servant) {
  const match = /\/(\d+)_/.exec(servant.iconUrl ?? "");
  return match ? Number(match[1]) : null;
}

function naNameLookup(na) {
  const byDex = new Map();
  for (const s of na ?? []) {
    byDex.set(s.collectionNo, s);
  }
  return (dex, kind, slot) => {
    const base = byDex.get(dex);
    if (!base) return undefined;
    if (kind === "skill") {
      const skill = (base.skills ?? []).find((k) => k.num === slot);
      return skill?.name || undefined;
    }
    const np = (base.noblePhantasms ?? []).find((n) => n.npNum === slot);
    return np?.name || undefined;
  };
}

function buildEntry(servant, naName) {
  const rows = new Map();

  const addRow = (source, slot, target, cats) => {
    if (!target || cats.length === 0) return;
    const key = `${source}|${slot}|${target}`;
    const existing = rows.get(key);
    if (existing) {
      for (const c of cats) if (!existing.cats.includes(c)) existing.cats.push(c);
    } else {
      rows.set(key, { source, slot, target, cats: [...cats] });
    }
  };

  const slotCd = new Map();
  for (const skill of servant.skills ?? []) {
    const slot = skill.num;
    if (!slot || slot < 1 || slot > 3) continue;
    const cd = Array.isArray(skill.coolDown) && skill.coolDown.length ? Math.min(...skill.coolDown) : undefined;
    if (cd != null) {
      const prev = slotCd.get(slot);
      slotCd.set(slot, prev == null ? cd : Math.min(prev, cd));
    }
    for (const func of skill.functions ?? []) {
      addRow("skill", slot, targetBucket(func.funcTargetType), buffCatsFor(func));
    }
  }

  let npCard = null;
  let npType = "support";
  const npVersions = new Map();
  for (const np of servant.noblePhantasms ?? []) {
    const key = np.npNum ?? 1;
    if (!npVersions.has(key)) npVersions.set(key, []);
    npVersions.get(key).push(np);
  }
  const npSlots = [...npVersions.keys()]
    .sort((a, b) => a - b)
    .map((key, i) => ({ key, slot: i + 1 }));
  for (const { key, slot } of npSlots) {
    const versions = npVersions.get(key);
    const withFuncs = versions.filter((np) => (np.functions ?? []).length > 0);
    if (slot === 1) {
      const primary = withFuncs[0] ?? versions[0];
      npCard = CARD_MAP[primary.card] ?? null;
      npType = npTypeOf(versions);
    }
    for (const np of withFuncs) {
      for (const func of np.functions ?? []) {
        addRow("np", slot, targetBucket(func.funcTargetType), buffCatsFor(func));
      }
    }
  }
  const npNameKey = new Map(npSlots.map(({ key, slot }) => [slot, key]));

  const effects = [...rows.values()]
    .map((row) => {
      const out = { ...row };
      const nameEn = naName(
        servant.collectionNo,
        row.source,
        row.source === "np" ? (npNameKey.get(row.slot) ?? row.slot) : row.slot
      );
      if (nameEn && nameEn !== "？？？" && !/^\?+$/.test(nameEn)) out.nameEn = nameEn;
      if (row.source === "skill") {
        const cd = slotCd.get(row.slot);
        if (cd != null) out.cd = cd;
      }
      out.cats.sort((a, b) => (CAT_RANK.get(a) ?? 99) - (CAT_RANK.get(b) ?? 99));
      return out;
    })
    .sort((a, b) => {
      if (a.source !== b.source) return a.source === "skill" ? -1 : 1;
      return a.slot - b.slot || a.target.localeCompare(b.target);
    });

  return {
    dexNo: servant.collectionNo,
    rarity: servant.rarity,
    np: { card: npCard, type: npType },
    effects,
  };
}

async function main() {
  const roster = JSON.parse(readFileSync("src/data/servants.json", "utf8"));
  const jp = await fetchExport(JP_EXPORT, "nice_servant_JP.json");
  let na = null;
  try {
    na = await fetchExport(NA_EXPORT, "nice_servant_NA.json");
  } catch (err) {
    console.error(`NA export unavailable (${err.message}) — English skill/NP names will be omitted`);
  }
  const naName = naNameLookup(na);

  const jpByDex = new Map();
  for (const s of jp) jpByDex.set(s.collectionNo, s);

  const entries = [];
  const skipped = [];
  for (const servant of roster) {
    const dex = dexOf(servant);
    const atlas = dex != null ? jpByDex.get(dex) : null;
    if (!atlas) {
      skipped.push(servant.name);
      continue;
    }
    const entry = buildEntry(atlas, naName);
    entries.push({ slug: servant.slug, ...entry });
  }

  writeFileSync(OUT_PATH, JSON.stringify(entries, null, 2));
  console.error(
    `Wrote ${entries.length} entries to ${OUT_PATH} (skipped ${skipped.length}: ${skipped.join(", ")})`
  );

  const catCounts = {};
  let rowsTotal = 0;
  for (const e of entries) {
    for (const row of e.effects) {
      rowsTotal++;
      for (const c of row.cats) catCounts[c] = (catCounts[c] ?? 0) + 1;
    }
  }
  console.error(`Rows: ${rowsTotal}`);
  console.error("Category rows:", JSON.stringify(catCounts));
  const npTypes = entries.reduce((acc, e) => ((acc[e.np.type] = (acc[e.np.type] ?? 0) + 1), acc), {});
  console.error("NP types:", JSON.stringify(npTypes));
  const named = entries.flatMap((e) => e.effects).filter((r) => r.nameEn).length;
  const totalRows = entries.flatMap((e) => e.effects).length;
  console.error(`English names: ${named}/${totalRows} rows`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
