---
project_name: FGO JP Banner Tracker
status: active
current_bucket: 7
current_feature: qa-remediation
current_phase: complete
buckets_completed: 7
total_buckets: 7
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
  testing: Vitest + Testing Library (54 tests)
deploy_provider: vercel
deploy_url: https://fgo-banner-tracker.vercel.app
last_checkpoint: 2026-10-03
context_version: 4
---

# Project State

## Active Context
All 7 buckets complete. Live QA (Playwright) passes 76/76 checks with zero page/console errors. Deployed to Vercel with 742 banners (2017-2026), 487 servants (all with class data), and grand servant lineup page.

## Features Built
- Bucket 1: Core MVP (banner list, servant toggle, indicators, filter, detail, responsive)
- Bucket 2: Enhanced UX (search, dark/light mode, import/export, rate-up indicators, collection stats, URL filtering)
- Bucket 3: Advanced (sort options, advanced search, keyboard navigation)
- Bucket 4: Polish (loading skeletons, SEO meta, about/help)
- Bucket 5: Post-Launch (year filter, full scraper re-scrape, image fallback, servants page, unit tests)
- Bucket 6: Grand Servants (grand servant lineup page — 9 slots, click-to-select, localStorage persistence)
- Bucket 7: QA Remediation (hydration-safe external stores, live theme toggle, AdvancedSearch wiring, class data backfill, mobile overflow, 54 tests)

## Data
- 742 banners scraped from GamePress (2017-2026)
- 487 servants scraped with thumbnail icons; all classes populated (incl. 23 Avenger, 14 Beast)
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

## Recent Decisions
1. Used cheerio for server-side HTML scraping of GamePress
2. Encoded brackets in image URLs ([ → %5B, ] → %5D)
3. ImageWithFallback component for graceful degradation on broken images
4. Vitest for unit testing (54 tests passing)
5. Servant data from sitemap + individual page scraping (487 servants)
6. Servants page with status tracking, search, filter, sort
7. Grand servants: 9 slots (7 main + Extra I + Extra II), flexible Extra groups
8. All localStorage-backed state exposed via useSyncExternalStore with raw-string-keyed cache (hydration-safe, auto-invalidates on any storage change)
9. Tailwind v4 `@custom-variant light` + `.light`/`.dark` html classes + pre-paint inline script for theme (no FOUC, no #418)

## Blockers
None.
