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
- Banner data in static JSON (178 banners)
- Servant status: none | owned | planning
- Filter: all | owned | planning | either
- Modal for banner detail view
- Responsive grid: 1 col mobile, 4 col desktop

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
