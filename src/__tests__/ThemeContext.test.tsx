import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ReactNode } from "react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("ThemeContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("light");
    document.documentElement.classList.add("dark");
  });

  it("defaults to dark when html has the dark class", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("dark");
  });

  it("reads an existing light class applied before render", () => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe("light");
  });

  it("toggle switches to light and updates the html class", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(window.localStorage.getItem("fgo-theme")).toBe("light");
  });

  it("toggle switches back to dark", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      result.current.toggleTheme();
    });
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
    expect(window.localStorage.getItem("fgo-theme")).toBe("dark");
  });

  it("multiple subscribers stay in sync after toggle", () => {
    const first = renderHook(() => useTheme(), { wrapper });
    const second = renderHook(() => useTheme(), { wrapper });

    act(() => {
      first.result.current.toggleTheme();
    });

    expect(first.result.current.theme).toBe("light");
    expect(second.result.current.theme).toBe("light");
  });
});
