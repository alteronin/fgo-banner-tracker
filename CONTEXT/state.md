---
project_name: FGO JP Banner Tracker
status: active
current_bucket: 9
current_feature: hsr-tracker
current_phase: complete
buckets_completed: 9
total_buckets: 9
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
features_remaining: []
issues_found:
  - broken-image-urls-2017-2018
  - hydration-error-418
  - theme-toggle-no-visual-change
  - advanced-search-not-imported
  - empty-servant-class-names
  - mobile-horizontal-overflow
issues_resolved:
  - broken-image-urls-2017-2018
  - hydration-error-418
  - theme-toggle-no-visual-change
  - advanced-search-not-imported
  - empty-servant-class-names
  - mobile-horizontal-overflow
tech_stack:
  framework: Next.js 16.3.3
  language: TypeScript
  styling: Tailwind CSS
  state: localStorage + React Context (useSyncExternalStore)
  hosting: Vercel
  testing: Vitest + Testing Library (104 tests)
deploy_provider: vercel
deploy_url: https://fgo-banner-tracker.vercel.app
last_checkpoint: 2026-10-03
context_version: 6
---

# Project State

## Active Context
All 9 buckets complete. Multi-game expansion: app switcher across all routes; Genshin tracker at `/genshin` (216 banners, Game8); Honkai: Star Rail tracker at `/hsr` (131 banners, Game8 — character + light cone warps, collab banners with TBA ends). Local QA passes: qa-hsr 46/46, qa-genshin 42/42, qa-switcher 24/24, qa-live 76/76, qa-mobile green, 104 unit tests.

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

## Data
- 742 banners scraped from GamePress (2017-2026)
- 487 servants scraped with thumbnail icons; all classes populated (incl. 23 Avenger, 14 Beast)
- 216 Genshin banners scraped from Game8 (versions 1.0-7.0: 105 character, 104 weapon, 7 chronicled)
- 131 HSR banners scraped from Game8 (versions 1.0-4.7: 66 character, 65 light cone; 4 Fate-collab entries with null version/end)
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
- `/hi3` `/zzz` `/wuwa` `/shadowverse` — coming-soon placeholders (static, via `[game]` dynamicParams=false)

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

## Blockers
None.
