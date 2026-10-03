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

## Bucket 11: Events Tab (Deferred)
**Status**: Deferred by user (2026-10-03) — skipped in favor of Bucket 12; revisit later

### Features
- [ ] **events-data**: Unified event schema `{id, game, name, startDate, endDate, type, url?, imageUrl?}` + per-game JSON store merged into one feed
- [ ] **events-scraper**: Scrape current/upcoming event schedules per game (source pages TBD — Game8 event pages per game)
- [ ] **events-page**: `/events` route + nav tab — game filter (All + per game), Now / Upcoming / Past sections, active-event highlight with shared active-window helper, year filter
- [ ] **events-tests**: schema integrity, date windowing, section bucketing tests

---

## Bucket 12: Cross-Game Units & Faves (Complete)
**Status**: Completed (2026-10-03) — local QA green (qa-units 168/168, qa-faves 174/174, qa-backup 18/18 + all banner regressions)

Generalize the FGO-specific `/servants` and `/grands` pages to other games.

### Roster Sources (verified)
- **Game8 roster API** (genshin/hsr/zzz/wuwa): roster page embeds `#react-collection_browser-wrapper[data-react-props]` → `{toolStructuralMappingId, updatedAt}`; fetch `https://game8.co/api/tool_structural_mappings/{id}.json?updatedAt={ts}` with `referer` + `origin: https://game8.co` headers (403 without them) → `collectionArraySchema.collectionItems` `{id,name,imageUrl,url,...}`. Shared helper `scripts/lib/game8-roster.mjs`.
  - genshin: page `archives/296707` → **127** chars {rarity, element, weapon}
  - hsr chars: page `archives/404256` → **93** {rarity, path, element}
  - hsr light cones: SSR table on `archives/406599` (no widget) → **170** rows (`Light Cone|Rarity|Path` heads, portraits `img.game8.co` data-src, rarity `5-Star`→`5`), ids prefixed `lc-` (no collision with char ids)
  - zzz: page `archives/435684` → **60** agents {rarity, attribute, specialty}
  - wuwa: page `archives/452489` → **59** {rarity, element, weapon}
- **HI3**: fandom MediaWiki API — `list=categorymembers Category:Battlesuits` → **110** titles; metadata from `Module:Battlesuit/data` Lua table (one parse: character, base_rank, game_type, weapon, dmg_type, version_all — per-page wikitext templates are sparse/empty for old suits); portraits `File:{name with ":"→" -"} (Thumbnail).png` via batch `prop=imageinfo`
- **Shadowverse**: `action=parse&page=Leader/Worlds Beyond` wikitext → `<gallery>` entries `File:X em.png|[[Leader]]/[[Class]]` across 7 top-level sections; **65** gallery entries → **63** units (2 Summer entries reference files that don't exist on the wiki — wiki itself renders them broken, skipped with warning + count guards); duplicate leader names qualified from filename parens → `Eudie (Summer)`, `Lilanthim (Summer)`; section → `obtain` taxonomy (Default/Classic/Exchange/Limited/Battle Pass/Special/Frieren)

### Features
- [x] **units-pages**: static `src/app/{game}/units/page.tsx` ×6 wrapping shared client `UnitsPage` (`src/components/UnitsPage.tsx`) — mirrors `/servants`: stats cards (Total/Owned/Planning/Unmarked), search, status filter pills, sort (Name/Status/`{categoryLabel}`/Rarity|Rank, omitted for SV), toggle button cycling none→owned→planning→none; per-game subtitle (`Element · Weapon`, `Path · Element` / `Light Cone · Path`, `Attribute · Specialty`, `Type · Character`, `Class · Obtain`); `getAppBySlug` titles
- [x] **unit-status-storage**: `src/lib/unitStorage.ts` — `unit-status:{game}` + `faves:{game}` keys, raw-string-keyed per-game caches, `subscribe/getSnapshot/serverSnapshot/notify` per game, keys removed when emptied; `src/types/units.ts` + `src/lib/units.ts` (data loaders, `UnitRow` mapping, `UnitsConfig`, `UNIT_GAMES`, `isUnitGame`)
- [x] **unit-context**: `src/contexts/UnitContext.tsx` — `UnitProvider({game})` + `useUnitStatus()`, useSyncExternalStore with per-game memoized subscribe trio
- [x] **faves-pages**: static `src/app/{game}/faves/page.tsx` ×6 wrapping shared `FavesPage` — **9 slots for all games** (`Favorite 1..9`), pool = owned units only, click = assign, same-slot click = clear, unit in another slot = move (never duplicated); selected name in slot header, `N of 9 selected` subtitle, empty state linking to `/{game}/units`
- [x] **per-game-nav**: `src/components/GameTabs.tsx` (Banners/Units/Faves pills, `aria-current`, active = white pill) wired into all 6 tracker headers (before FGO pill) and both new page headers; FGO keeps its existing `/servants`+`/grands` nav untouched
- [x] **import-export-v2**: `ImportExport` now exports `{version: 2, unitStatus: {fgo, genshin, ...}, faves: {fgo(grands), ...}}` as `collection-backup.json`; import detects v2 (applies per game incl. faves + notifies all stores) and still accepts legacy flat v1 FGO-only files
- [x] **units-faves-tests**: `unitsData.test.ts` (counts 127/263/60/59/110/63, unique ids, https images, hsr 93/170 split, hi3 rank scores, SV broken-image skip + obtain set), `unitStorage.test.ts` (keys, isolation, snapshot identity, subscriptions), `UnitContext.test.tsx` (toggle cycle, persistence, cross-provider notify) → **240 tests total**
- [x] **local-qa**: `qa-units.js` (28 checks ×6 games: route/title/tabs/active/stats/rows/images/search/empty-state/sort/toggle-cycle/persistence/filters/nav) 168/168; `qa-faves.js` (29 ×6: slots/pool/select/move/deselect/persist/clear/empty-state/nav) 174/174; `qa-backup.js` (export payload shape, v2 import roundtrip, v1 legacy import, invalid alert) 18/18; regressions: qa-genshin 42, qa-hsr 46, qa-zzz 47, qa-wuwa 51, qa-hi3 44, qa-shadowverse 47, qa-switcher 24, qa-sort/theme/mobile exit 0

### Design Decisions
- FGO keeps its existing storage keys (`fgo-servant-status`, `fgo-grand-servants`) — no migration; other games use generic `unit-status:{game}` / `faves:{game}`
- Static per-game route dirs (`src/app/{game}/units|faves/page.tsx`) following the tracker convention — `[game]` dynamic segment untouched
- 9 fave slots for every game (no taxonomy constraint like FGO's class slots); pool restricted to owned units
- Rosters include announced/unreleased units (users mark "planning"); taxonomy pill-button FILTER UI deferred to Bucket 13 but fields (element/path/attribute/class/type/rank) already in the data
- HSR = characters + light cones (`type` field, `lc-` id prefix); ZZZ = agents only; SV = leaders only (no rarity → sort option omitted)

### Completion Checklist
- [x] gates: tsc/eslint/`npm test` (240)/`npm run build` clean; build shows all 12 new static routes
- [x] delete `scripts/_probe.mjs` + `scripts/_fetch.mjs` (temp research scripts)
- [x] commit + push (`ef75305`), `npx vercel --prod` (deployed 2026-10-03, 24 static routes)
- [x] live QA with `BASE=https://fgo-banner-tracker.vercel.app` (qa-units 168/168, qa-faves 174/174, qa-backup 18/18; regressions: genshin 42, hsr 46, zzz 47, wuwa 51, hi3 44, shadowverse 47, switcher 24 all 0 fail; qa-live 74 pass — 2 stale export assertions superseded by qa-backup; qa-sort 0 diffs, qa-theme/mobile exit 0)
- [x] `npm prune` (playwright removed; reinstall with `npm i --no-save playwright` next cycle)

---

## Bucket 13: Class & Element Button Filters (Planned)
**Status**: Not started

### Features
- [ ] **unit-taxonomy-data**: Ensure every game's unit roster carries class/element fields (FGO classes exist: Saber-Archer-Mage...Avenger-Beast; Genshin elements: Pyro/Hydro/Anemo/Electro/Dendro/Cryo/Geo; HSR elements + paths — scrape/backfill as needed)
- [ ] **class-element-filters**: Pill-button filter groups on the servants/units tab — multi-select buttons per game's taxonomy, combinable with existing search/sort/status filters; "All" reset behavior
- [ ] **filter-tests**: button filter state, multi-select semantics, combination with search/status filters
