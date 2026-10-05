import { beforeEach, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
}

// Reset before each test
beforeEach(() => {
  if (typeof window !== "undefined") {
    window.localStorage.clear();
  }
});
