# Architectural Decisions

## 1. Tech Stack Choice
**Decision**: Next.js with App Router + TypeScript + Tailwind CSS
**Reasoning**: 
- Free hosting on Vercel
- SSR/SSG support for SEO
- TypeScript for type safety
- Tailwind for rapid UI development

## 2. State Management
**Decision**: localStorage + React Context
**Reasoning**:
- No backend needed for MVP
- Instant persistence without network calls
- Easy to migrate to backend later if needed

## 3. Data Storage
**Decision**: Static JSON files (banners.json + servants.json)
**Reasoning**:
- Banner data changes infrequently
- Servant data is stable between game updates
- No need for real-time updates
- Scrapers regenerate data on demand

## 4. Image Handling
**Decision**: next/image with ImageWithFallback wrapper
**Reasoning**:
- Automatic image optimization via Vercel CDN
- Lazy loading by default
- Graceful degradation when external images break
- External URLs from static.mana.wiki (no self-hosting overhead)

## 5. Component Architecture
**Decision**: Client components with Context
**Reasoning**:
- Servant status requires interactivity
- Context provides global state access
- Components are self-contained and reusable

## 6. Modal vs Page for Detail View
**Decision**: Modal overlay for banner details, separate page for servants
**Reasoning**:
- Banner details are quick views — modal keeps user in context
- Servants page is a dedicated browsing experience — separate route makes sense

## 7. Filtering Strategy
**Decision**: Client-side filtering with useMemo
**Reasoning**:
- 742 banners and 487 servants are small enough for client-side
- No API calls needed
- Instant filter response

## 8. Image Fallback Strategy
**Decision**: ImageWithFallback component with error handler
**Reasoning**:
- External images from mana.wiki may break (as seen with bracket issue)
- Better UX to show placeholder than broken image icon
- Chosen over self-hosting to avoid repo bloat (~80MB of images)

## 9. Data Scraping Approach
**Decision**: Cheerio-based HTML scraping for banners, sitemap + page scraping for servants
**Reasoning**:
- GamePress is a Remix app with client-side rendering — no public API
- Cheerio parses server-rendered HTML reliably
- Sitemap provides complete servant URL list (487 entries)
- Individual page fetches extract icon URLs from og:image meta tags

## 10. Testing Framework
**Decision**: Vitest + Testing Library
**Reasoning**:
- Fast test execution (Vite-based)
- Compatible with Next.js and TypeScript
- Testing Library provides realistic component testing
- 39 tests covering data, storage, context, and hooks
