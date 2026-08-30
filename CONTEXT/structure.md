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
│   │   ├── layout.tsx        # Root layout with providers and SEO
│   │   ├── page.tsx          # Main page with banner list
│   │   ├── globals.css       # Global styles
│   │   └── servants/
│   │       └── page.tsx      # Servants summary page
│   ├── components/
│   │   ├── AboutHelp.tsx     # About/help modal
│   │   ├── AdvancedSearch.tsx # Advanced search panel
│   │   ├── BannerCard.tsx    # Banner card component
│   │   ├── BannerDetail.tsx  # Banner detail modal
│   │   ├── BannerIndicators.tsx  # Owned/planning indicators
│   │   ├── BannerList.tsx    # Banner list with filtering
│   │   ├── CollectionStats.tsx # Collection statistics
│   │   ├── FilterBar.tsx     # Filter bar component
│   │   ├── ImageWithFallback.tsx # Image with error fallback
│   │   ├── ImportExport.tsx  # JSON import/export
│   │   ├── RateUpIndicator.tsx # Rate-up type badges
│   │   ├── SearchBar.tsx     # Search bar component
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
│   │   └── servants.json     # Servant data (487 servants)
│   ├── hooks/
│   │   ├── useBannerFilter.ts # Banner filtering hook
│   │   └── useKeyboardNavigation.ts # Keyboard navigation hook
│   ├── lib/
│   │   ├── data.ts           # Data access utilities
│   │   └── storage.ts        # localStorage utilities
│   ├── types/
│   │   └── banner.ts         # TypeScript types
│   └── __tests__/
│       ├── setup.ts          # Test setup
│       ├── data.test.ts      # Data utility tests
│       ├── storage.test.ts   # Storage tests
│       ├── ServantContext.test.tsx # Context tests
│       └── useBannerFilter.test.tsx # Filter hook tests
├── scripts/
│   ├── scrape-all.mjs        # Banner scraper (cheerio)
│   └── scrape-servants.mjs   # Servant scraper (sitemap + pages)
├── public/                   # Static assets
├── vitest.config.ts          # Vitest configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── next.config.ts            # Next.js config
└── tailwind.config.ts        # Tailwind config
```

## Key Files
- `src/data/banners.json` - 742 banners scraped from GamePress (2017-2026)
- `src/data/servants.json` - 487 servants with thumbnail icons
- `src/contexts/ServantContext.tsx` - Global servant status management
- `src/contexts/ThemeContext.tsx` - Dark/light mode management
- `src/lib/storage.ts` - localStorage persistence
- `src/lib/data.ts` - Data access (banners, servants, helpers)
- `src/components/BannerCard.tsx` - Main banner display component
- `src/components/ImageWithFallback.tsx` - Image with error fallback
- `src/hooks/useBannerFilter.ts` - Filtering, search, and sorting logic
- `src/app/servants/page.tsx` - Servants summary page
