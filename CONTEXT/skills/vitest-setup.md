# Skill: Vitest + Testing Library Setup for Next.js

## When to Use
Adding unit and component tests to a Next.js project. Need fast test execution with good TypeScript/React support.

## Setup

### Install Dependencies
```bash
npm install vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom --save-dev
```

### vitest.config.ts
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

### src/__tests__/setup.ts
```ts
import { expect, beforeEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

beforeEach(() => { window.localStorage.clear(); });
```

### package.json scripts
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

## Test Patterns

### Utility Functions
```ts
import { describe, it, expect } from "vitest";
import { myFunction } from "@/lib/my-module";

describe("myFunction", () => {
  it("returns expected result", () => {
    expect(myFunction("input")).toBe("output");
  });
});
```

### React Context (with Provider wrapper)
```tsx
import { renderHook, act } from "@testing-library/react";
import { ReactNode } from "react";
import { MyProvider } from "@/contexts/MyContext";

function wrapper({ children }: { children: ReactNode }) {
  return <MyProvider>{children}</MyProvider>;
}

describe("MyContext", () => {
  it("provides initial state", () => {
    const { result } = renderHook(() => useMyContext(), { wrapper });
    expect(result.current.value).toBe(initialValue);
  });

  it("updates state", () => {
    const { result } = renderHook(() => useMyContext(), { wrapper });
    act(() => { result.current.setValue("new"); });
    expect(result.current.value).toBe("new");
  });
});
```

### Custom Hooks
```tsx
import { renderHook, act } from "@testing-library/react";
import { useMyHook } from "@/hooks/useMyHook";

describe("useMyHook", () => {
  it("returns filtered results", () => {
    const { result } = renderHook(() => useMyHook(testData));
    act(() => { result.current.setFilter("active"); });
    expect(result.current.filteredItems.length).toBeGreaterThan(0);
  });
});
```

## Common Gotchas
- Import `expect` from vitest in setup.ts (not globals)
- Use `@testing-library/jest-dom/matchers` not `@testing-library/jest-dom`
- Mock `window.location` if hook reads URL params
- Wrap context-dependent hooks with provider wrapper
- Use `act()` for state updates

## Example: FGO Banner Tracker
- 39 tests covering data.ts, storage.ts, ServantContext, useBannerFilter
- Tests run in ~3s (Vitest is fast due to Vite-based transforms)
