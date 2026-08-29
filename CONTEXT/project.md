# FGO JP Banner Tracker

## Vision
A web application that helps Fate/Grand Order JP server players track their servant pulls and plan their quartz spending across summoning banners.

## Target Users
- FGO JP server players
- Global players using JP as reference for future planning
- Players who want to track which servants they own or plan to pull

## Problem Solved
- Currently, players manually track which banners contain servants they want
- No centralized tool to see owned/planning status across all banners
- Hard to plan quartz spending without visual indicators

## Tech Stack
- **Frontend**: Next.js 16.3.3 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: localStorage + React Context
- **Testing**: Vitest + Testing Library
- **Hosting**: Vercel (free tier)

## Key Features
1. Browse all 742 FGO JP summoning banners (2017-2026)
2. Toggle servant status (owned/planning/none)
3. Filter banners by servant status, year, search
4. View banner details with rate-up information
5. Servant collection page with 487 servants + thumbnails
6. Responsive design for mobile and desktop
7. Dark/light mode
8. Import/export collection data
9. Keyboard navigation
10. Image fallback for broken thumbnails

## Data Sources
- Banner data: Scraped from GamePress FGO Wiki (https://grandorder.gamepress.gg/summon-banner-list)
- Servant data: Scraped from GamePress sitemap + individual pages (https://grandorder.gamepress.gg/c/servants)
- Images: Hosted on static.mana.wiki with fallback placeholders

## Testing
- 39 unit tests covering data, storage, context, and hooks
- Run with `npm run test`

## Future Expansion
- Support for multiple gacha games (Genshin, HSR, HI3, ZZZ, WuWa)
- Cloud sync with user accounts
- E2E browser tests (Playwright/Cypress)
