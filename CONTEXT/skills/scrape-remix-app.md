# Skill: Scrape Remix/Next.js App

## When to Use
Target site is built with Remix or Next.js (client-side rendered). Standard HTML scraping gets incomplete data. Need to find alternative data sources.

## Pattern

### Step 1: Try Server-Rendered HTML First
```js
import * as cheerio from "cheerio";
const res = await fetch(URL);
const html = await res.text();
const $ = cheerio.load(html);
// Check how many rows/elements you get
```

### Step 2: If Incomplete, Try These Data Sources (in order)

1. **Sitemap XML** — most reliable for complete lists
   ```js
   const sitemap = await fetch("https://example.com/sitemap.xml");
   const xml = await sitemap.text();
   const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
   ```

2. **Embedded JSON** — look for `__NEXT_DATA__`, `__remixContext`, `__remixRouteModules`
   ```js
   const match = html.match(/self\.__remixContext\s*=\s*(\{[\s\S]*?\})<\/script>/);
   ```

3. **Remix `_data` pattern** — append `?_data=routes/path` to URL
   ```js
   const data = await fetch("https://example.com/path?_data=routes/path");
   ```

4. **Individual page scraping** — fetch each item's page for details
   ```js
   // Use og:image meta tag for images
   const icon = $('meta[property="og:image"]').attr("content");
   ```

### Step 3: Batch with Rate Limiting
```js
const BATCH_SIZE = 20;
const DELAY_MS = 500;

for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await Promise.allSettled(batch.map(fetchItem));
  await new Promise(r => setTimeout(r, DELAY_MS));
}
```

### Step 4: Cache Progress
Save intermediate results to a cache file so scraper can resume if interrupted:
```js
const cachePath = "data/cache.json";
const cache = existsSync(cachePath) ? JSON.parse(readFileSync(cachePath)) : {};
// ... fetch and add to cache ...
writeFileSync(cachePath, JSON.stringify(cache, null, 2));
```

## Gotchas
- Remix apps hydrate client-side — initial HTML may only have first page
- `?page=2` query params often don't work (client-side pagination)
- Always encode special chars in URLs: `[` → `%5B`, `]` → `%5D`
- Check `robots.txt` and respect rate limits

## Example: GamePress FGO
- Sitemap at `/sitemap.xml` gave all 487 servant URLs
- HTML table only rendered 60 servants (first page)
- Individual page fetches extracted icon URLs from `og:image`
- Cheerio parsed the server-rendered HTML for banner data (742 items)
