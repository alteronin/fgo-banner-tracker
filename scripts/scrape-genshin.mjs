import * as cheerio from 'cheerio';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PAGE_URL = 'https://game8.co/games/Genshin-Impact/archives/603811';
const OUT = fileURLToPath(new URL('../src/data/genshin-banners.json', import.meta.url));

const MONTHS = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

const TYPOS = {
  Ocotber: 'October',
  Octobe: 'October',
  Febuary: 'February',
  Febrary: 'February',
  Janurary: 'January',
  Januray: 'January',
  Septmember: 'September',
  Setember: 'September',
  Agust: 'August',
  Aprill: 'April',
  Janaury: 'January',
};

function cleanText(s) {
  return (s || '').replace(/\s+/g, ' ').trim();
}

function cleanName(s) {
  return cleanText(s).replace(/[=[\]{}]+$/, '').trim();
}

function nameFromAnchor($a) {
  const text = cleanName($a.text());
  if (text) return text;
  const alt = cleanText($a.find('img').attr('alt') || '');
  if (!alt) return '';
  return cleanName(
    alt
      .replace(/^Genshin\s*-\s*/i, '')
      .replace(/\.(png|jpe?g|webp)$/i, '')
      .replace(/\s*[-–]\s*Characters?$/i, '')
      .replace(/\s*Banner$/i, '')
      .replace(/\s*Image$/i, '')
  );
}

function absUrl(href) {
  if (!href) return null;
  return href.startsWith('/') ? `https://game8.co${href}` : href;
}

function parseDateRange(raw) {
  let s = cleanText(raw)
    .replace(/[[\]]/g, ' ')
    .replace(/^\s*nl\s*/i, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .replace(/(\d)\.\s*(\d{4})/g, '$1, $2')
    .trim();
  for (const [bad, good] of Object.entries(TYPOS)) {
    s = s.replace(new RegExp(`\\b${bad}\\b`, 'gi'), good);
  }
  s = s.replace(/\bto\b/gi, '-');

  const m = s.match(
    /([A-Za-z]+)\.?\s+(\d{1,2})(?:,\s*|\s+)(\d{4})?\s*-\s*([A-Za-z]+)\.?\s+(\d{1,2})(?:,\s*|\s+)(\d{4})/
  );
  if (!m) return { start: null, end: null, error: s };
  const sm = MONTHS[m[1].slice(0, 3).toLowerCase()];
  const em = MONTHS[m[4].slice(0, 3).toLowerCase()];
  let sy = m[3] ? +m[3] : null;
  let ey = m[6] ? +m[6] : null;
  if (!sm || !em || !ey) return { start: null, end: null, error: s };
  if (sy === null) sy = ey;
  if (ey - sy > 1) ey = sy;
  if (sy !== ey) {
    const spanDays =
      (Date.UTC(ey, em - 1, +m[5]) - Date.UTC(sy, sm - 1, +m[2])) / 86400000;
    if (spanDays > 60) sy = ey;
  }
  const pad = (n) => String(n).padStart(2, '0');
  return { start: `${sy}-${pad(sm)}-${pad(+m[2])}`, end: `${ey}-${pad(em)}-${pad(+m[5])}` };
}

function dateTextFromCell(text) {
  const t = cleanText(text);
  const idx = t.search(/Banner Dates:/i);
  if (idx === -1) return '';
  const rest = t.slice(idx + 'Banner Dates:'.length);
  const stop = rest.search(/Featured\s*[45]|[45]\s*Star\s*Rate-Up/i);
  return stop === -1 ? rest : rest.slice(0, stop);
}

function cheerioTextOf(node) {
  if (node.type === 'text') return node.data || '';
  let s = '';
  for (const child of node.children || []) s += cheerioTextOf(child);
  return s;
}

function headerTexts($, table) {
  return table
    .find('tr')
    .first()
    .find('th')
    .map((_, th) => cleanText($(th).text()).toLowerCase())
    .get()
    .join('|');
}

function anchorsBetweenSimple($, $cell, labelRe) {
  const nodes = $cell.find('b, a[href]').toArray();
  const startIdx = nodes.findIndex(
    (n) => n.name === 'b' && labelRe.test(cleanText(cheerioTextOf(n)))
  );
  if (startIdx === -1) return [];
  const out = [];
  for (let i = startIdx + 1; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.name === 'b') break;
    const $a = $(n);
    const name = nameFromAnchor($a);
    if (!name) continue;
    const img = $a.find('img');
    out.push({
      name,
      url: absUrl($a.attr('href')),
      image: img.attr('data-src') || img.attr('src') || null,
    });
  }
  return out.filter((x) => !x.image || !x.image.startsWith('data:'));
}

function bannerLinksFromCell($, $cell) {
  const out = [];
  $cell.find('a[href]').each((_, a) => {
    const $a = $(a);
    const name = cleanName($a.text());
    if (!name) return;
    const img = $a.find('img');
    out.push({
      name,
      url: absUrl($a.attr('href')),
      image: img.attr('data-src') || img.attr('src') || null,
    });
  });
  return out.filter((x) => !x.image || !x.image.startsWith('data:'));
}

function versionFrom(text) {
  const m = cleanText(text).match(/(\d+\.\d+)/);
  return m ? m[1] : null;
}

async function main() {
  console.error('Fetching page...');
  const res = await fetch(PAGE_URL, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible; banner-tracker-scraper)' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  console.error(`Fetched ${(html.length / 1024 / 1024).toFixed(1)}MB`);

  const $ = cheerio.load(html);
  const entries = [];
  const stats = { character: 0, weapon: 0, chronicled: 0 };
  const dateErrors = [];

  $('table').each((_, table) => {
    const $table = $(table);
    const head = headerTexts($, $table);
    const $rows = $table.find('tr').slice(1);

    if (head.includes('version') && head.includes('rate-up')) {
      let currentVersion = null;
      $rows.each((_i, row) => {
        const $row = $(row);
        const $vth = $row.children('th[rowspan]').first();
        if ($vth.length) currentVersion = versionFrom($vth.text());
        const $tds = $row.children('td');
        if ($tds.length < 2 || !currentVersion) return;
        const $info = $tds.last();
        const banners = bannerLinksFromCell($, $tds.first());
        if (!banners.length) return;
        const infoText = cleanText($info.text());
        const phaseMatch = infoText.match(/Phase\s*(\d)/i);
        const dateRaw = dateTextFromCell($info.text());
        const { start, end, error } = parseDateRange(dateRaw);
        if (error) dateErrors.push(`character ${currentVersion}: [${error}]`);
        entries.push({
          type: 'character',
          version: currentVersion,
          phase: phaseMatch ? +phaseMatch[1] : null,
          banners,
          startDate: start,
          endDate: end,
          featured5: anchorsBetweenSimple($, $info, /Featured\s*5/i),
          featured4: anchorsBetweenSimple($, $info, /Featured\s*4/i),
        });
        stats.character++;
      });
    } else if (
      head.includes('version') &&
      head.includes('date') &&
      head.includes('banner') &&
      !head.includes('rate-up')
    ) {
      $rows.each((_i, row) => {
        const $row = $(row);
        const $th = $row.children('th').first();
        const $tds = $row.children('td');
        if (!$th.length || $tds.length < 2) return;
        const version = versionFrom($th.text());
        const $info = $tds.last();
        const $a = $tds.first().find('a[href]').first();
        const name = cleanName($a.text());
        if (!version || !name) return;
        const img = $a.find('img');
        const dateRaw = cleanText($info.text());
        const { start, end, error } = parseDateRange(dateRaw);
        if (error) dateErrors.push(`chronicled ${version}: [${error}]`);
        entries.push({
          type: 'chronicled',
          version,
          phase: null,
          banners: [
            {
              name,
              url: absUrl($a.attr('href')),
              image: img.attr('data-src') || img.attr('src') || null,
            },
          ],
          startDate: start,
          endDate: end,
          featured5: [],
          featured4: [],
        });
        stats.chronicled++;
      });
    } else if (head.includes('version') && head.includes('information')) {
      let currentVersion = null;
      $rows.each((_i, row) => {
        const $row = $(row);
        const $vth = $row.children('th[rowspan]').first();
        if ($vth.length) currentVersion = versionFrom($vth.text());
        const $tds = $row.children('td');
        if ($tds.length < 2 || !currentVersion) return;
        const $bannerCell = $tds.first();
        const $info = $tds.last();
        const infoText = cleanText($info.text());
        const phaseMatch =
          cleanText($bannerCell.text()).match(/Phase\s*(\d)/i) ||
          infoText.match(/Phase\s*(\d)/i);
        const dateRaw = dateTextFromCell($info.text());
        const { start, end, error } = parseDateRange(dateRaw);
        if (error) dateErrors.push(`weapon ${currentVersion}: [${error}]`);
        const img = $bannerCell.find('img').first();
        entries.push({
          type: 'weapon',
          version: currentVersion,
          phase: phaseMatch ? +phaseMatch[1] : null,
          banners: [
            {
              name: 'Epitome Invocation',
              url: null,
              image: img.attr('data-src') || img.attr('src') || null,
            },
          ],
          startDate: start,
          endDate: end,
          featured5: anchorsBetweenSimple($, $info, /5\s*Star\s*Rate-Up/i),
          featured4: anchorsBetweenSimple($, $info, /4\s*Star\s*Rate-Up/i),
        });
        stats.weapon++;
      });
    }
  });

  if (dateErrors.length) {
    console.error('DATE ERRORS:');
    dateErrors.forEach((e) => console.error('  ' + e));
    throw new Error(`${dateErrors.length} unparseable dates`);
  }

  const seen = new Set();
  const withIds = entries.map((e) => {
    const slug = e.banners[0].name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    let id = `${e.type}-${e.version}-p${e.phase ?? 'x'}-${slug}`;
    if (seen.has(id)) id = `${id}-2`;
    seen.add(id);
    return { id, ...e };
  });

  withIds.sort((a, b) => {
    if (a.startDate !== b.startDate) return a.startDate < b.startDate ? 1 : -1;
    const order = { character: 0, weapon: 1, chronicled: 2 };
    return order[a.type] - order[b.type];
  });

  const noImage = withIds.filter((e) => !e.banners[0].image);
  const badRange = withIds.filter((e) => !e.startDate || !e.endDate || e.startDate >= e.endDate);
  const longSpan = withIds.filter(
    (e) =>
      e.startDate &&
      e.endDate &&
      (Date.parse(e.endDate) - Date.parse(e.startDate)) / 86400000 > 60
  );
  if (noImage.length || badRange.length || longSpan.length) {
    noImage.forEach((e) => console.error(`no image: ${e.id}`));
    badRange.forEach((e) => console.error(`bad range: ${e.id} ${e.startDate} -> ${e.endDate}`));
    longSpan.forEach((e) => console.error(`span>60d: ${e.id} ${e.startDate} -> ${e.endDate}`));
    throw new Error('validation failed');
  }

  writeFileSync(OUT, JSON.stringify(withIds, null, 2) + '\n', 'utf8');
  console.error(`Wrote ${withIds.length} entries to ${OUT}`);
  console.error(`  character: ${stats.character}, weapon: ${stats.weapon}, chronicled: ${stats.chronicled}`);
  const versions = [...new Set(withIds.map((e) => e.version))];
  console.error(`  versions: ${versions[versions.length - 1]} .. ${versions[0]}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
