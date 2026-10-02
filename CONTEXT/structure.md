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
│   │   │   └── page.tsx      # Placeholder routes (dynamicParams=false, 404s unknown)
│   │   ├── genshin/
│   │   │   └── page.tsx      # Genshin tracker (static, metadata + GenshinTracker)
│   │   ├── hsr/
│   │   │   └── page.tsx      # HSR tracker (static, metadata + HsrTracker)
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
│   │   ├── GenshinBannerCard.tsx  # Genshin banner card
│   │   ├── GenshinBannerDetail.tsx # Genshin detail modal
│   │   ├── GenshinRateUpChip.tsx # Genshin rate-up chip (link mode)
│   │   ├── GenshinTracker.tsx # Genshin page (filters + grid + modal)
│   │   ├── GenshinTypeFilter.tsx # Character/Weapon/Chronicled pills
│   │   ├── HsrBannerCard.tsx   # HSR banner card
│   │   ├── HsrBannerDetail.tsx # HSR detail modal
│   │   ├── HsrTracker.tsx     # HSR page (filters + grid + modal)
│   │   ├── HsrTypeFilter.tsx  # Character/Light Cone pills
│   │   ├── ImageWithFallback.tsx # Image with error fallback
│   │   ├── ImportExport.tsx  # JSON import/export
│   │   ├── RateUpIndicator.tsx # Rate-up type badges
│   │   ├── SearchBar.tsx     # Search bar component (optional placeholder)
│   │   ├── ServantChip.tsx   # Servant status chip
│   │   ├── Skeleton.tsx      # Loading skeletons
│   │   ├── SortBar.tsx       # Sort dropdown
│   │   ├── ThemeToggle.tsx   # Dark/light mode toggle
│   │   └── YearFilter.tsx    # Year filter dropdown
│   ├── contexts/
│   │   ├── ServantContext.tsx # Servant status context
│   │   └── ThemeContext.tsx   # Theme context
│   ├── data/
│   │   ├── banners.json      # Banner data (742 banners)
│   │   ├── genshin-banners.json # Genshin banner data (216 banners, Game8)
│   │   ├── hsr-banners.json    # HSR banner data (131 banners, Game8)
│   │   └── servants.json     # Servant data (487 servants)
│   ├── hooks/
│   │   ├── useBannerFilter.ts # Banner filtering hook
│   │   └── useKeyboardNavigation.ts # Keyboard navigation hook
│   ├── lib/
│   │   ├── apps.ts           # Multi-game app registry
│   │   ├── data.ts           # Data access utilities
│   │   ├── genshin-data.ts   # Genshin data access + date helpers
│   │   ├── hsr-data.ts       # HSR data access + date helpers (nullable end)
│   │   └── storage.ts        # localStorage utilities
│   ├── types/
│   │   ├── banner.ts         # TypeScript types
│   │   ├── genshin.ts        # Genshin TypeScript types
│   │   └── hsr.ts            # HSR TypeScript types (nullable version/end)
│   └── __tests__/
│       ├── setup.ts          # Test setup (jest-dom + RTL cleanup)
│       ├── data.test.ts      # Data utility tests
│       ├── storage.test.ts   # Storage tests
│       ├── ServantContext.test.tsx # Context tests
│       ├── ThemeContext.test.tsx # Theme toggle tests
│       ├── AboutHelp.test.tsx # Help modal tests (Escape close)
│       ├── AppSwitcher.test.tsx # App switcher tests
│       ├── genshinData.test.ts # Genshin data integrity tests
│       ├── hsrData.test.ts   # HSR data integrity tests
│       └── useBannerFilter.test.tsx # Filter hook + URL state tests
├── scripts/
│   ├── scrape-all.mjs        # Banner scraper (cheerio)
│   ├── scrape-genshin.mjs    # Genshin banner scraper (Game8, cheerio)
│   ├── scrape-hsr.mjs        # HSR banner scraper (Game8, cheerio)
│   ├── scrape-servants.mjs   # Servant scraper (sitemap + pages)
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
- `src/data/servants.json` - 487 servants with thumbnail icons
- `src/lib/apps.ts` - Multi-game app registry (7 apps, slugs, paths)
- `src/contexts/ServantContext.tsx` - Global servant status management
- `src/contexts/ThemeContext.tsx` - Dark/light mode management
- `src/lib/storage.ts` - localStorage persistence
- `src/lib/data.ts` - Data access (banners, servants, helpers)
- `src/components/BannerCard.tsx` - Main banner display component
- `src/components/ImageWithFallback.tsx` - Image with loading skeleton + error fallback
- `src/hooks/useBannerFilter.ts` - Filtering, search, and sorting logic (URL state via useSyncExternalStore)
- `src/app/servants/page.tsx` - Servants summary page
- `src/app/grands/page.tsx` - Grand servant lineup page
