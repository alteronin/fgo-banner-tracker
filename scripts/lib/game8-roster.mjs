import * as cheerio from "cheerio";

const UA = "Mozilla/5.0 (compatible; banner-tracker scraper)";

export async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

export function getWidgetProps(html) {
  const $ = cheerio.load(html);
  const raw = $("#react-collection_browser-wrapper").attr("data-react-props");
  if (!raw) throw new Error("no collection browser widget found");
  const props = JSON.parse(raw);
  if (!props.toolStructuralMapping?.id || !props.toolStructuralMapping?.updatedAt)
    throw new Error("widget props missing mapping id/updatedAt");
  return props.toolStructuralMapping;
}

export async function fetchRoster(pageUrl) {
  const html = await fetchHtml(pageUrl);
  const { id, updatedAt } = getWidgetProps(html);
  const apiUrl = `https://game8.co/api/tool_structural_mappings/${id}.json?updatedAt=${updatedAt}`;
  const res = await fetch(apiUrl, {
    headers: {
      "user-agent": UA,
      accept: "application/json, text/plain, */*",
      referer: pageUrl,
      origin: "https://game8.co",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for roster API`);
  const data = await res.json();
  const items = data.collectionArraySchema?.collectionItems;
  if (!Array.isArray(items) || !items.length) throw new Error("roster API returned no items");
  console.error(`  ${data.toolKey}: ${items.length} items`);
  return items;
}

export function assertRoster(items, { name, minCount, fields }) {
  const seen = new Set();
  for (const item of items) {
    if (!item.id) throw new Error(`${name}: item missing id (${item.name || "?"})`);
    if (!item.name?.trim()) throw new Error(`${name}: item ${item.id} missing name`);
    if (seen.has(item.name)) throw new Error(`${name}: duplicate name ${item.name}`);
    seen.add(item.name);
    if (!item.imageUrl?.startsWith("https://")) throw new Error(`${name}: ${item.name} missing image`);
    if (item.url && !item.url.startsWith("https://")) throw new Error(`${name}: ${item.name} bad url`);
    for (const f of fields) {
      if (!item[f]) throw new Error(`${name}: ${item.name} missing ${f}`);
    }
  }
  if (items.length < minCount) throw new Error(`${name}: only ${items.length} items (< ${minCount})`);
}
