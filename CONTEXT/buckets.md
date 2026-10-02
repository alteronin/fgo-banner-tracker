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
