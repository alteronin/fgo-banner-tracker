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
- **Hosting**: Vercel (free tier)

## Key Features
1. Browse all FGO JP summoning banners
2. Toggle servant status (owned/planning/none)
3. Filter banners by servant status
4. View banner details with rate-up information
5. Responsive design for mobile and desktop

## Data Source
Banner data scraped from GamePress FGO Wiki (https://grandorder.gamepress.gg/summon-banner-list)

## Future Expansion
- Support for multiple gacha games (Genshin, HSR, HI3, ZZZ, WuWa)
- Cloud sync with user accounts
- Advanced filtering and search
- Import/export collection data
