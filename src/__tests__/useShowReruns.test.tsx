import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useShowReruns, setShowReruns } from "@/hooks/useShowReruns";

describe("useShowReruns", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("defaults to true (show) when the key is missing", () => {
    const { result } = renderHook(() => useShowReruns());
    expect(result.current).toBe(true);
  });

  it("returns true for stored value '1'", () => {
    window.localStorage.setItem("fbtn-show-reruns", "1");
    const { result } = renderHook(() => useShowReruns());
    expect(result.current).toBe(true);
  });

  it("returns false for stored value '0'", () => {
    window.localStorage.setItem("fbtn-show-reruns", "0");
    const { result } = renderHook(() => useShowReruns());
    expect(result.current).toBe(false);
  });

  it("setShowReruns(false) writes '0' and notifies subscribers", () => {
    const { result } = renderHook(() => useShowReruns());
    expect(result.current).toBe(true);

    act(() => {
      setShowReruns(false);
    });

    expect(result.current).toBe(false);
    expect(window.localStorage.getItem("fbtn-show-reruns")).toBe("0");
  });

  it("setShowReruns(true) removes the key and notifies subscribers", () => {
    window.localStorage.setItem("fbtn-show-reruns", "0");
    const { result } = renderHook(() => useShowReruns());
    expect(result.current).toBe(false);

    act(() => {
      setShowReruns(true);
    });

    expect(result.current).toBe(true);
    expect(window.localStorage.getItem("fbtn-show-reruns")).toBeNull();
  });

  it("multiple subscribers stay in sync", () => {
    const first = renderHook(() => useShowReruns());
    const second = renderHook(() => useShowReruns());

    act(() => {
      setShowReruns(false);
    });

    expect(first.result.current).toBe(false);
    expect(second.result.current).toBe(false);
  });
});
