# Project Structure

```
fgo-banner-tracker/
├── CONTEXT/
│   ├── state.md              # Master state file
│   ├── project.md            # Project overview
│   ├── buckets.md            # MVP milestone bucket plan
│   ├── structure.md          # This file
│   ├── decisions.md          # Architectural decisions
│   ├── skills/               # Extracted reusable skills
│   │   ├── scrape-remix-app.md
│   │   ├── create-filter-sort-page.md
│   │   ├── image-fallback-pattern.md
│   │   ├── vitest-setup.md
│   │   └── banner-data-model.md
│   └── prompts/
│       ├── tech-specific.md  # Tech-specific replication prompt
│       └── abstracted.md     # Abstracted replication prompt
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with providers, SEO, pre-paint theme script
│   │   ├── page.tsx          # Main page with banner list
│   │   ├── loading.tsx       # Route-level loading skeleton
│   │   ├── globals.css       # Global styles + light:/dark: custom variants
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts    # OAuth redirect start (state cookie, safeNextPath)
│   │   │   │   ├── callback/route.ts # code exchange → session cookie, email_verified gate
│   │   │   │   ├── logout/route.ts   # clear session cookie
│   │   │   │   └── me/route.ts       # session probe (null when signed out)
│   │   │   └── sync/route.ts         # GET/PUT sync blob (413 >4MB, 502 Redis down vs null missing)
│   │   ├── [game]/
│   │   │   └── page.tsx      # Dynamic route: empty generateStaticParams (all slugs own pages; unknown 404)
│   │   ├── genshin/
│   │   │   ├── page.tsx      # Genshin tracker (static, metadata + GenshinTracker)
│   │   │   ├── units/page.tsx   # Genshin units roster (static, UnitsPage)
│   │   │   ├── faves/page.tsx   # Genshin favorites (static, FavesPage)
│   │   │   └── pulls/page.tsx   # Genshin pull import + pity (static, PullsPage + banner windows)
│   │   ├── hsr/
│   │   │   ├── page.tsx      # HSR tracker (static, metadata + HsrTracker)
│   │   │   ├── units/page.tsx   # HSR units roster (chars + light cones)
│   │   │   ├── faves/page.tsx   # HSR favorites
│   │   │   └── pulls/page.tsx   # HSR pull import + pity
│   │   ├── zzz/
│   │   │   ├── page.tsx      # ZZZ tracker (static, metadata + ZzzTracker)
│   │   │   ├── units/page.tsx   # ZZZ agents roster
│   │   │   ├── faves/page.tsx   # ZZZ favorites
│   │   │   └── pulls/page.tsx   # ZZZ pull import + pity
│   │   ├── wuwa/
│   │   │   ├── page.tsx      # WuWa tracker (static, metadata + WuwaTracker)
│   │   │   ├── units/page.tsx   # WuWa resonators + weapons roster
│   │   │   ├── faves/page.tsx   # WuWa favorites
│   │   │   └── pulls/page.tsx   # WuWa pull import + pity
│   │   ├── hi3/
│   │   │   ├── page.tsx      # HI3 tracker (static, metadata + Hi3Tracker)
│   │   │   ├── units/page.tsx   # HI3 battlesuits roster
│   │   │   ├── faves/page.tsx   # HI3 favorites
│   │   │   └── pulls/page.tsx   # HI3 empty pulls state (no export format)
│   │   ├── shadowverse/
│   │   │   ├── page.tsx      # Shadowverse WB tracker (static, metadata + SvwbTracker)
│   │   │   ├── units/page.tsx   # Shadowverse leaders roster
│   │   │   ├── faves/page.tsx   # Shadowverse favorites
│   │   │   └── pulls/page.tsx   # Shadowverse empty pulls state
│   │   ├── pulls/
│   │   │   └── page.tsx      # FGO empty pulls state (Banners link back to /)
│   │   ├── servants/
│   │   │   └── page.tsx      # Servants summary page
│   │   └── grands/
│   │       └── page.tsx      # Grand servant lineup page (9 slots)
│   ├── components/
│   │   ├── AboutHelp.tsx     # About/help modal
│   │   ├── AccountButton.tsx # Google sign-in / avatar dropdown / sync state (14 header sites)
│   │   ├── AdvancedSearch.tsx # Advanced search panel
│   │   ├── AppSwitcher.tsx   # Multi-game dropdown switcher
│   │   ├── BannerCard.tsx    # Banner card component
│   │   ├── BannerDetail.tsx  # Banner detail modal
│   │   ├── BannerIndicators.tsx  # Owned/planning indicators
│   │   ├── BannerList.tsx    # Banner list with filtering
│   │   ├── CollectionStats.tsx # Collection statistics
│   │   ├── ComingSoonApp.tsx # Placeholder app shell
│   │   ├── FilterBar.tsx     # Filter bar component
│   │   ├── FavesPage.tsx     # Per-game 9-slot favorites page (owned pool, move-on-reassign)
│   │   ├── GameTabs.tsx      # Banners/Units/Faves/Pulls pill nav (aria-current)
│   │   ├── GenshinBannerCard.tsx  # Genshin banner card
│   │   ├── GenshinBannerDetail.tsx # Genshin detail modal
│   │   ├── GenshinRateUpChip.tsx # Interactive rate-up chip (owned/planning cycles, future planning-only, inert gaps; aliased as RateUpChip everywhere)
│   │   ├── GenshinTracker.tsx # Genshin page (filters + grid + modal)
│   │   ├── GenshinTypeFilter.tsx # Character/Weapon/Chronicle pills
│   │   ├── Hi3BannerCard.tsx  # HI3 version card (Battlesuit badge, no phase)
│   │   ├── Hi3BannerDetail.tsx # HI3 detail modal (Debut Battlesuits, Ongoing end, Fandom source)
│   │   ├── Hi3Tracker.tsx     # HI3 page (search + year, no type filter)
│   │   ├── HsrBannerCard.tsx   # HSR banner card
│   │   ├── HsrBannerDetail.tsx # HSR detail modal
│   │   ├── HsrTracker.tsx     # HSR page (filters + grid + modal)
│   │   ├── HsrTypeFilter.tsx  # Character/Light Cone pills
│   │   ├── ImageWithFallback.tsx # Image with error fallback; empty src → fallback UI, wikia → unoptimized
│   │   ├── ImportExport.tsx  # JSON import/export (v3 backup incl. `pulls`, legacy v1/v2 accepted)
│   │   ├── ImportPulls.tsx   # Pull-history file import (detect format → preview → merge + owned fill)
│   │   ├── LogPullDialog.tsx # Log-a-pull dialog (date/time, 50/50 outcome, standard-unit picker on loss)
│   │   ├── ManualPullForm.tsx # Manual pull entry form (datetime/combobox/custom fallback, validation + chip swatches, pity preview, atomic save/edit)
│   │   ├── PullsPage.tsx     # Pull stats (imported-only + Manual card), histogram, pills, drops table, List/Grid (5★ + ✱ manual tiles), Add Entry + row Edit/Delete
│   │   ├── PullsEmptyPage.tsx # Empty pulls shell for FGO/HI3/SV
│   │   ├── RateUpIndicator.tsx # Rate-up type badges
│   │   ├── SearchBar.tsx     # Search bar component (optional placeholder)
│   │   ├── ServantChip.tsx   # Servant status chip
│   │   ├── Skeleton.tsx      # Loading skeletons
│   │   ├── SortBar.tsx       # Sort dropdown
│   │   ├── SvwbBannerCard.tsx # Shadowverse set/collab card (Permanent range, no version overlay)
│   │   ├── SvwbBannerDetail.tsx # Shadowverse detail (Exchange/Collab Leaders, Official Site source)
│   │   ├── SvwbTracker.tsx    # Shadowverse page (filters + grid + modal)
│   │   ├── SvwbTypeFilter.tsx # Card Set/Collab pills
│   │   ├── ThemeToggle.tsx   # Dark/light mode toggle
│   │   ├── UnitsPage.tsx     # Per-game unit roster page (stats/search/filters/sort/toggle)
│   │   ├── WuwaBannerCard.tsx # WuWa resonator/selector card (nullable dates)
│   │   ├── WuwaBannerDetail.tsx # WuWa detail (Featured Weapons section, Not listed dates)
│   │   ├── WuwaTracker.tsx    # WuWa page (filters + grid + modal)
│   │   ├── WuwaTypeFilter.tsx # Resonator/Selector pills
│   │   ├── YearFilter.tsx    # Year filter dropdown
│   │   ├── ZzzBannerCard.tsx  # ZZZ agent/W-Engine card
│   │   ├── ZzzBannerDetail.tsx # ZZZ detail (type-aware no-featured note)
│   │   ├── ZzzTracker.tsx     # ZZZ page (filters + grid + modal)
│   │   └── ZzzTypeFilter.tsx  # Agent/W-Engine pills
│   ├── contexts/
│   │   ├── AccountContext.tsx # Session + cloud-sync orchestration (bootstrap decision, debounced push, notices)
│   │   ├── ServantContext.tsx # Servant status context (storage-owned listener registry, notifyServantStatusesChange)
│   │   ├── ThemeContext.tsx   # Theme context
│   │   └── UnitContext.tsx    # Per-game unit status context (UnitProvider game + roster props, resolveName)
│   ├── data/
│   │   ├── banners.json      # Banner data (742 banners)
│   │   ├── genshin-banners.json # Genshin banner data (216 banners, Game8)
│   │   ├── hsr-banners.json    # HSR banner data (131 banners, Game8)
│   │   ├── zzz-banners.json    # ZZZ banner data (134, Game8)
│   │   ├── wuwa-banners.json   # WuWa banner data (46, Game8)
│   │   ├── hi3-banners.json    # HI3 version banner data (73, fandom)
│   │   ├── shadowverse-banners.json # Shadowverse set/collab data (10, official site)
│   │   ├── genshin-units.json # Genshin roster (200 = 127 chars + 73 5★ weapons, Game8 API + archives/304647)
│   │   ├── hsr-units.json     # HSR roster (263 = 93 chars + 170 light cones)
│   │   ├── zzz-units.json     # ZZZ roster (60 agents)
│   │   ├── wuwa-units.json    # WuWa roster (172 = 59 resonators + 113 weapons, `type` field)
│   │   ├── hi3-units.json     # HI3 roster (110 battlesuits, Module:Battlesuit/data)
│   │   ├── shadowverse-units.json # SV leaders (63, Leader/Worlds Beyond galleries)
│   │   ├── hsr-pull-map.json  # item_id → {unit, rarity, name} for HSR import (offline)
│   │   ├── genshin-pull-map.json # item_id → {unit, rarity, name} for GI import
│   │   ├── zzz-pull-map.json  # item_id → {unit, rarity, name} for ZZZ import
│   │   ├── wuwa-pull-map.json # normalized name → {unit, rarity, kind} for WuWa import
│   │   └── servants.json     # Servant data (487 servants)
│   ├── hooks/
│   │   ├── useBannerFilter.ts # Banner filtering hook
│   │   └── useKeyboardNavigation.ts # Keyboard navigation hook
│   ├── lib/
│   │   ├── apps.ts           # Multi-game app registry (7 apps)
│   │   ├── data.ts           # Data access utilities
│   │   ├── genshin-data.ts   # Genshin data access + date helpers
│   │   ├── hsr-data.ts       # HSR data access + date helpers (nullable end)
│   │   ├── zzz-data.ts       # ZZZ data access (TBA end → inactive)
│   │   ├── wuwa-data.ts      # WuWa data access (nullable dates, weapons)
│   │   ├── hi3-data.ts       # HI3 data access (null end → ongoing)
│   │   ├── shadowverse-data.ts # SV data access (latest-set active rule)
│   │   ├── storage.ts        # localStorage utilities (FGO)
│   │   ├── unitAliases.ts    # Per-game banner-name alias map (ZZZ: Jane Doe → Jane, etc.)
│   │   ├── unitStorage.ts    # Per-game unit-status/faves localStorage + fillOwnedUnits (fill-only-unset)
│   │   ├── unitResolve.ts    # normalizeUnitName, buildUnitIndex/resolveUnitName (exact → normalized → alias), syntheticStatusKey (`name:` prefix)
│   │   ├── pullStorage.ts    # `pulls:{game}` GamePull[] storage (merge/dedupe, deletePull, subscribe/snapshot/notify)
│   │   ├── pullImport.ts     # wuwatracker/stardb detection + parsing → GamePull[] + warnings; CATEGORY_ORDER, buildManualPull
│   │   ├── pullMaps.ts       # Shared PULL_MAPS (pull-map JSON per game) for ImportPulls + ManualPullForm
│   │   ├── pullOrder.ts      # comparePullOrder (ts → seq → id): stardb-parity pull order
│   │   ├── pity.ts           # computeRarityStats, pityByDrop, pityTone, fiftyFiftyResult/Results, banner windows
│   │   ├── logPull.ts        # log-pull gates: checkLoggable, STANDARD_POOLS, hasPullInBanner, findMapItemByName, buildLoggedPull
│   │   ├── backupData.ts     # sync blob: snapshot / union (local-wins) / fingerprint (djb2) / replace-apply + decideSyncAction
│   │   ├── syncDirty.ts      # 2s-debounced cloud push wired into all 5 storage notifiers
│   │   ├── server/
│   │   │   ├── session.ts    # jose HS256 JWT cookie `fbtn-session` + OAuth state cookie (timing-safe, raw-first parse)
│   │   │   ├── google.ts     # Google code exchange, email_verified gate, avatar/name fetch
│   │   │   └── store.ts      # Upstash Redis `fbtn:user|sync:{sub}` (4MB cap, throw=502 vs null=missing)
│   │   └── units.ts          # Unit roster loaders, UnitRow mapping, UnitsConfig, UNIT_GAMES, taxonomy specs
│   ├── types/
│   │   ├── banner.ts         # TypeScript types
│   │   ├── pulls.ts          # GamePull, PullMap, ParsedPulls, PULL_GAMES
│   │   ├── genshin.ts        # Genshin TypeScript types
│   │   ├── hsr.ts            # HSR TypeScript types (nullable version/end)
│   │   ├── zzz.ts            # ZZZ types (agent/wengine)
│   │   ├── wuwa.ts           # WuWa types (nullable dates, featuredWeapons)
│   │   ├── hi3.ts            # HI3 types (nullable endDate)
│   │   ├── shadowverse.ts    # SV types (set/collab)
│   │   └── units.ts          # Unit roster types (UnitStatus, UnitGame, UnitRow, per-game units)
│   └── __tests__/
│       ├── setup.ts          # Test setup (jest-dom + RTL cleanup)
│       ├── data.test.ts      # Data utility tests
│       ├── storage.test.ts   # Storage tests
│       ├── ServantContext.test.tsx # Context tests
│       ├── ThemeContext.test.tsx # Theme toggle tests
│       ├── AboutHelp.test.tsx # Help modal tests (Escape close)
│       ├── AppSwitcher.test.tsx # App switcher tests
│       ├── genshinData.test.ts # Genshin data integrity tests (21)
│       ├── hsrData.test.ts   # HSR data integrity tests (23)
│       ├── zzzData.test.ts   # ZZZ data integrity tests (21)
│       ├── wuwaData.test.ts  # WuWa data integrity tests (20)
│       ├── hi3Data.test.ts   # HI3 data integrity tests (23)
│       ├── shadowverseData.test.ts # SV data integrity tests (17)
│       ├── unitsData.test.ts # Unit roster integrity tests (counts, ids, hsr split, SV skip)
│       ├── unitStorage.test.ts # Per-game storage tests (keys, isolation, snapshots, fillOwnedUnits)
│       ├── pullStorage.test.ts # Pull storage tests (merge/dedupe/snapshots/notify, deletePull)
│       ├── pullImport.test.ts # Export detection, fixtures, dedupe ids, warnings, unit bridge, buildManualPull
│       ├── pity.test.ts   # Rarity stats, histogram, pityByDrop (seq order), pityTone, fiftyFifty/guarantee, attribution
│       ├── PullsPage.test.tsx # Pulls page: pity display, grid view + win/guarantee/loss borders, stardb import, manual entry add/edit/delete + v2 (stats purity, oldest rule, chip colors)
│       ├── UnitContext.test.tsx # Unit context tests (toggle cycle, persistence, notify)
│       ├── GenshinRateUpChip.test.tsx # Chip cycles (past/future/unresolved), stopPropagation, persistence
│       ├── unitResolve.test.ts # Name resolution (exact/normalized/alias/game-scoped, synthetic keys)
│       ├── useBannerFilter.test.tsx # Filter hook + URL state tests
│       ├── logPull.test.ts   # Log-pull gates (checkLoggable, STANDARD_POOLS, findMapItemByName, hasPullInBanner, buildLoggedPull)
│       ├── LogPullDialog.test.tsx # Dialog flows (outcome, standard picker, save/skip, dupe occ bump)
│       ├── backupData.test.ts # Sync snapshot/union/fingerprint/decideSyncAction
│       ├── serverSession.test.ts # JWT sign/verify/expiry, state cookie round-trip, safeNextPath
│       ├── googleOAuth.test.ts # Authorization URL, code exchange, email_verified rejection
│       ├── authRoutes.test.ts # login/callback/logout/me/sync route handlers (401/403/413/502 paths)
│       ├── AccountButton.test.tsx # Sign-in button, dropdown, sync states, notice display
│       └── AccountProvider.test.tsx # Bootstrap decision, debounced push, retrySync, notice consumption
├── scripts/
│   ├── scrape-all.mjs        # Banner scraper (cheerio)
│   ├── scrape-genshin.mjs    # Genshin banner scraper (Game8, cheerio)
│   ├── scrape-hsr.mjs        # HSR banner scraper (Game8, cheerio; repairs apostrophe-truncated featured alts via lc- ids)
│   ├── scrape-zzz.mjs        # ZZZ banner scraper (Game8 two-column table)
│   ├── scrape-wuwa.mjs       # WuWa banner scraper (Game8 detail-text zones)
│   ├── scrape-hi3.mjs        # HI3 version scraper (fandom MediaWiki API; FEATURED_JUNK + dedupe)
│   ├── scrape-shadowverse.mjs # Shadowverse set/collab scraper (official site)
│   ├── scrape-servants.mjs   # Servant scraper (sitemap + pages)
│   ├── lib/game8-roster.mjs  # Shared Game8 roster API helper (widget props → collectionItems)
│   ├── scrape-genshin-units.mjs # Genshin roster (Game8 API 127 chars + archives/304647 5★ weapons →200)
│   ├── scrape-hsr-units.mjs  # HSR roster (Game8 API chars + LC SSR table →263)
│   ├── scrape-zzz-units.mjs  # ZZZ roster (Game8 API →60)
│   ├── scrape-wuwa-units.mjs # WuWa roster (Game8 API resonators + weapons page →172)
│   ├── scrape-hi3-units.mjs  # HI3 roster (fandom API + Module:Battlesuit/data →110)
│   ├── scrape-shadowverse-units.mjs # SV leaders (wikitext galleries →63)
│   ├── build-pull-maps.mjs   # Pull import maps (stardb/yatta/GO + wuwa roster → 4 JSONs)
│   └── extract-banners.mjs   # Banner list extraction (dedupes servants)
├── public/                   # Static assets
├── .env.local                # GOOGLE_CLIENT_ID/SECRET, SESSION_SECRET, UPSTASH_REDIS_REST_URL/TOKEN (gitignored)
├── vitest.config.ts          # Vitest configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── next.config.ts            # Next.js config
└── tailwind.config.ts        # Tailwind config
```

## Key Files
- `src/data/banners.json` - 742 banners scraped from GamePress (2017-2026)
- `src/data/genshin-banners.json` - 216 Genshin banners scraped from Game8 (1.0-7.0)
- `src/data/hsr-banners.json` - 131 HSR banners scraped from Game8 (1.0-4.7)
- `src/data/zzz-banners.json` - 134 ZZZ banners scraped from Game8 (1.0-3.2)
- `src/data/wuwa-banners.json` - 46 WuWa banners scraped from Game8 (1.0-3.7, nullable selector dates)
- `src/data/hi3-banners.json` - 73 HI3 GLB versions from fandom (v1.8-v9.0, null end = ongoing)
- `src/data/shadowverse-banners.json` - 10 Shadowverse WB entries (9 permanent sets + Frieren collab)
- `src/data/servants.json` - 487 servants with thumbnail icons
- `src/data/{game}-units.json` - 868 unit roster entries (genshin 200, hsr 263, zzz 60, wuwa 172, hi3 110, shadowverse 63)
- `src/data/{game}-pull-map.json` - offline rarity/unit bridges for pull import (hsr/genshin/zzz by item id, wuwa by normalized name)
- `src/lib/apps.ts` - Multi-game app registry (7 apps, slugs, paths)
- `src/contexts/ServantContext.tsx` - Global servant status management
- `src/contexts/UnitContext.tsx` - Per-game unit status (UnitProvider `game` + optional `roster` props, `resolveName` for banner chips)
- `src/contexts/ThemeContext.tsx` - Dark/light mode management
- `src/lib/storage.ts` - localStorage persistence (FGO keys)
- `src/lib/unitStorage.ts` - Per-game `unit-status:{game}` / `faves:{game}` persistence + `fillOwnedUnits` (fill-only-unset)
- `src/lib/unitResolve.ts` - Roster name resolution for banner chips: exact → normalized → per-game alias; `syntheticStatusKey` for unresolved future names
- `src/lib/unitAliases.ts` - ZZZ banner-name aliases (Jane Doe → Jane, Astra Yao → Astra, Orphie → Orphie and Magus, Soldier 0 - Anby → Soldier 0 Anby)
- `src/lib/pullStorage.ts` - `pulls:{game}` GamePull[] persistence (merge-by-id dedupe, `deletePull`, subscribe/snapshot/notify)
- `src/lib/pullImport.ts` - wuwatracker/stardb detection + parsing into `GamePull[]` with warnings; exported `CATEGORY_ORDER` + `buildManualPull` (shared id scheme, `manual: true`, optional `chipColor`)
- `src/lib/pullMaps.ts` - Shared `PULL_MAPS` pull-map JSON loaders (ImportPulls + ManualPullForm)
- `src/lib/pullOrder.ts` - `comparePullOrder(a, b)` (ts ascending → same-category `seq` when both known → id) used by import finalize, storage sort, pity walks and PullsPage sorts
- `src/lib/pity.ts` - `computeRarityStats` (5★/4★ pity + histogram), `pityByDrop`, `pityTone` (color bucket), `fiftyFiftyResult`/`fiftyFiftyResults` (win/loss/guarantee vs featured), `validateManualPull` (oldest-position + sequence checks: future/not-oldest/pity caps/consecutive-loss), banner windows + attribution
- `src/lib/units.ts` - Unit roster access + UnitRow/UnitsConfig mapping
- `src/lib/data.ts` - Data access (banners, servants, helpers)
- `src/components/BannerCard.tsx` - Main banner display component
- `src/components/GenshinRateUpChip.tsx` - Interactive unit chip on all 6 games' banner cards + detail modals (resolved names cycle owned/planning, future banners planning-only, unresolved future = `name:` synthetic key, unresolved past = inert span; `e.stopPropagation()`)
- `src/components/UnitsPage.tsx` - Per-game units roster page
- `src/components/FavesPage.tsx` - Per-game 9-slot favorites page
- `src/components/GameTabs.tsx` - Banners/Units/Faves/Pulls pill navigation
- `src/components/PullsPage.tsx` - Pull history: stat cards over **imported pulls only** + 5th Manual card, pity histogram, category pills, drops table, List/Grid toggle with square ~76px 5★ tiles (thumbnail + pity chip + win/guarantee/loss border; manual tiles = user chip color + ✱, `data-manual`), `N pulls imported · M manual` subtitle, Add Entry wiring + row Edit/Delete (two-step confirm, export-row re-import warning; manual rows show ✱ badge instead of pity)
- `src/components/ImportPulls.tsx` - Pull-history import (detect format → preview → merge + owned fill)
- `src/components/ManualPullForm.tsx` - Manual pull entry form (datetime-local seconds, banner select, searchable map combobox + custom name/3-4-5★ fallback, live pity preview; `validateManualPull` gating with issue message/disabled submit/date hint, 8-swatch `CHIP_COLORS` + `safeChipColor`; atomic `setPulls` save/edit, quota error display)
- `src/app/{game}/pulls/page.tsx` - Static pull routes (4 full pages + 3 empty states incl. `/pulls`)
- `src/components/ImageWithFallback.tsx` - Image with loading skeleton + error fallback; empty src → fallback UI (no request); optimization globally disabled via `next.config.ts` `images.unoptimized: true` (Vercel optimizer quota 402)
- `src/hooks/useBannerFilter.ts` - Filtering, search, and sorting logic (URL state via useSyncExternalStore)
- `src/app/servants/page.tsx` - Servants summary page
- `src/app/grands/page.tsx` - Grand servant lineup page
- `src/app/api/auth/{login,callback,logout,me}/route.ts` + `src/app/api/sync/route.ts` - Auth + sync API routes (see tree above)
- `src/lib/server/{session,google,store}.ts` - JWT session cookies, Google code exchange, Upstash Redis blobs
- `src/lib/backupData.ts` - Sync blob semantics: snapshot, local-wins union, djb2 fingerprint, `decideSyncAction` (noop/push/adopt/merge/initial-push)
- `src/lib/syncDirty.ts` - 2s-debounced push registered by all 5 storage notifiers
- `src/lib/logPull.ts` - Log-pull gates + `STANDARD_POOLS` + `buildLoggedPull` (manual pull with `fifty` stamp)
- `src/contexts/AccountContext.tsx` - Session fetch → bootstrap sync decision → debounced push; `signIn/signOut/retrySync`; notice consumption
- `src/components/AccountButton.tsx` - Header account UI (Google sign-in button, avatar dropdown, sync state + Retry) at all 14 ThemeToggle sites
- `src/components/LogPullDialog.tsx` - Log-a-pull dialog launched from rate-up chips (9 `logContext` sites)
- `src/components/GenshinRateUpChip.tsx` - Interactive unit chip on all 6 games' banner cards + detail modals (resolved names cycle owned/planning, future banners planning-only, unresolved future = `name:` synthetic key, unresolved past = inert span; `e.stopPropagation()`; on loggable started banners click opens LogPullDialog with pendingStatus; `hasPullInBanner` checkmark)
