# Replicate FGO JP Banner Tracker — Abstracted

## What This App Does
A gacha game banner tracker that lets players mark which characters they own or plan to pull, then filter banners to see relevant ones.

## User Roles & Permissions
- **User**: Can view banners, toggle servant status, filter banners
- No authentication required for MVP

## Features
1. **Banner List**: Display all banners with images, dates, servant counts
2. **Servant Toggle**: Mark servants as owned/planning/none
3. **Status Indicators**: Show owned/planning counts on banner cards
4. **Filter Bar**: Filter banners by servant status
5. **Banner Detail**: View full banner details in modal
6. **Persistence**: Save state to localStorage

## Data Model
- **Banner**: Contains name, image, dates, and list of servants
- **Servant**: Has name, slug, and rate-up type
- **User Status**: Per-servant status (none/owned/planning)

## Integration Points
- Banner data sourced from GamePress wiki (scraped to JSON)
- No external APIs required for MVP

## Non-Functional Requirements
- Works on mobile and desktop
- Fast filter response (client-side)
- No network calls for persistence
- Optimized image loading

## Deployment Requirements
- Static hosting (Vercel free tier)
- No server-side requirements
- No database needed

## Constraints & Preferences
- Dark theme by default
- Responsive grid layout
- Modal for detail view
- Client-side filtering
