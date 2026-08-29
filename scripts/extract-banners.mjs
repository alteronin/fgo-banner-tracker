import * as cheerio from 'cheerio';

const URL = 'https://grandorder.gamepress.gg/summon-banner-list';

async function main() {
  console.error('Fetching page...');
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  console.error(`Fetched ${(html.length / 1024 / 1024).toFixed(1)}MB`);

  const $ = cheerio.load(html);
  const banners = [];

  // Each banner is in a div.table-row
  $('div.table-row').each((_, row) => {
    const $row = $(row);

    // Image with static.mana.wiki/grandorder/
    const $img = $row.find('img[src*="static.mana.wiki/grandorder/"]');
    if (!$img.length) return;

    const imageUrl = $img.attr('src') || '';

    // Extract date prefix from image filename (YYYYMMDD)
    // Filenames follow pattern: YYYYMMDD <name>.png but some have extra digits
    const dateMatch = imageUrl.match(/grandorder\/(\d+)\s/);
    let datePrefix = null;
    if (dateMatch) {
      const raw = dateMatch[1];
      if (raw.length >= 8) {
        // Take first 8 digits
        datePrefix = raw.slice(0, 8);
      }
      // If less than 8 digits, ignore (not a standard date prefix)
    }

    // Banner name is in the span after the img, inside the same parent div
    const bannerName = $row.find('span.font-semibold.text-xs').first().text().trim();

    // Region and dates - each banner can have multiple regions
    // Structure: <ul><li><div class="text-xs flex ..."><div class="font-bold">Japan:</div><div>2024-09-20</div><span>to</span><div>2024-09-29</div></div></li>...</ul>
    const regions = [];
    $row.find('li > div.text-xs.flex').each((_, div) => {
      const $div = $(div);
      const regionEl = $div.find('div.font-bold').first();
      const regionName = regionEl.text().replace(':', '').trim();
      const dateDivs = $div.find('div:not(.font-bold)');
      if (dateDivs.length >= 2 && regionName) {
        regions.push({
          region: regionName,
          startDate: $(dateDivs[0]).text().trim(),
          endDate: $(dateDivs[1]).text().trim(),
        });
      }
    });

    // Flatten to single region/startDate/endDate for backward compat
    // If multiple regions, use first one but store all in a regions array
    const region = regions.length > 0 ? regions[0].region : '';
    const startDate = regions.length > 0 ? regions[0].startDate : '';
    const endDate = regions.length > 0 ? regions[0].endDate : '';

    // Servants by category (Single, Shared, etc.)
    const servants = {};

    // Find all servant category sections
    // Each has a "Single"/"Shared" badge followed by a list of servants
    $row.find('span.inline-flex').each((_, badge) => {
      const badgeText = $(badge).text().trim();
      if (badgeText === 'Single' || badgeText === 'Shared' || badgeText === 'Pickup') {
        // Get the next ul element
        const $ul = $(badge).next('ul');
        if ($ul.length) {
          const servantList = [];
          $ul.find('a[href*="/c/servants/"]').each((_, a) => {
            const name = $(a).text().trim();
            const slug = $(a).attr('href')?.replace('/c/servants/', '') || '';
            if (name) servantList.push({ name, slug });
          });
          if (servantList.length > 0) {
            servants[badgeText] = servantList;
          }
        }
      }
    });

    if (bannerName) {
      banners.push({
        name: bannerName,
        imageUrl,
        datePrefix,
        region,
        startDate,
        endDate,
        regions: regions.length > 1 ? regions : undefined,
        servants,
      });
    }
  });

  console.error(`Extracted ${banners.length} banners`);

  // Year breakdown
  const yearCounts = {};
  for (const b of banners) {
    const year = b.datePrefix ? b.datePrefix.slice(0, 4) : 'unknown';
    yearCounts[year] = (yearCounts[year] || 0) + 1;
  }
  console.error('Year breakdown:', JSON.stringify(yearCounts, null, 2));

  // Output JSON to stdout
  console.log(JSON.stringify(banners, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
