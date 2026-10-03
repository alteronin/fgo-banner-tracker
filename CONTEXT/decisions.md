# Architectural Decisions

## 1. Tech Stack Choice
**Decision**: Next.js with App Router + TypeScript + Tailwind CSS
**Reasoning**: 
- Free hosting on Vercel
- SSR/SSG support for SEO
- TypeScript for type safety
- Tailwind for rapid UI development

## 2. State Management
**Decision**: localStorage + React Context
**Reasoning**:
- No backend needed for MVP
- Instant persistence without network calls
- Easy to migrate to backend later if needed

## 3. Data Storage
**Decision**: Static JSON files (banners.json + servants.json)
**Reasoning**:
- Banner data changes infrequently
- Servant data is stable between game updates
- No need for real-time updates
- Scrapers regenerate data on demand

## 4. Image Handling
**Decision**: next/image with ImageWithFallback wrapper
**Reasoning**:
- Automatic image optimization via Vercel CDN
- Lazy loading by default
- Graceful degradation when external images break
- External URLs from static.mana.wiki (no self-hosting overhead)

## 5. Component Architecture
**Decision**: Client components with Context
**Reasoning**:
- Servant status requires interactivity
- Context provides global state access
- Components are self-contained and reusable

## 6. Modal vs Page for Detail View
**Decision**: Modal overlay for banner details, separate page for servants
**Reasoning**:
- Banner details are quick views — modal keeps user in context
- Servants page is a dedicated browsing experience — separate route makes sense

## 7. Filtering Strategy
**Decision**: Client-side filtering with useMemo
**Reasoning**:
- 742 banners and 487 servants are small enough for client-side
- No API calls needed
- Instant filter response

## 8. Image Fallback Strategy
**Decision**: ImageWithFallback component with error handler
**Reasoning**:
- External images from mana.wiki may break (as seen with bracket issue)
- Better UX to show placeholder than broken image icon
- Chosen over self-hosting to avoid repo bloat (~80MB of images)

## 9. Data Scraping Approach
**Decision**: Cheerio-based HTML scraping for banners, sitemap + page scraping for servants
**Reasoning**:
- GamePress is a Remix app with client-side rendering — no public API
- Cheerio parses server-rendered HTML reliably
- Sitemap provides complete servant URL list (487 entries)
- Individual page fetches extract icon URLs from og:image meta tags

## 10. Testing Framework
**Decision**: Vitest + Testing Library
**Reasoning**:
- Fast test execution (Vite-based)
- Compatible with Next.js and TypeScript
- Testing Library provides realistic component testing
- 54 tests covering data, storage, contexts, hooks, and modals

## 11. Hydration-Safe Client State
**Decision**: Expose all localStorage-backed state via `useSyncExternalStore` with a raw-string-keyed module cache
**Reasoning**:
- `useState(() => localStorage...)` initializers mismatch the server HTML and trigger React #418 hydration errors (server renders `{}`/`0`, client renders stored data)
- `getServerSnapshot` guarantees the first client render matches the server; React swaps to `getSnapshot` after hydration — the sanctioned pattern (no error)
- Comparing the raw storage string auto-invalidates the cache when anything writes to localStorage (even outside the store), while returning a stable object reference avoids re-render loops
- Same pattern used for servant statuses, theme, URL search params, and grands selections

## 12. Light Mode Styling
**Decision**: Tailwind v4 `@custom-variant light` bound to `.light` class + `dark` class on `<html>`, with a pre-paint inline script in `<head>`
**Reasoning**:
- Tailwind v4 no longer generates a `light:` variant by default (`light:` was silently producing zero CSS)
- `prefers-color-scheme` media queries can't be overridden by a user toggle
- The inline script applies the stored theme before first paint (no flash of wrong theme) and only touches class attributes, so `suppressHydrationWarning` on `<html>` covers it
- ThemeContext reads/writes the DOM classes via `useSyncExternalStore` — single source of truth is the DOM

## 13. Multi-Game Routing
**Decision**: App registry (`src/lib/apps.ts`) + AppSwitcher dropdown; static routes override a `[game]` dynamic route with `dynamicParams=false`
**Reasoning**:
- One registry feeds the switcher, metadata, and static-params generation — no drift between UI and routes
- `dynamicParams=false` is required: without it unknown slugs (`/banana`) render the page with HTTP 200, breaking 404 semantics
- Static routes (like `/genshin`) always win over the dynamic `[game]` route; `generateStaticParams` excludes every slugged app so the param list only ever contains future placeholder apps (currently none — all 7 apps have static pages)
- `getActiveAppId(pathname)` derives the current app from the URL segment — no context needed

## 14. Genshin Data Scraping (Game8)
**Decision**: One-off cheerio scraper `scripts/scrape-genshin.mjs` over Game8's SSR banner tables with strict output validation
**Reasoning**:
- Game8 renders three table shapes (character `version|banner|rate-up`, chronicled `version|banner|date`, weapon `version|banners|information`) distinguished by header text; version cells use `th[rowspan=2]` spanning two phase rows
- Featured-unit names live only in `img.alt` (`Genshin - X Image`) — anchors can have no text; featured lists can be nested inside `div.align` so extraction walks `b, a[href]` in document order, not top-level siblings
- Dates are parsed with an explicit month map to ISO strings — `new Date()` round-trips shift a day across timezones; source has year typos (`2206`, start year 1 behind) clamped by rule (end−start > 1y → same year; cross-year span > 60d → start = end year)
- Validation throws before writing: missing images, bad ranges, spans > 60d — plus test-suite locks on counts, uniqueness, and absolute URLs

## 15. HSR Data Scraping (Game8)
**Decision**: Cheerio scraper over Game8 HSR "Banner History" tables with section-header parsing and nullable end dates
**Reasoning**:
- Tables are grouped by version with in-table header rows (`HSR X.Y Phase Z Banner History`) that set version/phase for subsequent rows; special sections (`Fate Collaboration`) leave version/phase null
- Each phase section holds paired data rows � odd row = character warps, even row = light cone warps � so type is classified by row parity (upcoming sections may have only the character row; collab sections stack multiple rounds)
- Dates often omit the start year (`May. 17 - Jun. 07, 2023`) � start year derived from month order; `TBA` ends map to `endDate: string | null` (never active, displayed as "TBA")
- Fate-collab sections repeat across many version tables � content-key dedupe (`type|version|phase|dates|names`) before id assignment
- Featured 5?/4? lists are phase-row level (shared by the character and light-cone rows get their own); imageless featured anchors (path/element links like "Elation") are dropped � only portrait-bearing entries are real rate-ups

## 16. ZZZ Data Scraping (Game8 paired columns)
**Decision**: Cheerio scraper over Game8's two-column agent/W-Engine banner table with `th` version inheritance
**Reasoning**:
- Every data row holds two independent banners (c0 agent, c1 W-Engine) — one pass emits two entries; version comes from block-start `th` cells, continuation rows inherit the last seen version
- Cell text is freeform (`Name Banner MM/DD - MM/DD/YYYY (Phase N)`) with missing years/spaces/phases — parsed by pattern, never via `Date` round-trip
- "Exclusive Rescreening" agent entries have no featured list by design — kept as banners with a type-aware no-featured note instead of failing validation

## 17. WuWa Data Scraping (detail-text parsing)
**Decision**: Parse the free-text `Banner Details` cell per phase row for WuWa
**Reasoning**:
- The details cell encodes everything: `Phase N Start: ... End: ... Limited 5★ ... Rate-up 4★ ... Featured Weapon(s): ...`
- Produces `featured5`, `featured4`, and `featuredWeapons[]` from one structured regex walk; Special Reverbs selector has no dates → nullable `startDate`/`endDate` ("No dates listed"), and active state requires both dates
- Versions come from preceding h2/h3 headings, not table content

## 18. HI3 Data Scraping (Fandom MediaWiki API)
**Decision**: Fandom `api.php` with batched `action=query&prop=revisions` instead of HTML fetches
**Reasoning**:
- Raw HTML requests to `*.fandom.com` hit Cloudflare challenges; the MediaWiki API with a UA header works reliably
- Version pages carry either `{{Version Entry}}` or the older `{{Version Infobox}}` template — union parse with fallback; `endDate` = next version's start (null = ongoing)
- Debut battlesuits extracted only from summary lines matching /debut/i — avoids false positives from unrelated version text

## 19. Shadowverse Banner Data (official cards page)
**Decision**: Official cards listing drives the set list; leaders from an embedded SETS map that fails loudly
**Reasoning**:
- The official site is the only source with dates; 9 sets are permanent (endDate null) and only the latest set by `startDate` is ACTIVE (collabs are windowed)
- Pack images (`slide_*.webp`) and collab ogp added in a follow-up — scraper now throws if any banner lacks an image
- `next.config.ts` remotePatterns: official hosts added alongside wikia/game8/mana domains

## 20. Fandom Image Handling
**Decision**: `ImageWithFallback` renders `unoptimized` for `static.wikia.nocookie.net` and skips empty srcs entirely
**Reasoning**:
- Fandom's CDN 403s the Next optimizer's referer-less upstream fetch but serves browsers with a Referer — bypassing the optimizer fixes display without self-hosting
- Empty `src` must never fire a request (SV had imageless data initially) — fallback renders directly

## 21. Unit Roster Sources (Bucket 12)
**Decision**: Game8 roster API for genshin/hsr/zzz/wuwa; Fandom API for HI3/SV
**Reasoning**:
- Game8 roster pages embed `#react-collection_browser-wrapper[data-react-props]` → `toolStructuralMapping {id, updatedAt}`; `GET game8.co/api/tool_structural_mappings/{id}.json?updatedAt=` with `referer` + `origin` headers returns typed `collectionItems` (403 without them) — shared helper `scripts/lib/game8-roster.mjs`
- HSR light cones have no roster widget → SSR table on `archives/406599` (`Light Cone|Rarity|Path` heads); ids prefixed `lc-` so they can never collide with character ids
- HI3: `Module:Battlesuit/data` Lua table holds character/rank/type/weapon for all 110 suits (per-page intro templates are empty for old suits); portraits are `File:{name with ":" → " -"} (Thumbnail).png` (matches the module's own `gsub`)
- SV: single parse of `Leader/Worlds Beyond` wikitext galleries → 65 entries; entries whose files don't exist on the wiki (Summer Eudie/Lilanthim — the wiki itself renders them broken) are skipped with guards (≤5 skips, ≥60 units); duplicate names qualified from filename parens
- All scrapers validate before writing: unique ids/names, https images, taxonomy fields present, count floors

## 22. Per-Game Unit/Fave Storage and Routes (Bucket 12)
**Decision**: Generic `unit-status:{game}` / `faves:{game}` localStorage keys + static `src/app/{game}/units|faves/page.tsx` routes
**Reasoning**:
- FGO keeps its existing keys (`fgo-servant-status`, `fgo-grand-servants`) — no migration for existing users; other games use namespaced generic keys
- Storage layer (`src/lib/unitStorage.ts`) mirrors `storage.ts`: raw-string-keyed per-game caches with `subscribe/getSnapshot/serverSnapshot/notify` — hydration-safe via `useSyncExternalStore`, isolated per game
- Static per-game route files follow the tracker convention and leave the `[game]` dynamic segment untouched; shared client `UnitsPage`/`FavesPage` components take the `game` slug
- `UnitProvider({game})` makes status context game-scoped; both new pages wrap their views in it

## 23. Faves Model (Bucket 12)
**Decision**: 9 slots for every game; pool = owned units only; selecting a unit already slotted elsewhere moves it
**Reasoning**:
- FGO's slots are taxonomy-constrained (7 classes + 2 Extra groups); other games have no such structure — fixed 9 generic `Favorite N` slots keep the model simple and consistent
- Restricting the pool to `owned` gives faves a purpose (line up your collection) and mirrors grands' owned-only candidates
- Move semantics prevent the same unit occupying two slots (grands couldn't collide because candidates were disjoint)

## 24. Per-Game Tab Navigation (Bucket 12)
**Decision**: `GameTabs` pill nav (Banners / Units / Faves) in every tracker + units/faves header; FGO nav unchanged
**Reasoning**:
- Pills mirror the existing FGO header links and `FilterButton` styling; active tab = white pill + `aria-current="page"`
- FGO keeps `/servants` + `/grands` links (bucket 13 may unify, but no migration now); Events tab joins GameTabs when bucket 11 lands

## 25. Import/Export v2 Backup Format (Bucket 12)
**Decision**: `{version: 2, unitStatus: {fgo, genshin, ...}, faves: {fgo(grands), ...}}` → `collection-backup.json`; legacy v1 flat FGO files still import
**Reasoning**:
- A versioned envelope lets the import distinguish the multi-game payload from the original flat `{slug: status}` FGO file without ambiguity
- Export reads all stores directly (works even when no UnitProvider is mounted); import notifies every affected store so mounted contexts re-render
- Validation keeps only `owned`/`planning` entries; invalid JSON alerts, unknown keys are ignored
## 26. Taxonomy Pill Filter Groups (Bucket 13)
**Decision**: Per-game `TaxonomySpec` (key, label, canonical order, value getter) in `src/lib/units.ts` builds both `UnitRow.filters` and `UnitsConfig.filterGroups`; pure `matchesFilterGroups(filters, selected)` shared by UnitsPage and `/servants`
**Reasoning**:
- One spec per game is the single source of truth for label/order/values � group values are the distinct data values sorted canonically (unknown values last, alphabetical), so the UI auto-adapts if a roster gains a new element/path/class
- Multi-select OR within a group, AND across groups and with status/search matches the buckets.md spec and user ask ("toggling anemo shows only anemo units"); empty group = unfiltered with an explicit active "All" pill
- Null taxon (HSR light cones omit the `element` key entirely � getter coerces `?? null`) never matches a selection, so light cones drop out of element filters by design
- `/servants` reuses the same helper with `{class: s.className}` + existing `CLASS_ORDER` instead of a second filter implementation; no URL state or persistence (local component state, consistent with existing type filters)
- QA lesson: WuWa weapon value is `Pistol` (singular); FGO names use `Altria` not `Artoria`
