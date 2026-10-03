---
project_name: Multi-Game Gacha Banner Tracker
status: active
current_bucket: 13
current_feature: class-element-filters
current_phase: planning
buckets_completed: 12
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
  - cross-game-units
  - cross-game-faves
features_remaining:
  - events-tab
  - class-element-filters
issues_found:
  - broken-image-urls-2017-2018
  - hydration-error-418
  - theme-toggle-no-visual-change
  - advanced-search-not-imported
  - empty-servant-class-names
  - mobile-horizontal-overflow
  - fandom-image-optimizer-403
  - shadowverse-banner-missing-images
issues_resolved:
  - broken-image-urls-2017-2018
  - hydration-error-418
  - theme-toggle-no-visual-change
  - advanced-search-not-imported
  - empty-servant-class-names
  - mobile-horizontal-overflow
  - fandom-image-optimizer-403
  - shadowverse-banner-missing-images
tech_stack:
  framework: Next.js 16.3.3
  language: TypeScript
  styling: Tailwind CSS
  state: localStorage + React Context (useSyncExternalStore)
  hosting: Vercel
  testing: Vitest + Testing Library (240 tests)
deploy_provider: vercel
deploy_url: https://fgo-banner-tracker.vercel.app
last_checkpoint: 2026-10-03
context_version: 10
---

# Project State

## Active Context
**Bucket 12 COMPLETE (deployed + live QA green).** All 6 tracked games now have Units + Faves pages: `/{game}/units` rosters (genshin 127, hsr 263 = 93 chars + 170 light cones, zzz 60, wuwa 59, hi3 110, shadowverse 63 = 782 units total) with owned/planning status tracking, and `/{game}/faves` 9-slot lineups (pool = owned only, move-on-reassign). GameTabs (Banners/Units/Faves) pill nav on all 6 trackers + new pages. Storage: `unit-status:{game}` / `faves:{game}` via useSyncExternalStore; ImportExport upgraded to v2 backup (`{version:2, unitStatus, faves}` → `collection-backup.json`, legacy v1 import still accepted). Gates: 240 tests, tsc/eslint/build clean (24 static routes). Committed `ef75305`, pushed, deployed to production. Live QA: qa-units 168/168, qa-faves 174/174, qa-backup 18/18; regressions qa-genshin 42 / qa-hsr 46 / qa-zzz 47 / qa-wuwa 51 / qa-hi3 44 / qa-shadowverse 47 / qa-switcher 24 all 0 fail; qa-live 74 pass (2 stale export assertions superseded by qa-backup 18/18); qa-sort 0 diffs, qa-theme/mobile exit 0. Bucket 11 (Events tab) deferred by user. Bucket 12 fully closed out (`npm prune` done). Next: Bucket 13 (class/element filters). QA scripts in `%TEMP%\opencode\qa-*.js` (BASE env for production, NODE_PATH to repo node_modules).

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
- Bucket 10: Remaining game trackers (Complete 2026-10-03 — `/zzz` 134 banners, `/wuwa` 46, `/hi3` 73, `/shadowverse` 10; committed `95771ca`, deployed, live QA green; follow-up `ce29b7f` added official pack art to Shadowverse banner cards)
- Bucket 12: Cross-game Units & Faves (Complete 2026-10-03 — 6 games × Units + Faves pages, GameTabs nav, per-game storage, ImportExport v2; 240 tests; committed `ef75305`, deployed, live QA green)

## Roadmap (Upcoming Buckets 11-13)
- Bucket 10: Remaining game trackers — **COMPLETE (2026-10-03)**: committed `95771ca`, deployed, live QA green; SV image fix `ce29b7f`
- Bucket 11: Events tab — **DEFERRED by user (2026-10-03)**; `/events` route + nav tab; unified event feed (now/upcoming/past) with game + year filters, sources TBD
- Bucket 12: Cross-game Units & Faves — **COMPLETE (2026-10-03)**: committed `ef75305`, deployed, live QA green (qa-units 168/168, qa-faves 174/174, qa-backup 18/18)
- Bucket 13: Class/element button filters — pill-button multi-select filter groups on the servants/units tab (FGO classes, Genshin elements, HSR elements/paths, etc.); roster taxonomy fields already scraped in Bucket 12, UI + FGO servants data check remain

## Data
- 742 banners scraped from GamePress (2017-2026)
- 487 servants scraped with thumbnail icons; all classes populated (incl. 23 Avenger, 14 Beast)
- 216 Genshin banners scraped from Game8 (versions 1.0-7.0: 105 character, 104 weapon, 7 chronicled)
- 131 HSR banners scraped from Game8 (versions 1.0-4.7: 66 character, 65 light cone; 4 Fate-collab entries with null version/end)
- 134 ZZZ banners scraped from Game8 (versions 1.0-3.2: 67 agent, 67 W-Engine; 8 without phase; 2 "Exclusive Rescreening" agent entries intentionally have no featured list)
- 46 WuWa banners scraped from Game8 (versions 1.0-3.7: 45 resonator + 1 Special Reverbs selector with null dates; 1.5-1.9 skipped by game)
- 73 HI3 GLB versions scraped from fandom `Category:Versions` (v1.8 2018-03-22 → v9.0 2026-08-20, endDate null = ongoing; v1.0-1.7 do not exist; 7 early versions lack debut data; v1.8 has no image)
- 10 Shadowverse WB banner entries (9 card sets permanent + Frieren collab 2025-12-29 → 2026-01-27); official pack art added in `ce29b7f` (per-set `slide_*.webp` + collab ogp; `shadowverse-wb.com` + `collaboration.shadowverse-wb.com` in remotePatterns)
- 782 unit roster entries for Units/Faves pages: genshin 127, hsr 263 (93 characters + 170 light cones), zzz 60, wuwa 59, hi3 110 (battlesuits from Module:Battlesuit/data), shadowverse 63 leaders (65 gallery entries − 2 broken-image Summer variants)
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
- `/{game}/units` — per-game unit roster (static ×6: genshin/hsr/zzz/wuwa/hi3/shadowverse)
- `/{game}/faves` — per-game 9-slot favorites lineup (static ×6)
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
18. Shadowverse banner images: official cards listing exposes per-set pack art (`slide_past.<hash>.webp`, latest `slide_3.wN4TIWUu.webp`); collab uses `collaboration.shadowverse-wb.com/.../ogp/ogp.png`; scraper validates every banner has an image (throws otherwise) — `ce29b7f`
19. Game8 roster API for unit pages: widget props `data-react-props` → `tool_structural_mappings/{id}.json?updatedAt=` with referer/origin headers → `collectionItems`; HSR light cones from SSR table instead (no widget); `lc-` id prefix
20. HI3 roster: `Module:Battlesuit/data` Lua table is the single source (per-page intro templates sparse for old suits); portrait filenames substitute `:` → ` -` (module's `gsub`)
21. SV leaders: one wikitext parse of `Leader/Worlds Beyond` galleries; entries with wiki-broken images skipped (count guards ≥60, ≤5 skips); duplicate names qualified via filename parens
22. Units/faves storage: `unit-status:{game}` + `faves:{game}` (FGO keys untouched), per-game subscribe/snapshot/notify; static `src/app/{game}/units|faves/page.tsx` routes; 9 fave slots for every game; pool = owned only; reassign moves unit between slots
23. ImportExport v2: `{version: 2, unitStatus: {fgo+6 games}, faves: {fgo grands + 6 games}}` as `collection-backup.json`; v1 flat FGO files still import

## Blockers
None.
