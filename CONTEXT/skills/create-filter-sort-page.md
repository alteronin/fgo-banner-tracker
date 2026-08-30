# Skill: Create Filter/Sort/Search Page

## When to Use
Building a page that displays a list of items with search, filter, and sort functionality. Common pattern for collection browsers, directories, dashboards.

## Pattern

### Data Layer
```ts
// src/lib/data.ts
export function getItems(): Item[] { return items as Item[]; }
export function getItemBySlug(slug: string): Item | undefined { ... }
```

### Page Component Structure
```tsx
"use client";

import { useState, useMemo } from "react";

export default function ListPage() {
  const allItems = useMemo(() => getItems(), []);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("name-asc");

  const filteredItems = useMemo(() => {
    let result = allItems;
    if (filter !== "all") result = result.filter(...);
    if (search) result = result.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === "name-asc") result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [allItems, filter, search, sort]);

  return (
    <div>
      {/* Stats bar */}
      {/* Search input */}
      {/* Filter buttons */}
      {/* Sort dropdown */}
      {/* Results count */}
      {/* Item list */}
    </div>
  );
}
```

### Required UI Elements
1. **Stats bar** — total, filtered counts (e.g., owned/planning/unmarked)
2. **Search input** — instant text filter
3. **Filter buttons** — toggle between filter options
4. **Sort dropdown** — name, status, date, etc.
5. **Results count** — "Showing X of Y items"
6. **Item list** — map over filteredItems
7. **Empty state** — "No items found" message

### Key Implementation Details
- Always use `useMemo` for filtered/sorted results to avoid recalculation
- Reset to page 1 when filter/search changes (if paginated)
- Preserve scroll position when navigating back
- Use URL params for shareable filter states (optional)

### Status Chip Pattern
```tsx
const STATUS_COLORS = {
  none: { bg: "bg-gray-800", border: "border-gray-700", text: "text-gray-400" },
  owned: { bg: "bg-green-900/50", border: "border-green-600", text: "text-green-300" },
  planning: { bg: "bg-blue-900/50", border: "border-blue-600", text: "text-blue-300" },
};
```

### Navigation
- Add link from main page header: `<Link href="/list-page">View All</Link>`
- Add back link on list page header: `<Link href="/">Home</Link>`

## Example: FGO Servants Page
- 487 items with icon, name, class, status
- Search by name/class
- Filter: All / Owned / Planning / Unmarked
- Sort: Name A-Z / Status / Class
- Stats bar with counts
- Click to toggle status via Context
