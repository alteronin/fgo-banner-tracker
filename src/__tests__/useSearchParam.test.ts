import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useSearchParam } from "@/hooks/useSearchParam";

function setSearch(url: string): void {
  window.history.replaceState({}, "", url);
}

describe("useSearchParam", () => {
  beforeEach(() => {
    setSearch("/");
  });

  it("returns null when the param is absent", () => {
    const { result } = renderHook(() => useSearchParam("search"));
    expect(result.current).toBeNull();
  });

  it("reads the param from the URL", () => {
    setSearch("/?search=Nahida&other=1");
    const { result } = renderHook(() => useSearchParam("search"));
    expect(result.current).toBe("Nahida");
  });

  it("treats an empty param as absent", () => {
    setSearch("/?search=");
    const { result } = renderHook(() => useSearchParam("search"));
    expect(result.current).toBeNull();
  });

  it("updates after a popstate navigation", () => {
    setSearch("/?search=Kazuha");
    const { result, rerender } = renderHook(() => useSearchParam("search"));
    expect(result.current).toBe("Kazuha");

    setSearch("/?search=Furina");
    window.dispatchEvent(new PopStateEvent("popstate"));
    rerender();
    expect(result.current).toBe("Furina");
  });
});
