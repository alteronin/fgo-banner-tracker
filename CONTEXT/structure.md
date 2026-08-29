# Project Structure

```
fgo-banner-tracker/
├── CONTEXT/
│   ├── state.md              # Master state file
│   ├── project.md            # Project overview
│   ├── buckets.md            # MVP milestone bucket plan
│   ├── structure.md          # This file
│   ├── decisions.md          # Architectural decisions
│   ├── history.md            # Archived items
│   └── prompts/
│       ├── tech-specific.md  # Tech-specific replication prompt
│       └── abstracted.md     # Abstracted replication prompt
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with ServantProvider
│   │   ├── page.tsx          # Main page with banner list
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── BannerCard.tsx    # Banner card component
│   │   ├── BannerDetail.tsx  # Banner detail modal
│   │   ├── BannerIndicators.tsx  # Owned/planning indicators
│   │   ├── BannerList.tsx    # Banner list with filtering
│   │   ├── FilterBar.tsx     # Filter bar component
│   │   └── ServantChip.tsx   # Servant status chip
│   ├── contexts/
│   │   └── ServantContext.tsx # Servant status context
│   ├── data/
│   │   └── banners.json      # Banner data (178 banners)
│   ├── hooks/
│   │   └── useBannerFilter.ts # Banner filtering hook
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
- `src/lib/storage.ts` - localStorage persistence
- `src/components/BannerCard.tsx` - Main banner display component
