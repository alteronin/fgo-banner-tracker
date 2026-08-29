# Project Structure

```
fgo-banner-tracker/
├── CONTEXT/
│   ├── state.md              # Master state file
│   ├── project.md            # Project overview
│   ├── buckets.md            # MVP milestone bucket plan
│   ├── structure.md          # This file
│   ├── decisions.md          # Architectural decisions
│   └── prompts/
│       ├── tech-specific.md  # Tech-specific replication prompt
│       └── abstracted.md     # Abstracted replication prompt
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with providers and SEO
│   │   ├── page.tsx          # Main page with banner list
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── AboutHelp.tsx     # About/help modal
│   │   ├── AdvancedSearch.tsx # Advanced search panel
│   │   ├── BannerCard.tsx    # Banner card component
│   │   ├── BannerDetail.tsx  # Banner detail modal
│   │   ├── BannerIndicators.tsx  # Owned/planning indicators
│   │   ├── BannerList.tsx    # Banner list with filtering
│   │   ├── CollectionStats.tsx # Collection statistics
│   │   ├── FilterBar.tsx     # Filter bar component
│   │   ├── ImportExport.tsx  # JSON import/export
│   │   ├── RateUpIndicator.tsx # Rate-up type badges
│   │   ├── SearchBar.tsx     # Search bar component
│   │   ├── ServantChip.tsx   # Servant status chip
│   │   ├── Skeleton.tsx      # Loading skeletons
│   │   ├── SortBar.tsx       # Sort dropdown
│   │   └── ThemeToggle.tsx   # Dark/light mode toggle
│   ├── contexts/
│   │   ├── ServantContext.tsx # Servant status context
│   │   └── ThemeContext.tsx   # Theme context
│   ├── data/
│   │   └── banners.json      # Banner data (178 banners)
│   ├── hooks/
│   │   ├── useBannerFilter.ts # Banner filtering hook
│   │   └── useKeyboardNavigation.ts # Keyboard navigation hook
│   ├── lib/
│   │   ├── data.ts           # Data access utilities
│   │   └── storage.ts        # localStorage utilities
│   └── types/
│       └── banner.ts         # TypeScript types
├── public/                   # Static assets
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── next.config.ts            # Next.js config
└── tailwind.config.ts        # Tailwind config
```

## Key Files
- `src/data/banners.json` - 178 banners scraped from GamePress
- `src/contexts/ServantContext.tsx` - Global servant status management
- `src/contexts/ThemeContext.tsx` - Dark/light mode management
- `src/lib/storage.ts` - localStorage persistence
- `src/components/BannerCard.tsx` - Main banner display component
- `src/hooks/useBannerFilter.ts` - Filtering, search, and sorting logic
