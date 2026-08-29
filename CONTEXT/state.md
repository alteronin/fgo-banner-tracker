---
project_name: FGO JP Banner Tracker
status: complete
current_bucket: 5
current_feature: servants-page
current_phase: complete
buckets_completed: 5
total_buckets: 5
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
features_remaining: []
issues_found:
  - broken-image-urls-2017-2018
issues_resolved:
  - broken-image-urls-2017-2018
tech_stack:
  framework: Next.js 16.3.3
  language: TypeScript
  styling: Tailwind CSS
  state: localStorage + React Context
  hosting: Vercel
  testing: Vitest + Testing Library
deploy_provider: vercel
deploy_url: https://fgo-banner-tracker.vercel.app
last_checkpoint: 2026-08-30
context_version: 2
---

# Project State

## Active Context
All 5 buckets complete. Deployed to Vercel with 742 banners (2017-2026) and 487 servants with thumbnails.

## Features Built
- Bucket 1: Core MVP (banner list, servant toggle, indicators, filter, detail, responsive)
- Bucket 2: Enhanced UX (search, dark/light mode, import/export, rate-up indicators, collection stats, URL filtering)
- Bucket 3: Advanced (sort options, advanced search, keyboard navigation)
- Bucket 4: Polish (loading skeletons, SEO meta, about/help)
- Bucket 5: Post-Launch (year filter, full scraper re-scrape, image fallback, servants page, unit tests)

## Data
- 742 banners scraped from GamePress (2017-2026)
- 487 servants scraped with thumbnail icons, class info
- Bracket-encoding fix for 24 broken image URLs

## Deploy Info
- URL: https://fgo-banner-tracker.vercel.app
- GitHub: https://github.com/alteronin/fgo-banner-tracker
- Provider: Vercel (free tier)

## Recent Decisions
1. Used cheerio for server-side HTML scraping of GamePress
2. Encoded brackets in image URLs ([ → %5B, ] → %5D)
3. ImageWithFallback component for graceful degradation on broken images
4. Vitest for unit testing (39 tests passing)
5. Servant data from sitemap + individual page scraping (487 servants)
6. Servants page with status tracking, search, filter, sort

## Blockers
None.
