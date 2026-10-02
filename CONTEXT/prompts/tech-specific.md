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
- HSR tracker at `/hsr`: 131 banners from Game8 (`scripts/scrape-hsr.mjs`), character/light-cone filters, nullable end dates (TBA collab banners)
- ZZZ tracker at `/zzz`: 134 banners from Game8 two-column table (`scripts/scrape-zzz.mjs`), agent/W-Engine filters, type-aware no-featured note
- WuWa tracker at `/wuwa`: 46 banners from Game8 detail-text zones (`scripts/scrape-wuwa.mjs`), resonator/selector filters, `featuredWeapons[]`, nullable selector dates ("No dates listed"/"Not listed")
- HI3 tracker at `/hi3`: 73 GLB versions from fandom MediaWiki API (`scripts/scrape-hi3.mjs`, `Category:Versions` + `Version Entry`/`Version Infobox` templates), no type filter, null end = ongoing ("Ongoing"), debut-line featured extraction
- Shadowverse tracker at `/shadowverse`: 10 entries from official cards site (`scripts/scrape-shadowverse.mjs`), card-set/collab filters, latest-set active rule, permanent ranges, imageless fallback rendering
- `ImageWithFallback`: empty `src` renders fallback UI without a request; `static.wikia.nocookie.net` sources render `unoptimized` (Fandom 403s the optimizer's referer-less fetch)

## Upcoming Features (Buckets 11-13)
- Events tab at `/events`: unified event schema `{id, game, name, startDate, endDate, type, url?, imageUrl?}`, nav tab, Now/Upcoming/Past sections, game + year filters
- Cross-game Units & Faves: per-game roster pages (status tracking like `/servants`) and lineup pages (like `/grands`), status storage keyed per game (`unit-status:{game}`), per-game tab nav; likely static `/[game]/units` subroutes
- Class/element button filters on servants/units tab: per-game taxonomy (FGO classes, Genshin elements, HSR elements/paths), multi-select pills combinable with search/sort/status

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
