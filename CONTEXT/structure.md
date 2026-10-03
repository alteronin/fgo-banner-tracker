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
│   │   ├── [game]/
│   │   │   └── page.tsx      # Dynamic route: empty generateStaticParams (all slugs own pages; unknown 404)
│   │   ├── genshin/
│   │   │   ├── page.tsx      # Genshin tracker (static, metadata + GenshinTracker)
│   │   │   ├── units/page.tsx   # Genshin units roster (static, UnitsPage)
│   │   │   └── faves/page.tsx   # Genshin favorites (static, FavesPage)
│   │   ├── hsr/
│   │   │   ├── page.tsx      # HSR tracker (static, metadata + HsrTracker)
│   │   │   ├── units/page.tsx   # HSR units roster (chars + light cones)
│   │   │   └── faves/page.tsx   # HSR favorites
│   │   ├── zzz/
│   │   │   ├── page.tsx      # ZZZ tracker (static, metadata + ZzzTracker)
│   │   │   ├── units/page.tsx   # ZZZ agents roster
│   │   │   └── faves/page.tsx   # ZZZ favorites
│   │   ├── wuwa/
│   │   │   ├── page.tsx      # WuWa tracker (static, metadata + WuwaTracker)
│   │   │   ├── units/page.tsx   # WuWa resonators roster
│   │   │   └── faves/page.tsx   # WuWa favorites
│   │   ├── hi3/
│   │   │   ├── page.tsx      # HI3 tracker (static, metadata + Hi3Tracker)
│   │   │   ├── units/page.tsx   # HI3 battlesuits roster
│   │   │   └── faves/page.tsx   # HI3 favorites
│   │   ├── shadowverse/
│   │   │   ├── page.tsx      # Shadowverse WB tracker (static, metadata + SvwbTracker)
│   │   │   ├── units/page.tsx   # Shadowverse leaders roster
│   │   │   └── faves/page.tsx   # Shadowverse favorites
│   │   ├── servants/
│   │   │   └── page.tsx      # Servants summary page
│   │   └── grands/
│   │       └── page.tsx      # Grand servant lineup page (9 slots)
│   ├── components/
│   │   ├── AboutHelp.tsx     # About/help modal
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
│   │   ├── GameTabs.tsx      # Banners/Units/Faves pill nav (aria-current)
│   │   ├── GenshinBannerCard.tsx  # Genshin banner card
│   │   ├── GenshinBannerDetail.tsx # Genshin detail modal
│   │   ├── GenshinRateUpChip.tsx # Genshin rate-up chip (link mode; aliased as RateUpChip everywhere)
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
│   │   ├── ImportExport.tsx  # JSON import/export (v2 multi-game backup, legacy v1 accepted)
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
│   │   ├── ServantContext.tsx # Servant status context
│   │   ├── ThemeContext.tsx   # Theme context
│   │   └── UnitContext.tsx    # Per-game unit status context (UnitProvider game prop)
│   ├── data/
│   │   ├── banners.json      # Banner data (742 banners)
│   │   ├── genshin-banners.json # Genshin banner data (216 banners, Game8)
│   │   ├── hsr-banners.json    # HSR banner data (131 banners, Game8)
│   │   ├── zzz-banners.json    # ZZZ banner data (134, Game8)
│   │   ├── wuwa-banners.json   # WuWa banner data (46, Game8)
│   │   ├── hi3-banners.json    # HI3 version banner data (73, fandom)
│   │   ├── shadowverse-banners.json # Shadowverse set/collab data (10, official site)
│   │   ├── genshin-units.json # Genshin roster (127, Game8 API)
│   │   ├── hsr-units.json     # HSR roster (263 = 93 chars + 170 light cones)
│   │   ├── zzz-units.json     # ZZZ roster (60 agents)
│   │   ├── wuwa-units.json    # WuWa roster (59)
│   │   ├── hi3-units.json     # HI3 roster (110 battlesuits, Module:Battlesuit/data)
│   │   ├── shadowverse-units.json # SV leaders (63, Leader/Worlds Beyond galleries)
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
│   │   ├── unitStorage.ts    # Per-game unit-status/faves localStorage (subscribe/snapshot/notify per game)
│   │   └── units.ts          # Unit roster loaders, UnitRow mapping, UnitsConfig, UNIT_GAMES
│   ├── types/
│   │   ├── banner.ts         # TypeScript types
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
│       ├── unitStorage.test.ts # Per-game storage tests (keys, isolation, snapshots)
│       ├── UnitContext.test.tsx # Unit context tests (toggle cycle, persistence, notify)
│       └── useBannerFilter.test.tsx # Filter hook + URL state tests
├── scripts/
│   ├── scrape-all.mjs        # Banner scraper (cheerio)
│   ├── scrape-genshin.mjs    # Genshin banner scraper (Game8, cheerio)
│   ├── scrape-hsr.mjs        # HSR banner scraper (Game8, cheerio)
│   ├── scrape-zzz.mjs        # ZZZ banner scraper (Game8 two-column table)
│   ├── scrape-wuwa.mjs       # WuWa banner scraper (Game8 detail-text zones)
│   ├── scrape-hi3.mjs        # HI3 version scraper (fandom MediaWiki API)
│   ├── scrape-shadowverse.mjs # Shadowverse set/collab scraper (official site)
│   ├── scrape-servants.mjs   # Servant scraper (sitemap + pages)
│   ├── lib/game8-roster.mjs  # Shared Game8 roster API helper (widget props → collectionItems)
│   ├── scrape-genshin-units.mjs # Genshin roster (Game8 API →127)
│   ├── scrape-hsr-units.mjs  # HSR roster (Game8 API chars + LC SSR table →263)
│   ├── scrape-zzz-units.mjs  # ZZZ roster (Game8 API →60)
│   ├── scrape-wuwa-units.mjs # WuWa roster (Game8 API →59)
│   ├── scrape-hi3-units.mjs  # HI3 roster (fandom API + Module:Battlesuit/data →110)
│   ├── scrape-shadowverse-units.mjs # SV leaders (wikitext galleries →63)
│   └── extract-banners.mjs   # Banner list extraction (dedupes servants)
├── public/                   # Static assets
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
- `src/data/{game}-units.json` - 782 unit roster entries (genshin 127, hsr 263, zzz 60, wuwa 59, hi3 110, shadowverse 63)
- `src/lib/apps.ts` - Multi-game app registry (7 apps, slugs, paths)
- `src/contexts/ServantContext.tsx` - Global servant status management
- `src/contexts/UnitContext.tsx` - Per-game unit status (UnitProvider game prop)
- `src/contexts/ThemeContext.tsx` - Dark/light mode management
- `src/lib/storage.ts` - localStorage persistence (FGO keys)
- `src/lib/unitStorage.ts` - Per-game `unit-status:{game}` / `faves:{game}` persistence
- `src/lib/units.ts` - Unit roster access + UnitRow/UnitsConfig mapping
- `src/lib/data.ts` - Data access (banners, servants, helpers)
- `src/components/BannerCard.tsx` - Main banner display component
- `src/components/UnitsPage.tsx` - Per-game units roster page
- `src/components/FavesPage.tsx` - Per-game 9-slot favorites page
- `src/components/GameTabs.tsx` - Banners/Units/Faves pill navigation
- `src/components/ImageWithFallback.tsx` - Image with loading skeleton + error fallback; empty src → fallback UI (no request), `static.wikia.nocookie.net` → `unoptimized` (Fandom 403s optimizer fetches)
- `src/hooks/useBannerFilter.ts` - Filtering, search, and sorting logic (URL state via useSyncExternalStore)
- `src/app/servants/page.tsx` - Servants summary page
- `src/app/grands/page.tsx` - Grand servant lineup page
