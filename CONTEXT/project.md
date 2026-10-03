# Multi-Game Gacha Banner Tracker

## Vision
A web application that helps gacha game players track their pulls and plan their spending across summoning banners — FGO JP, Genshin Impact, Honkai: Star Rail, Zenless Zone Zero, Wuthering Waves, Honkai Impact 3rd, and Shadowverse: Worlds Beyond.

## Target Users
- FGO JP server players
- Genshin Impact / Honkai: Star Rail / Zenless Zone Zero / Wuthering Waves / Honkai Impact 3rd players planning pity and pulls
- Shadowverse: Worlds Beyond players tracking set/collab leader exchanges
- Global players using JP/earlier regions as reference for future planning
- Players who want to track owned/planning status across all banners

## Problem Solved
- Currently, players manually track which banners contain units they want
- No centralized tool to see owned/planning status across all banners across multiple games
- Hard to plan currency spending without visual indicators

## Tech Stack
- **Frontend**: Next.js 16.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: localStorage + React Context (hydration-safe via useSyncExternalStore)
- **Testing**: Vitest + Testing Library (327 tests)
- **Hosting**: Vercel (free tier)

## Key Features
### Built
1. Browse all 742 FGO JP summoning banners (2017-2026)
2. Toggle unit status (owned/planning/none), import/export collection
3. Filter banners by status, year, search, sort, advanced filters
4. Servant collection page with 487 servants + thumbnails
5. Grand servant lineup (9 slots, localStorage persistence)
6. Dark/light mode, keyboard navigation, image fallback, SEO meta
7. Multi-game app switcher; all 7 games have static tracker routes (unknown slugs 404)
8. Genshin Impact tracker at `/genshin` (216 banners: character/weapon/chronicled)
9. Honkai: Star Rail tracker at `/hsr` (131 banners: character/light cone, TBA collab ends)
10. Bucket 10 trackers: `/zzz` (134 agent/W-Engine), `/wuwa` (46 resonator/selector + weapons), `/hi3` (73 GLB versions, ongoing current version), `/shadowverse` (9 permanent sets + collab, official pack art)
11. Bucket 12: per-game Units rosters at `/{game}/units` (795 units: genshin 127, hsr 263, zzz 60, wuwa 172, hi3 110, shadowverse 63) + Faves lineups at `/{game}/faves` (9 slots) + Banners/Units/Faves tab nav on all games
12. Multi-game backup: Export/Import v3 (`{version, unitStatus, faves, pulls}` covering FGO + all games; legacy v1/v2 files still import)
13. Bucket 13: taxonomy pill filters on `/servants` + `/{game}/units` — multi-select Element/Weapon/Path/Type/Attribute/Specialty/Damage/Class groups, combinable with search/status, per-group All reset
14. Bucket 14: pull-history import at `/{game}/pulls` (wuwatracker + stardb exports, offline item maps, fill-only-unset owned merge) with 5★/4★ pity stats, cap-indexed pity histogram, banner attribution, per-category pity tables, per-5★ drop pity (`Pity N` badge + 5★ drops table), and a List/Grid toggle where the grid shows 5★ drops as square ~76px thumbnail tiles (pity-colored number + win/guarantee/loss border); pull order matches stardb exactly (`comparePullOrder`: ts → export-array `seq` → id) (FGO/HI3/SV show an empty state)

### Roadmap (Buckets 11-14 — all addressed)
11. Events tab: unified events feed (now/upcoming/past) across games — **deferred by user**
12. Cross-game Units & Faves — **COMPLETE (2026-10-03)**
13. Class/element button filters — **COMPLETE (2026-10-04)**
14. Pull-history import + pity — **COMPLETE (2026-10-04)** (deployed, live QA green; follow-ups `cbdef13` per-5★ drop pity, `978f769` 5★ grid view with 50/50 borders, `ecdba38` stardb-parity order + Guarantee state + square tiles, qa-pity 41/41)

All 14 buckets shipped; Bucket 11 (events tab) is the only deferred item.

## Data Sources
- FGO banner data: GamePress FGO Wiki (https://grandorder.gamepress.gg/summon-banner-list)
- FGO servant data: GamePress sitemap + individual pages
- Genshin / HSR / ZZZ / WuWa banner data: Game8 archives (cheerio scrapers, static JSON)
- HI3 banner data: Honkai Impact 3rd fandom MediaWiki API (`Category:Versions` + version pages)
- Shadowverse WB data: official cards site (set schedules + researched leader maps)
- Unit rosters: Game8 roster API (`tool_structural_mappings/{id}.json` via widget props) for genshin/hsr/zzz/wuwa (+ Game8 weapons page `archives/452490` for WuWa weapons); fandom API + `Module:Battlesuit/data` for HI3; `Leader/Worlds Beyond` wikitext galleries for Shadowverse
- Pull history: user exports (`wuwatracker-pulls.json`, `stardb-export.json`) parsed in-browser; rarity/unit bridges baked at build time into `src/data/{game}-pull-map.json` (stardb/GO/yatta/Genshin-DB + WuWa roster — no runtime API calls)
- Images: static.mana.wiki (FGO), img.game8.co (Game8 games), static.wikia.nocookie.net (HI3/SV, served `unoptimized`), shadowverse-wb.com pack art (SV banners)

## Testing
- 346 unit tests covering data integrity, helpers, storage, contexts, hooks, components (incl. taxonomy filter groups + multi-select semantics, pull import/pity, per-5★ drop pity + 50/50/guarantee scoring, canonical pull order, pulls page grid view)
- Playwright QA scripts (local + production), run ad-hoc (not committed deps)

## Future Expansion
- Cloud sync with user accounts
- E2E browser tests (Playwright/Cypress)
- Push notifications for upcoming banners/events
