# Replicate FGO JP Banner Tracker — Tech-Specific

## Tech Stack
- Framework: Next.js 16.3.3 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- State Management: localStorage + React Context
- Hosting: Vercel (free tier)
- Key libraries: next/image

## Project Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── BannerCard.tsx      # Banner display
│   ├── BannerDetail.tsx    # Detail modal
│   ├── BannerIndicators.tsx # Status indicators
│   ├── BannerList.tsx      # List with filtering
│   ├── FilterBar.tsx       # Filter controls
│   └── ServantChip.tsx     # Status chip
├── contexts/
│   └── ServantContext.tsx   # Global state
├── data/
│   └── banners.json        # Banner data
├── hooks/
│   └── useBannerFilter.ts  # Filtering logic
├── lib/
│   ├── data.ts             # Data access
│   └── storage.ts          # localStorage
└── types/
    └── banner.ts           # TypeScript types
```

## Architecture
- Server components for initial page load
- Client components for interactive features
- React Context for global servant status
- localStorage for persistence

## Key Implementation Details
- Banner data in static JSON (742 banners, 2017-2026)
- Servant status: none | owned | planning
- Filter: all | owned | planning | either
- Modal for banner detail view
- Responsive grid: 1 col mobile, 4 col desktop
- localStorage state exposed via useSyncExternalStore (hydration-safe)
- Dark/light theme via .light/.dark html classes + pre-paint inline script
- Multi-game: app registry `src/lib/apps.ts` + AppSwitcher dropdown; static routes override `[game]` dynamic route (`dynamicParams=false` for true 404s)
- Genshin tracker at `/genshin`: 216 banners from Game8 via cheerio scraper (`scripts/scrape-genshin.mjs`), type/year/search filters, detail modal with featured chips

## Build & Run
```bash
npm install
npm run dev    # Development
npm run build  # Production build
npm start      # Start production server
```

## Environment Variables
None required for MVP.

## Data Schema
```typescript
interface Banner {
  id: string;
  name: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  servants: Servant[];
}

interface Servant {
  name: string;
  slug: string;
  rateUpType: "single" | "shared";
}

type ServantStatus = "none" | "owned" | "planning";
type FilterOption = "all" | "owned" | "planning" | "either";
```
