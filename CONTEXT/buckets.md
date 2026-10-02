# MVP Bucket Plan

## Bucket 1: Core MVP (Complete)
**Status**: Completed

### Features
- [x] **seed-data**: Banner JSON data, TypeScript types, localStorage utilities
- [x] **banner-list**: Banner card component and main page with responsive grid
- [x] **servant-toggle**: Servant context, ServantChip component, and toggle functionality
- [x] **banner-indicators**: Owned/planning count indicators on banner cards
- [x] **filter-bar**: Filter bar and banner list component with filtering logic
- [x] **banner-detail**: Banner detail modal with servant list and rate-up sections
- [x] **responsive-pass**: Mobile responsiveness for banner detail modal

---

## Bucket 2: Enhanced UX (Complete)
**Status**: Completed

### Features
- [x] **search**: Search by servant name
- [x] **dark-light-mode**: Dark/light mode toggle
- [x] **import-export**: Import/export collection (JSON file)
- [x] **rate-up-indicators**: Show rate-up type (single/shared) on banner cards
- [x] **collection-stats**: Collection stats summary (total owned, completion %)
- [x] **url-filtering**: URL-based filtering (shareable links like `?filter=owned`)

---

## Bucket 3: Multi-Game Prep + Advanced (Complete)
**Status**: Completed

### Features
- [x] **sort-options**: Sort options (date, name, servant count)
- [x] **advanced-search**: Advanced search panel with combined filters
- [x] **keyboard-navigation**: Keyboard navigation (Escape to close)

---

## Bucket 4: Polish & Extras (Complete)
**Status**: Completed

### Features
- [x] **loading-skeletons**: Loading skeletons
- [x] **seo-meta**: SEO meta tags and Open Graph
- [x] **about-help**: About/help page

---

## Bucket 5: Post-Launch (Complete)
**Status**: Completed

### Features
- [x] **year-filter**: Year filter dropdown for banners
- [x] **full-scraper**: Re-scrape all banners (742 total, 2017-2026) with cheerio
- [x] **image-fallback**: ImageWithFallback component for broken image graceful degradation
- [x] **image-fix**: Bracket-encoding fix for 24 broken image URLs
- [x] **servants-page**: Servant collection page with 487 servants, thumbnails, status tracking
- [x] **servant-scraper**: Scrape servant data from GamePress sitemap + pages
- [x] **unit-tests**: 39 unit tests (Vitest + Testing Library) for data, storage, context, hooks

---

## Bucket 6: Grand Servants (Complete)
**Status**: Completed

### Features
- [x] **grand-servants**: Grand servant lineup page — 9 slots (7 main + Extra I + Extra II), click-to-select, localStorage persistence

---

## Bucket 7: QA Remediation (Complete)
**Status**: Completed (2026-10-03)

### Features
- [x] **hydration-safe-state**: ServantContext, ThemeContext, useBannerFilter URL state, and grands selections converted to `useSyncExternalStore` — eliminated all React #418 hydration errors
- [x] **theme-dom-toggle**: Tailwind `light:` custom variant + DOM class switching + pre-paint inline script — dark/light toggle now actually changes the UI and persists
- [x] **advanced-search-wired**: AdvancedSearch panel imported into BannerList with controlled search input
- [x] **loading-skeletons-live**: ImageWithFallback shows pulse skeleton while loading; route-level `src/app/loading.tsx`
- [x] **mobile-overflow-fix**: Header wraps at 375px (0px overflow on all routes)
- [x] **class-data-backfill**: 39 servants with empty `className` backfilled from GamePress (23 Avenger, 14 Beast, 0 empty); scraper class regex fixed to include Avenger/Beast + compound labels
- [x] **banner-data-cleanup**: 4 duplicate servant entries removed; 6 banner names whitespace-normalized; zero-servant banner modal shows explanatory note
- [x] **escape-about-modal**: AboutHelp closes on Escape; duplicate heading removed
- [x] **unit-tests**: 54 tests (added ThemeContext, AboutHelp, URL-state suites)

---

## Bucket 8: Multi-Game Expansion (Complete)
**Status**: Completed (2026-10-03)

### Features
- [x] **app-switcher**: App registry (`src/lib/apps.ts`) + AppSwitcher dropdown (Escape/outside-click close, `role=menu`, `aria-current`) wired into all route headers; static `[game]` route with `generateStaticParams` + `dynamicParams=false` (unknown slugs 404, not 200); ComingSoonApp placeholder shell
- [x] **genshin-scraper**: `scripts/scrape-genshin.mjs` — cheerio scrape of Game8 banner tables → `src/data/genshin-banners.json` (216 entries: 105 character, 104 weapon, 7 chronicled; versions 1.0-7.0); rowspan version tracking, `img.alt` featured names, manual date parsing with source-typo clamps, span≤60d validation
- [x] **genshin-tracker**: Static `/genshin` route (excluded from `[game]` params) — type/year/search filters, banner card grid (type badges, ACTIVE indicator, version overlay, featured 5★ chips), detail modal (featured 5★/4★ Game8 links, Escape close), empty state
- [x] **genshin-tests**: 20 data-integrity + helper tests (counts, dates, URL/image presence, date-range formatting, active-window checks) → 81 total

---

## Bucket 9: HSR Tracker (Complete)
**Status**: Completed (2026-10-03)

### Features
- [x] **hsr-scraper**: `scripts/scrape-hsr.mjs` — cheerio scrape of Game8 HSR banner-history tables → `src/data/hsr-banners.json` (131 entries: 66 character, 65 light cone; 32 versions 1.0-4.7); in-table phase headers, row-parity type classification, start-year derivation, TBA end handling, collab dedupe, span≤60d validation
- [x] **hsr-tracker**: Static `/hsr` route (excluded from `[game]` params) — character/light-cone type filter, year/search filters, banner cards (type badges, ACTIVE indicator, version overlay omitted for collab), detail modal with nullable end ("TBA") and version-optional rows
- [x] **hsr-tests**: 23 data-integrity + helper tests (nullable version/end, active-window incl. TBA, date-range formatting) → 104 total

---

## Bucket 10: Remaining Game Trackers (Complete)
**Status**: Completed (2026-10-03) — committed `95771ca`, pushed, deployed to production, live QA green (qa-zzz 47/47, qa-wuwa 51/51, qa-hi3 44/44, qa-shadowverse 47/47, qa-switcher 24/24, qa-hsr 46/46, qa-genshin 42/42, qa-live 76/76)

### Source Decisions (verified)
- **ZZZ**: https://game8.co/games/Zenless-Zone-Zero/archives/435687 — table 5 ("Ver. / All Agent and W-Engine Banners"), 68 rows. All data rows = 2 `td` cells (c0 = agent banner, c1 = W-Engine banner); version carried by `th` cell on block-start rows, continuation rows inherit last version. Cell text: `Name Banner MM/DD - MM/DD/YYYY (Phase N)` (start year sometimes omitted/present, single-digit days, missing spaces before date/`(Phase)`, phase sometimes absent). Per-cell image (img.game8.co `data-src`) + banner page link (absolutize).
- **WuWa**: https://game8.co/games/Wuthering-Waves/archives/494979 — tables 2-24 with `r0 = Banners | Banner Details`, preceded by h2/h3 `Banners for X.Y` (tables 2-4, 6-24) or `Special Reverbs Selector Banners` (table 5, inherits 3.5). Data rows: c0 = 1-3 banner name links (positional with the Limited 5★ chars), c1 = details text `Phase N Start: Month D, YYYY End: Month D, YYYY Limited 5★ <chars, (Debut)> Rate-up 4★ <chars> Featured Weapon(s): <weapons>` (Reverbs row has no dates → nullable).
- **HI3**: fandom MediaWiki API (Cloudflare blocks HTML curl but api.php works) — scraped from `Category:Versions` union (73 pages; year-GLB categories only cover 66 and v1.0-1.7 pages don't exist — v1.8 is the first global version) → version pages with `{{Version Entry}}` params + `{{Version Infobox}}` fallback (1.8, 2.2.2/2.2.3/2.2.5/2.2.8, 2.3, 2.6): `summary` (debut battlesuit), debut dates (comma optional, full month names), `previous`/`next` chain; banner image = `File:Version X.Y (Banner).png` (static.wikia.nocookie.net, now in next.config AND rendered `unoptimized` — Fandom 403s optimizer fetches without Referer). Model = one entry per GLB version: window start → next start, featured5 = debut line from summary, null end = ongoing.
- **Shadowverse WB**: card-set leader exchange banners (user-approved model): official cards page drives set list/schedule (`https://shadowverse-wb.com/en/cards/pack/...`), leaders from researched SETS map (embedded in scraper, fails loudly on unknown set). 9 sets permanent (endDate null) + Frieren collab windowed (2025-12-29 → 2026-01-27, leaders Aura/Fern/Frieren/Stark). Umamusume/Zombieland collabs do not exist (dropped). No images in source → fallback placeholders.
- **Rejected**: Community Google Sheet for HI3 (abandoned at v7.4/2024); year-GLB DPL categories alone (missing 7 versions).

### Features
- [x] **zzz-scraper**: `scripts/scrape-zzz.mjs` → `src/data/zzz-banners.json` (134 entries: 67 agent + 67 W-Engine; versions 1.0-3.2 with 1.8/1.9/2.9 skipped; 8 no-phase; 65 featured5; 2 "Exclusive Rescreening" agents intentionally featured-less)
- [x] **zzz-tracker**: Static `/zzz` route — Agent/W-Engine type filter, year/search, cards (type badges, version·phase overlay, ACTIVE), detail modal with type-aware no-featured note (W-Engine paired-channel wording vs generic)
- [x] **zzz-tests**: `zzzData.test.ts` 21 tests
- [x] **wuwa-scraper**: `scripts/scrape-wuwa.mjs` → `src/data/wuwa-banners.json` (46 entries: 45 resonator + 1 Special Reverbs selector with null dates; versions 1.0-3.7 with 1.5-1.9 skipped; `featuredWeapons[]`; all featured5 present)
- [x] **wuwa-tracker**: Static `/wuwa` route — Resonator/Selector type filter, cards with nullable dates ("No dates listed"), detail modal with Featured 5★/4★/Weapons sections, selector "Not listed" dates; active requires both dates
- [x] **wuwa-tests**: `wuwaData.test.ts` 20 tests
- [x] **hi3-scraper**: `scripts/scrape-hi3.mjs` → `src/data/hi3-banners.json` (73 GLB versions v1.8 2018-03-22 → v9.0 2026-08-20; Category:Versions union via batched `action=query`; dual `Version Entry`/`Version Infobox` templates; summary debut-line featured extraction; 72/73 images, 66/73 featured5, only v9.0 endDate null)
- [x] **hi3-tracker**: Static `/hi3` route — no type filter (single battlesuit type), year/search, cards with "Ongoing" ranges, detail modal ("Debut Battlesuits", End: Ongoing, "on Fandom Wiki" source); active = started && (no end || end ≥ now)
- [x] **hi3-tests**: `hi3Data.test.ts` 23 tests
- [x] **shadowverse-scraper**: `scripts/scrape-shadowverse.mjs` → `src/data/shadowverse-banners.json` (10 entries: 9 sets + 1 collab; official cards page + embedded SETS leader map; set leaders per pack verified)
- [x] **shadowverse-tracker**: Static `/shadowverse` route — Card Set/Collab type filter, cards with "Permanent" ranges and no version overlay, detail modal ("Exchange Leaders" vs "Collab Leaders", End: Permanent/date, "on Official Site"); active = latest set only (windowed collabs)
- [x] **shadowverse-tests**: `shadowverseData.test.ts` 17 tests → 185 total
- [x] **game-trackers-tests**: all four slugs excluded from `[game]` `generateStaticParams` via `SLUGS_WITH_OWN_PAGE` set (empty params; unknown slugs still 404)
- [x] **image-domains**: `static.wikia.nocookie.net` added to next.config remotePatterns; `ImageWithFallback` renders `unoptimized` for wikia (Fandom 403s optimizer) and skips empty-src requests entirely (imageless SV data)
- [x] **local-qa**: qa-zzz 47/47, qa-wuwa 51/51, qa-hi3 44/44, qa-shadowverse 47/47, qa-switcher 24/24 (all 4 live), qa-hsr 46/46, qa-genshin 42/42 (regressions updated from placeholder to live /hi3), qa-mobile/theme/sort clean; tsc/eslint/`npm test`/`npm run build` clean

### Completion Checklist
- [x] delete `research/` + `server.log` + `server-err.log`
- [x] commit + push (`95771ca`), `npx vercel --prod`
- [x] live QA with `BASE=https://fgo-banner-tracker.vercel.app` (all suites green)
- [x] `npm prune` (playwright removed; reinstall with `npm i --no-save playwright` next cycle)

### Notes
- Follow Genshin/HSR conventions exactly: static route, `[game]` exclusion, shared RateUpChip/SearchBar/YearFilter/ImageWithFallback, no comments, span≤60d validation, absolute URL normalization
- Playwright is `--no-save` installed per cycle and pruned after; QA scripts live in `%TEMP%\opencode` with `$env:NODE_PATH` pointing at repo `node_modules`
- PowerShell `node -e` mangles `$('...')` — always write a script file for complex queries

---

## Bucket 11: Events Tab (Planned)
**Status**: Not started

### Features
- [ ] **events-data**: Unified event schema `{id, game, name, startDate, endDate, type, url?, imageUrl?}` + per-game JSON store merged into one feed
- [ ] **events-scraper**: Scrape current/upcoming event schedules per game (source pages TBD — Game8 event pages per game)
- [ ] **events-page**: `/events` route + nav tab — game filter (All + per game), Now / Upcoming / Past sections, active-event highlight with shared active-window helper, year filter
- [ ] **events-tests**: schema integrity, date windowing, section bucketing tests

---

## Bucket 12: Cross-Game Units & Faves (Planned)
**Status**: Not started

Generalize the FGO-specific `/servants` and `/grands` pages to other games.

### Features
- [ ] **units-pages**: Per-game unit roster pages reusing the `/servants` pattern (thumbnails, status tracking owned/planning, search, sort) — e.g. Genshin characters, HSR characters + light cones; route scheme TBD (likely `/[game]/units` static subroutes so `[game]` params stay unaffected)
- [ ] **unit-status-storage**: Status storage keyed per game (`unit-status:{game}`) via useSyncExternalStore; import/export extended to all games
- [ ] **faves-pages**: Per-game favorites/lineup pages as analog of `/grands` (select units into roster slots, persisted per game); per-game slot counts TBD (FGO keeps 9)
- [ ] **per-game-nav**: Per-game tab navigation (Banners / Units / Faves, later Events) consistent across games
- [ ] **units-faves-tests**: storage keys, status toggling, slot persistence per game

---

## Bucket 13: Class & Element Button Filters (Planned)
**Status**: Not started

### Features
- [ ] **unit-taxonomy-data**: Ensure every game's unit roster carries class/element fields (FGO classes exist: Saber-Archer-Mage...Avenger-Beast; Genshin elements: Pyro/Hydro/Anemo/Electro/Dendro/Cryo/Geo; HSR elements + paths — scrape/backfill as needed)
- [ ] **class-element-filters**: Pill-button filter groups on the servants/units tab — multi-select buttons per game's taxonomy, combinable with existing search/sort/status filters; "All" reset behavior
- [ ] **filter-tests**: button filter state, multi-select semantics, combination with search/status filters
