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

## Bucket 13: Class & Element Button Filters (Complete)
**Status**: Completed (2026-10-04) — committed `9109c9c`, pushed, deployed to production, live QA green (qa-filters 134/134, qa-units 168/168, qa-backup 18/18, qa-live only 2 known stale export assertions)

### Filter Groups (verified from roster data)
- genshin: Element (7 canonical: Pyro, Hydro, Anemo, Electro, Dendro, Cryo, Geo) + Weapon (5: Sword, Claymore, Polearm, Bow, Catalyst)
- hsr: Element (7: Fire, Ice, Lightning, Wind, Physical, Quantum, Imaginary — light cones have NO element key → null) + Path (9 "The *" values) + Type (Character / Light Cone)
- zzz: Attribute (7: Fire, Ice, Electric, Ether, Physical, Wind, Lumiflux) + Specialty (7: Attack, Stun, Anomaly, Support, Defense, Rupture, Armorer)
- wuwa: Element (6: Aero, Fusion, Glacio, Electro, Havoc, Spectro) + Weapon (5: Sword, Broadblade, Gauntlet, **Pistol** singular, Rectifier)
- hi3: Type (6: MECH, PSY, BIO, IMG, QUA, SD) + Damage (4: Physical, Lightning, Fire, Ice)
- shadowverse: Class (7: Swordcraft, Forestcraft, Dragoncraft, Havencraft, Runecraft, Portalcraft, Abysscraft)
- FGO /servants: Class (15 via existing `CLASS_ORDER`, Shielder → Beast)

### Features
- [x] **unit-taxonomy-data**: All roster taxonomy fields confirmed present (782 units + 487 FGO servants with populated className); no scraping needed — probe script enumerated distinct values per field
- [x] **class-element-filters**: `TaxonomySpec<T>` per game in `src/lib/units.ts` (key, label, canonical order, getter) → `UnitRow.filters: Record<string, string|null>` + `UnitsConfig.filterGroups: {key,label,values}[]` (distinct values from data, canonical sort); pure `matchesFilterGroups` helper; UnitsPage renders labeled pill rows (label + All + values) between controls and results count; `/servants` gets the same pattern inline with `CLASS_ORDER`; multi-select OR within group, AND across groups + status + search; per-group All reset; `aria-pressed` on all pills; existing FilterButton styling
- [x] **filter-tests**: `unitFilters.test.ts` (16: group keys/values locked per game, unique+data-covered values, row filter mapping incl. hsr LC null element + 170/93 split, matchesFilterGroups semantics), `UnitsPage.test.tsx` (10: initial, single toggle, OR, All reset, weapon group, cross-group AND, +search, +status, hsr type/element exclusion, toggle-off), `ServantsPage.test.tsx` (6: initial, single class, OR, reset, +status, +search) → **272 tests total**
- [x] **local-qa**: `qa-filters.js` — per game: group present, All active, first/second value counts (computed from JSON), OR counts, All resets, cross-group AND, taxonomy+search empty state, status combination, no page errors; hsr special (Light Cone 170 → +Fire 0 → clear type → Fire chars 15); FGO servants (Saber 59, +Lancer 115, Beast 14, +Owned 0, search "altria pendragon") → 134/134; regressions qa-units 168/168, qa-live 74 pass (2 stale export assertions)

### Design Decisions
- Multi-select per buckets.md spec (OR within group); empty group = no filter with explicit All pill showing active state
- Null taxon never matches (HSR light cones drop out of every element selection — intentional: "Fire" means Fire units)
- Group values derived from data at module load, sorted by hardcoded canonical order (unknown values sort last alphabetically) — stable UI + auto-adapts to new roster values
- No URL state / no persistence — local component state like the existing type filters
- Filter UI appears on units pages + FGO servants only (faves pools intentionally untouched)

### Completion Checklist
- [x] gates: tsc/eslint/`npm test` (272)/`npm run build` clean (24 routes)
- [x] delete `scripts/_taxprobe.mjs` (temp research script)
- [x] commit + push (`9109c9c`), `npx vercel --prod` (deployed 2026-10-04)
- [x] live QA with `BASE=https://fgo-banner-tracker.vercel.app` (qa-filters 134/134 re-run — first run 131/134 had 3 transient failures, all green after; qa-units 168/168; qa-backup 18/18; qa-live 2 stale export assertions only)
- [x] `npm prune` (playwright removed; reinstall with `npm i --no-save playwright` next cycle)

---

## Bucket 14: Pull-History Import & Pity Tracker (Complete)
**Status**: Complete (2026-10-04) — committed `5817fde` (feat) + `98c16cf` (docs), pushed, deployed to production, live QA green; follow-up per-5★ drop pity `cbdef13` deployed with qa-pity 19/19

Import the user's gacha pull-history exports (`wuwatracker-pulls.json` for WuWa, `stardb-export.json` for HSR/ZZZ/GI), auto-populate owned units, and add a Pulls page with pity stats + banner attribution.

### Scope (user-approved via Q&A)
1. Pulls tab on **all 6 games**; FGO/HI3/SV show empty state (no export formats exist for them)
2. Owned population: **fill only unset units** — never overwrite existing `owned`/`planning`
3. Pulls page shows: 5★ pity stats + pity histogram + banner attribution + 4★ pity
4. Backup bumped to **v3** `{version:3, unitStatus, faves, pulls}`; v1/v2 still importable
5. WuWa **weapons tracked as owned too** (added to roster, Type filter group)
6. Follow-up: **pity counter per 5★** — `Pity N` badge on every 5★ row + a **5★ drops (pity)** table (Date/Name/Banner/Pity, newest first)
7. Follow-up: **grid view** (List/Grid toggle) — 5★ drops only, thumbnail tiles with pity number (color-coded by timing) and 50/50 border (green won / red lost / grey neutral)
8. Follow-up: **stardb parity** — pity/order matches stardb exactly (`comparePullOrder`: ts → export-array `seq` → id, verified 80/80 vs site), 50/50 gains **Guarantee** state (featured after a loss, teal border), grid tiles square ~76px in a padded container; re-import auto-upgrades stored pulls with `seq`

### Export Formats (verified)
- **WuWa** `wuwatracker-pulls.json` (0.58MB): `{siteVersion, version, date, playerId, pulls[]}`; pull = `{cardPoolType, resourceId, qualityLevel, name, time, isSorted, group}`. Names inline (no external map needed), `qualityLevel` = rarity. Pools: 1=Featured Resonator, 2=Featured Weapon, 4=Permanent Weapon, 5/6=Novice/Permanent Resonator, 7=Giveback/Selector, 10/12=New Voyage; unknown → "Pool N". 2,918 pulls; 41/41 distinct resonator names match roster, 47/47 weapon names match new weapon roster (0 rarity mismatches).
- **stardb-export.json** (1.25MB): `{user:{username, hsr/zzz/gi:{achievements, uids:[{uid, verified, private, warps|signals|wishes}]}}}`. Pull = `{id, item_id, type, timestamp, official}`. Pulls are **pre-grouped by banner category**: hsr `departure/standard/character/light_cone`, zzz `standard/character/w_engine/bangboo`, gi `beginner/standard/character/weapon/chronicled` — attribution category comes free, only date-window → phase/banner needed. Counts: HSR 3,742 (119 item ids), ZZZ 3,465, GI 4,550 (132 item ids).
- GI/HSR/ZZZ item ids → roster unit via pull-map JSON baked at build time (rarity baked in too, so import is offline).

### Pull-Map Sources (verified end-to-end)
- **HSR**: stardb `GET /api/characters` + `/api/light-cones` → 119/119 ids resolved; rarity all present; **59 five-star pulls**. Name bridge: exact → segment-after-`•` (stardb alt-forms: `Himeko • Nova`→Nova, `Robin • Summeretto`→Summeretto, also `Dan Heng • Imbibitor Lunae`, `Dan Heng • Permansor Terrae`, `Aventurine • Waveflair`) → unique-substring. **No roster refresh needed** — local `hsr-units.json` already has Nova + Summeretto (263 units; live Game8 count = local 93 chars).
- **GI**: yatta `https://gi.yatta.moe/api/v2/en/avatar` + `/weapon` → 132/132 ids, 0 unresolved (substring name match).
- **ZZZ**: npm `zzz-data` → 3,337/3,465; 8 agent gap ids (1431, 1481, 1491, 1511, 1521, 1541, 1561, 1581) via GO `characterIdMap.json` → all 8 in `zzz-units.json`; bangboo `54021` (1 pull) has no rarity source → import as unknown-rarity item (excluded from pity, shown "Unknown").
- **WuWa**: names inline in export → roster match (resonators + weapons).

### Roster Additions (WuWa weapons)
- Source: Game8 `archives/452490` ("List of All Weapons") — SSR table `Weapon|Type|Rarity`, 114 rows (49×5★, 43×4×, 21×3★), per-row `img.game8.co` `data-src` + archive link. New `scripts/scrape-wuwa-weapons.mjs` appends `{id:"w-<archiveId>", type:"weapon", element:null, weapon:<type>, rarity, imageUrl, url}`; existing 59 resonators gain `type:"resonator"` (→ `wuwa-units.json` 173).
- `WUWA_TAXONOMY` gains Type group (Resonator/Weapon) mirroring HSR; `element` getter null for weapons (never matches an element selection); subtitle/category conditional; noun → "resonators and weapons"; weapons excluded from faves picker pool.

### Architecture (as built)
- `src/types/pulls.ts` — `GamePull {id, gameId, itemId, unitId|null, name, rarity|null, ts, category}` + `PullMapItem {name: string|null, rarity, kind, unit}`, `ParsedPulls {game, pulls, warnings, pulledUnitIds}`, `PULL_GAMES`
- `scripts/build-pull-maps.mjs` → `src/data/{hsr,genshin,zzz,wuwa}-pull-map.json` (`{itemId: {unit, rarity, name}}`; WuWa `{normalized name: {unit, rarity, kind}}`; `name` may be `null` — ZZZ `54014`)
- `src/lib/pullImport.ts` — `normalizeName` (lowercase, NFKC, `&`→"and", strip non-`[\p{L}\p{N}]`, matches build-pull-maps), `detectPullSource(data, game?)` (wuwatracker | stardb; optional game hint picks that game's section in multi-game exports, else first found in `PULL_GAMES` order), `parseWuwaPulls`, `parseStardbPulls` (first uid only, per-category buckets, `seq` = raw array index for stardb-parity ordering), `parsePullFile(data, maps, game?)`; names/rarity/unit resolved **at import time** and stored on each pull (snapshot of history); unknown ids → warning list (never throw)
- `src/lib/pullOrder.ts` — `comparePullOrder(a, b)`: ts ascending → same-category `seq` when both present → id; used by import `finalize`, `sortPulls`, pity walks and PullsPage sorts (reproduces stardb export order: 0 cross-timestamp inversions in every bucket)
- `src/lib/pity.ts` — pure: `computeRarityStats(pulls, rarity, cap)` → `{rarity, cap, total, hits, avgPity, maxPity, currentPity, histogram}` (pity resets on `rarity >= target`; null rarity counts but never resets; histogram index = pity length, cap-indexed); `pityByDrop(pulls, rarity)` → `Map<pullId, pity>` (same per-category walk in `comparePullOrder` order, records only `rarity >= target` drops — agrees with the histogram); `pityTone(pity, cap)` → `early|mid|late|hard` (≤1/3, ≤2/3, ≤90%, ≥90%/cap); `fiftyFiftyResult(game, pull, index, guaranteed?)` → `win|loss|guarantee|null` and `fiftyFiftyResults(game, pulls, index)` → `Map<pullId, win|loss|guarantee>` (per-category pending Set: off-banner sets, next featured consumes as guarantee; 5★ only, rate-up categories hsr character/light_cone, genshin character/weapon, zzz character/w_engine, wuwa pools 1/2 → resonator windows; featured name match = normalized bidirectional substring); `BannerWindow` carries `featured5`/`featuredWeapons` name lists copied by `toBannerWindow`; `maxPityFor`/`MAX_PITY`/`FOUR_STAR_PITY=10`; banner attribution `toBannerWindows`/`indexWindows`/`findBannerWindow`/`attributePull` (`CATEGORY_BANNER_TYPES` map, overlap → latest start, null dates skipped)
- `src/lib/pullStorage.ts` — localStorage `pulls:{game}` holding `GamePull[]` as JSON (sorted by `comparePullOrder`), merge-by-id dedupe (`mergePulls` → `{added,upgraded,total,ok}`, upgrades seq-less pulls when re-importing), subscribe/snapshot/serverSnapshot/notify pattern mirrors `unitStorage.ts`; ~14.7k pulls ≈ 300–500KB
- Pull ids: `${ts}|${category}|${itemKey}|${occ}` where `occ` = 0-based occurrence of that tuple (order-independent, re-import-safe; GI `id` fields are non-unique, HSR/ZZZ ids collide across same-second records); WuWa itemKey = `normalizeName(name)`, stardb itemKey = `item_id`
- Owned merge: `fillOwnedUnits(game, unitIds)` in `unitStorage.ts` — fill-only-unset, returns filled count; called on import and on v3 backup restore (`ImportExport`)
- Banner attribution: pull `category` + timestamp → `*-banners.json` window passed as `BannerWindow[]` prop from each server route page (keeps full banner JSON out of client bundles); unattributed → category/pool label only
- `src/components/PullsPage.tsx` — stat cards (total, 5★ count, avg/max/current pity, banners), category pills, pity histogram (per category, index = pity length), per-category pity table on "All", **5★ drops (pity)** table (Date/Name/Banner/Pity, newest first, latest 20 + overflow note; pity from full history so search/category filtering never changes it) + `Pity N` badge on 5★ rows, **List/Grid toggle** (grid = `PullGrid`, 5★ only: portrait tiles from `getUnitRows` image map, pity chip colored by `pityTone`, `data-fifty`/`data-tone` attrs, 50/50 border, hover name, legend; grid hides rows + drops table), pull rows (date, name, rarity, attributed banner) reverse-chron paginated (100 + 500 "Show more"), search, empty state
- `src/components/ImportPulls.tsx` — file input → `parsePullFile` → preview (new/total/units/warnings) → confirm → `mergePulls` + `fillOwnedUnits` + notify; quota errors surfaced
- `src/components/PullsEmptyPage.tsx` — shared empty state for FGO (`/pulls`), HI3, Shadowverse
- `src/app/{genshin,hsr,zzz,wuwa}/pulls/page.tsx` server components (`metadata.title = {absolute}`, `windows={toBannerWindows(get<Banner>s())}`); `src/app/{hi3,shadowverse}/pulls/page.tsx` + `src/app/pulls/page.tsx` empty; `GameTabs` 4th "Pulls" pill on all games; FGO header gains "Pulls" link
- `ImportExport` backup **v3** `{version:3, unitStatus, faves, pulls}` (`PULL_GAMES` only); v1/v2 still importable

### Features
- [x] **wuwa-weapons-roster**: `scripts/scrape-wuwa-units.mjs` now also scrapes Game8 `archives/452490` → 113 weapons appended (asserts ≥100), `type: "resonator"|"weapon"` on all entries (`wuwa-units.json` 59→172); `WUWA_TAXONOMY` Type group (Resonator/Weapon), units rows/noun updated, faves pool excludes weapons
- [x] **pull-maps**: `scripts/build-pull-maps.mjs` → 4 pull-map JSONs (79KB; offline rarity + unit bridge; 0 unresolved for HSR/GI/ZZZ, 88/88 WuWa names)
- [x] **pull-types-storage**: `src/types/pulls.ts` + `src/lib/pullStorage.ts`
- [x] **pull-import-pity**: `src/lib/pullImport.ts` + `src/lib/pity.ts` (pure, testable)
- [x] **owned-fill**: `fillOwnedUnits` (fill-only-unset) on import + ImportExport v3 restore
- [x] **pulls-pages-ui**: GameTabs 4th pill, `PullsPage`, `ImportPulls`, `PullsEmptyPage`, 7 static routes (4 full + 3 empty), WuWa Type filter + noun, faves exclude weapons
- [x] **pulls-tests**: new suites `pullImport`, `pity`, `pullStorage`, `PullsPage` (incl. import flow) + updates (unitsData 172, unitFilters wuwa groups, unitStorage fill tests)
- [x] **per-5star-pity**: `pityByDrop` (per-category drop→pity map) + PullsPage drops table & 5★ row badges; tests for map/histogram agreement + isolation
- [x] **five-star-grid**: List/Grid toggle, `PullGrid` (5★ only, thumbnails + pity chip + 50/50 border), `pityTone` + `fiftyFiftyResult` in `pity.ts` (featured lists on `BannerWindow`) — 338 tests total

### Completion Checklist
- [x] gates: tsc/eslint/`npm test` (327/327)/`npm run build` (31 pages, all `/{game}/pulls` routes) clean
- [x] commit + push (`5817fde` feat, `98c16cf` docs → main), `npx vercel --prod` → https://fgo-banner-tracker.vercel.app (alias ready)
- [x] live QA green: **qa-pulls 75/75** (new: routes/titles/4-tabs/empty states/import flow/category pity/re-import dedupe/auto-owned on units), **qa-units 168/168** (wuwa 172 + noun + 4 tabs), **qa-filters 140/140** (wuwa Type group added), **qa-faves 174/174** (wuwa pool skips weapons), **qa-backup 21/21** (v3 export incl. `pulls`, v3 restore, legacy v1) — zero console/page errors
- [x] CONTEXT update (state.md + buckets.md + decisions.md + structure.md + project.md)
- [x] `npm prune` (no extraneous packages; 8 pre-existing audit advisories untouched)
- [x] agent-files block: `AGENTS.md` unmodified by this work — nothing to commit
- [x] follow-up (2026-10-04): per-5★ drop pity — `cbdef13` feat (4 files) pushed + deployed; gates tsc/eslint/331 tests/build green; live QA **qa-pity 19/19** (pity values, per-banner isolation, search invariance, no-5★ hidden, zero console errors) + regressions qa-pulls 75/75, qa-units 168/168, qa-filters 140/140, qa-faves 174/174, qa-backup 21/21
- [x] follow-up (2026-10-04): 5★ grid view — `978f769` feat (4 files) pushed + deployed; gates tsc/eslint/338 tests/build green; live QA **qa-pity 40/40** (grid tiles/pity chips/thumbnail imgs, tone + 50/50 attrs, live win on real featured banner + loss + neutral, pill filtering, toggle round-trip) + regressions qa-pulls 75/75, qa-units 168/168, qa-filters 140/140, qa-faves 174/174, qa-backup 21/21
- [x] follow-up (2026-10-04): stardb-parity order + Guarantee + square grid — `ecdba38` feat (11 files: `pullOrder.ts` new) pushed + deployed; gates tsc/eslint/346 tests/build green; **80/80 exact vs stardb site** (64 character/15 standard/1 chronicled through shipped parse→order→pity path); live QA **qa-pity 41/41** (new legend text, guarantee-after-loss expectation) + regressions qa-pulls 75/75, qa-units 168/168, qa-filters 140/140, qa-faves 174/174, qa-backup 21/21
- [x] follow-up (2026-10-04): multi-game export import — `b00f440` feat (3 files) pushed + deployed; game-aware `detectPullSource`/`parsePullFile` hint (multi-game stardb exports importable on any pulls page); gates tsc/eslint/350 tests/build green; live QA **qa-multi 3/3** (real export: genshin 4,550 / hsr 3,742 / zzz 3,465)

---

## Backlog
- [x] **manual-pull-entries**: full editor (add + edit/delete pull entries) on `/{game}/pulls` — scope chosen 2026-10-04, design captured in `CONTEXT/state.md` § Remaining Work (datetime-local with seconds, category select, pull-map combobox with unknown-item fallback, live pity preview, shared `${ts}|${category}|${itemId}|${occ}` id scheme for re-import dedupe, `manual: true` flag, fillOwnedUnits on save, edit = delete + re-add, warn when deleting export-derived rows)
- [x] follow-up (2026-10-04): manual pull-entry editor built — `7f12b3a` feat (10 files: `ManualPullForm.tsx` + `lib/pullMaps.ts` new) pushed + deployed; Add Entry form (datetime seconds, banner select via shared `CATEGORY_ORDER`, combobox + custom fallback, live pity preview), shared id scheme + `manual` flag, **atomic in-place edit** (improvement over the delete-then-readd design), row Edit/Delete with export-row warning; gates tsc/eslint/362 tests/build green; live QA **qa-manual 37/37** + regressions qa-pity 41/41, qa-pulls 75/75, qa-backup 21/21
