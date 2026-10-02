---
project_name: Multi-Game Gacha Banner Tracker
status: active
current_bucket: 11
current_feature: events-tab
current_phase: planning
buckets_completed: 10
total_buckets: 13
features_completed:
  - seed-data
  - banner-list
  - servant-toggle
  - banner-indicators
  - filter-bar
  - banner-detail
  - responsive-pass
  - search
  - dark-light-mode
  - import-export
  - rate-up-indicators
  - collection-stats
  - url-filtering
  - sort-options
  - advanced-search
  - keyboard-navigation
  - loading-skeletons
  - seo-meta
  - about-help
  - year-filter
  - full-scraper
  - image-fallback
  - servants-page
  - unit-tests
  - grand-servants
  - qa-remediation
  - app-switcher
  - genshin-tracker
  - hsr-tracker
  - zzz-tracker
  - wuwa-tracker
  - hi3-tracker
  - shadowverse-tracker
features_remaining:
  - events-tab
  - cross-game-units
  - cross-game-faves
  - class-element-filters
issues_found:
  - broken-image-urls-2017-2018
  - hydration-error-418
  - theme-toggle-no-visual-change
  - advanced-search-not-imported
  - empty-servant-class-names
  - mobile-horizontal-overflow
  - fandom-image-optimizer-403
issues_resolved:
  - broken-image-urls-2017-2018
  - hydration-error-418
  - theme-toggle-no-visual-change
  - advanced-search-not-imported
  - empty-servant-class-names
  - mobile-horizontal-overflow
  - fandom-image-optimizer-403
tech_stack:
  framework: Next.js 16.3.3
  language: TypeScript
  styling: Tailwind CSS
  state: localStorage + React Context (useSyncExternalStore)
  hosting: Vercel
  testing: Vitest + Testing Library (185 tests)
deploy_provider: vercel
deploy_url: https://fgo-banner-tracker.vercel.app
last_checkpoint: 2026-10-03
context_version: 9
---

# Project State

## Active Context
**Bucket 10 COMPLETE — committed `95771ca`, pushed, deployed, live QA green.** All 7 games now have static trackers: FGO `/`, Genshin `/genshin` (216), HSR `/hsr` (131), ZZZ `/zzz` (134), WuWa `/wuwa` (46), HI3 `/hi3` (73), Shadowverse `/shadowverse` (10). Production QA (BASE=https://fgo-banner-tracker.vercel.app): qa-zzz 47/47, qa-wuwa 51/51, qa-hi3 44/44, qa-shadowverse 47/47, qa-switcher 24/24, qa-hsr 46/46, qa-genshin 42/42, qa-live 76/76, no console/page errors. Local gates: 185 unit tests, tsc/eslint/build clean. `npm prune` run (playwright removed until next cycle). Now planning Bucket 11 (Events tab) — see Roadmap. QA scripts live in `%TEMP%\opencode\qa-*.js` (BASE env for production, NODE_PATH to repo node_modules).

## Features Built
- Bucket 1: Core MVP (banner list, servant toggle, indicators, filter, detail, responsive)
- Bucket 2: Enhanced UX (search, dark/light mode, import/export, rate-up indicators, collection stats, URL filtering)
- Bucket 3: Advanced (sort options, advanced search, keyboard navigation)
- Bucket 4: Polish (loading skeletons, SEO meta, about/help)
- Bucket 5: Post-Launch (year filter, full scraper re-scrape, image fallback, servants page, unit tests)
- Bucket 6: Grand Servants (grand servant lineup page — 9 slots, click-to-select, localStorage persistence)
- Bucket 7: QA Remediation (hydration-safe external stores, live theme toggle, AdvancedSearch wiring, class data backfill, mobile overflow, 54 tests)
- Bucket 8: Multi-Game Expansion (app switcher dropdown on all routes + static `[game]` placeholder routes with `dynamicParams=false` 404s; Genshin Impact tracker at `/genshin` — 216 banners, type/year/search filters, detail modal with featured 5★/4★ chips)
- Bucket 9: HSR Tracker (static `/hsr` route — 131 banners from Game8: 66 character + 65 light cone warps, 32 versions 1.0-4.7, collab banners with nullable version/end, type/year/search filters)
- Bucket 10: Remaining game trackers (Complete 2026-10-03 — `/zzz` 134 banners, `/wuwa` 46, `/hi3` 73, `/shadowverse` 10; committed `95771ca`, deployed, live QA green)

## Roadmap (Upcoming Buckets 11-13)
- Bucket 10: Remaining game trackers — **COMPLETE (2026-10-03)**: committed `95771ca`, deployed, live QA green
- Bucket 11: Events tab — `/events` route + nav tab; unified event feed (now/upcoming/past) with game + year filters, sources TBD
- Bucket 12: Cross-game Units & Faves — per-game roster pages (analog of `/servants`) and favorites/lineup pages (analog of `/grands`), per-game status storage, per-game tab nav
- Bucket 13: Class/element button filters — pill-button multi-select filter groups on the servants/units tab (FGO classes, Genshin elements, HSR elements/paths), needs unit taxonomy data backfill

## Data
- 742 banners scraped from GamePress (2017-2026)
- 487 servants scraped with thumbnail icons; all classes populated (incl. 23 Avenger, 14 Beast)
- 216 Genshin banners scraped from Game8 (versions 1.0-7.0: 105 character, 104 weapon, 7 chronicled)
- 131 HSR banners scraped from Game8 (versions 1.0-4.7: 66 character, 65 light cone; 4 Fate-collab entries with null version/end)
- 134 ZZZ banners scraped from Game8 (versions 1.0-3.2: 67 agent, 67 W-Engine; 8 without phase; 2 "Exclusive Rescreening" agent entries intentionally have no featured list)
- 46 WuWa banners scraped from Game8 (versions 1.0-3.7: 45 resonator + 1 Special Reverbs selector with null dates; 1.5-1.9 skipped by game)
- 73 HI3 GLB versions scraped from fandom `Category:Versions` (v1.8 2018-03-22 → v9.0 2026-08-20, endDate null = ongoing; v1.0-1.7 do not exist; 7 early versions lack debut data; v1.8 has no image)
- 10 Shadowverse WB entries (9 card sets permanent + Frieren collab 2025-12-29 → 2026-01-27); no images in source (fallback placeholders render)
- Bracket-encoding fix for 24 broken image URLs
- Duplicate servant entries removed (3 daily banners); 6 banner names whitespace-normalized

## Deploy Info
- URL: https://fgo-banner-tracker.vercel.app
- GitHub: https://github.com/alteronin/fgo-banner-tracker
- Provider: Vercel (free tier)

## Routes
- `/` — Banner list (main page)
- `/servants` — Servant collection browser
- `/grands` — Grand servant lineup (9 slots)
- `/genshin` — Genshin Impact banner tracker (static)
- `/hsr` — Honkai: Star Rail banner tracker (static)
- `/zzz` — Zenless Zone Zero banner tracker (static)
- `/wuwa` — Wuthering Waves banner tracker (static)
- `/hi3` — Honkai Impact 3rd banner tracker (static)
- `/shadowverse` — Shadowverse: Worlds Beyond banner tracker (static)
- `/[game]` — dynamic route kept with empty `generateStaticParams` (all 7 slugs have own pages; unknown slugs 404 via `dynamicParams=false`; ComingSoonApp retained for future apps)

## Recent Decisions
1. Used cheerio for server-side HTML scraping of GamePress
2. Encoded brackets in image URLs ([ → %5B, ] → %5D)
3. ImageWithFallback component for graceful degradation on broken images
4. Vitest for unit testing (104 tests passing)
5. Servant data from sitemap + individual page scraping (487 servants)
6. Servants page with status tracking, search, filter, sort
7. Grand servants: 9 slots (7 main + Extra I + Extra II), flexible Extra groups
8. All localStorage-backed state exposed via useSyncExternalStore with raw-string-keyed cache (hydration-safe, auto-invalidates on any storage change)
9. Tailwind v4 `@custom-variant light` + `.light`/`.dark` html classes + pre-paint inline script for theme (no FOUC, no #418)
10. App registry `src/lib/apps.ts` + AppSwitcher dropdown + static `[game]` route with `dynamicParams=false` (unknown slugs must 404; static routes override the dynamic one)
11. Genshin data scraped from Game8 tables (SSR HTML): rowspan version tracking, featured names from `img.alt`, manual month-map date parsing (no Date round-trip), source year-typo clamps (2206, start-year-1), span≤60d validation, absolute URL normalization
12. HSR data: phase sections keyed by in-table header rows (version/phase), row parity for type classification (odd row = character, even = light cone), start-year derivation when month order crosses years, `endDate: string | null` for TBA collab banners, content-key dedupe for Fate-collab sections repeated across tables
13. ZZZ data: two-column table cells (agent | W-Engine) with version `th` inheritance; `GENERIC_AGENT_BANNERS` ("Exclusive Rescreening") keeps the banner entry but skips featured extraction; type-aware no-featured note in detail modal (W-Engine wording vs generic)
14. WuWa data: detail-text zone parsing of `Limited 5★ / Rate-up 4★ / Featured Weapon(s):` per phase row; `featuredWeapons[]` third section; nullable `startDate`/`endDate` ("No dates listed" / modal "Not listed"); active requires both dates
15. HI3 data: `Category:Versions` union (73 pages, batches of 40 via `action=query&prop=revisions`) with dual template support (`{{Version Entry}}` + `{{Version Infobox}}` fallback); `summaryFeatured` filters summary lines matching /debut/i; endDate = next version's start; null endDate = ongoing (active if started); no type filter on page; source label "on Fandom Wiki"
16. Shadowverse data: official cards page drives set list (embedded SETS map fails loudly on unknown set); active = window when `endDate` set, else only the latest set by `startDate` (collabs windowed); source label "on Official Site"; imageless data renders fallbacks with zero network requests
17. `ImageWithFallback`: renders fallback UI directly when `src` is empty (no request) and sets `unoptimized` for `static.wikia.nocookie.net` — Fandom CDN 403s the Next image optimizer's referer-less upstream fetch but serves browsers fine with a Referer header

## Blockers
None.
