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
**Decision**: Static JSON file with 178 banners
**Reasoning**:
- Banner data changes infrequently
- No need for real-time updates
- Can be updated via JSON seed tool later

## 4. Image Handling
**Decision**: next/image for optimized loading
**Reasoning**:
- Automatic image optimization
- Lazy loading by default
- Better Core Web Vitals

## 5. Component Architecture
**Decision**: Client components with Context
**Reasoning**:
- Servant status requires interactivity
- Context provides global state access
- Components are self-contained and reusable

## 6. Modal vs Page for Detail View
**Decision**: Modal overlay
**Reasoning**:
- Keeps user in context
- Faster navigation
- Better mobile experience

## 7. Filtering Strategy
**Decision**: Client-side filtering with useMemo
**Reasoning**:
- 178 banners is small enough for client-side
- No API calls needed
- Instant filter response
