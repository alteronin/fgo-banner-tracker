# MVP Bucket Plan

## Bucket 1: Core MVP (Complete)
**Status**: Completed
**Duration**: 1 day

### Features
- [x] **seed-data**: Banner JSON data, TypeScript types, localStorage utilities
- [x] **banner-list**: Banner card component and main page with responsive grid
- [x] **servant-toggle**: Servant context, ServantChip component, and toggle functionality
- [x] **banner-indicators**: Owned/planning count indicators on banner cards
- [x] **filter-bar**: Filter bar and banner list component with filtering logic
- [x] **banner-detail**: Banner detail modal with servant list and rate-up sections
- [x] **responsive-pass**: Mobile responsiveness for banner detail modal

### Success Criteria
- [x] User can browse all FGO JP banners
- [x] User can toggle any servant as owned/planning
- [x] User can filter to see only banners containing their owned/wanted servants
- [x] State persists across page refreshes
- [x] Works on mobile and desktop
- [x] Banner data loaded from seed JSON

---

## Bucket 2: Enhanced UX (Pending)
**Status**: Not started
**Estimated Duration**: 3-5 days

### Features
- [ ] **search**: Search by servant name
- [ ] **dark-light-mode**: Dark/light mode toggle
- [ ] **import-export**: Import/export collection (JSON file)
- [ ] **rate-up-indicators**: Show rate-up type (single/shared) on banner cards
- [ ] **collection-stats**: Collection stats summary (total owned, completion %)
- [ ] **url-filtering**: URL-based filtering (shareable links like `?filter=owned`)

---

## Bucket 3: Multi-Game Prep + Advanced (Pending)
**Status**: Not started
**Estimated Duration**: 1 week

### Features
- [ ] **multi-game-prep**: Game selector (FGO / Genshin / HSR / etc.)
- [ ] **class-rarity-filter**: Class/rarity filtering
- [ ] **sort-options**: Sort options (date, name, servant count)
- [ ] **advanced-search**: Advanced search (combine name + class + rarity + status)
- [ ] **keyboard-navigation**: Keyboard navigation

---

## Bucket 4: Polish & Extras (Pending)
**Status**: Not started
**Estimated Duration**: As needed

### Features
- [ ] **pwa-manifest**: PWA manifest + service worker
- [ ] **loading-skeletons**: Loading skeletons
- [ ] **animations**: Animations
- [ ] **lazy-loading**: Banner images lazy loading
- [ ] **seo-meta**: SEO meta tags
- [ ] **about-help**: About/help page
