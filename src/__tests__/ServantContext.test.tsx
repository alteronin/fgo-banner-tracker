import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ReactNode } from "react";
import { ServantProvider, useServantStatus } from "@/contexts/ServantContext";

// Wrapper for hooks that need ServantProvider
function wrapper({ children }: { children: ReactNode }) {
  return <ServantProvider>{children}</ServantProvider>;
}

describe("ServantContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("provides initial empty statuses", () => {
    const { result } = renderHook(() => useServantStatus(), { wrapper });
    expect(result.current.statuses).toEqual({});
  });

  it("returns none for unknown servant", () => {
    const { result } = renderHook(() => useServantStatus(), { wrapper });
    expect(result.current.getStatus("unknown")).toBe("none");
  });

  it("sets and gets servant status", () => {
    const { result } = renderHook(() => useServantStatus(), { wrapper });

    act(() => {
      result.current.setStatus("artoria", "owned");
    });

    expect(result.current.getStatus("artoria")).toBe("owned");
  });

  it("toggles status: none -> owned -> planning -> none", () => {
    const { result } = renderHook(() => useServantStatus(), { wrapper });

    // Initial: none
    expect(result.current.getStatus("merlin")).toBe("none");

    // Toggle 1: -> owned
    act(() => {
      result.current.toggleStatus("merlin");
    });
    expect(result.current.getStatus("merlin")).toBe("owned");

    // Toggle 2: -> planning
    act(() => {
      result.current.toggleStatus("merlin");
    });
    expect(result.current.getStatus("merlin")).toBe("planning");

    // Toggle 3: -> none
    act(() => {
      result.current.toggleStatus("merlin");
    });
    expect(result.current.getStatus("merlin")).toBe("none");
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useServantStatus(), { wrapper });

    act(() => {
      result.current.setStatus("waver", "planning");
    });

    const stored = JSON.parse(
      window.localStorage.getItem("fgo-servant-status") || "{}"
    );
    expect(stored.waver).toBe("planning");
  });

  it("loads from localStorage on init", () => {
    window.localStorage.setItem(
      "fgo-servant-status",
      JSON.stringify({ "skadi": "owned" })
    );

    const { result } = renderHook(() => useServantStatus(), { wrapper });
    expect(result.current.getStatus("skadi")).toBe("owned");
  });
});
