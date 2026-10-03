import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ReactNode } from "react";
import { UnitProvider, useUnitStatus } from "@/contexts/UnitContext";
import type { UnitGame } from "@/types/units";

function makeWrapper(game: UnitGame) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <UnitProvider game={game}>{children}</UnitProvider>;
  };
}

describe("UnitContext", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("provides initial empty statuses", () => {
    const { result } = renderHook(() => useUnitStatus(), {
      wrapper: makeWrapper("genshin"),
    });
    expect(result.current.statuses).toEqual({});
    expect(result.current.game).toBe("genshin");
  });

  it("returns none for unknown unit", () => {
    const { result } = renderHook(() => useUnitStatus(), {
      wrapper: makeWrapper("genshin"),
    });
    expect(result.current.getStatus("unknown")).toBe("none");
  });

  it("sets and gets unit status", () => {
    const { result } = renderHook(() => useUnitStatus(), {
      wrapper: makeWrapper("genshin"),
    });

    act(() => {
      result.current.setStatus("nahida", "owned");
    });

    expect(result.current.getStatus("nahida")).toBe("owned");
  });

  it("toggles status: none -> owned -> planning -> none", () => {
    const { result } = renderHook(() => useUnitStatus(), {
      wrapper: makeWrapper("zzz"),
    });

    expect(result.current.getStatus("miyabi")).toBe("none");

    act(() => {
      result.current.toggleStatus("miyabi");
    });
    expect(result.current.getStatus("miyabi")).toBe("owned");

    act(() => {
      result.current.toggleStatus("miyabi");
    });
    expect(result.current.getStatus("miyabi")).toBe("planning");

    act(() => {
      result.current.toggleStatus("miyabi");
    });
    expect(result.current.getStatus("miyabi")).toBe("none");
  });

  it("persists under the game key", () => {
    const { result } = renderHook(() => useUnitStatus(), {
      wrapper: makeWrapper("wuwa"),
    });

    act(() => {
      result.current.setStatus("jiyan", "planning");
    });

    const stored = JSON.parse(
      window.localStorage.getItem("unit-status:wuwa") || "{}"
    );
    expect(stored.jiyan).toBe("planning");
    expect(window.localStorage.getItem("unit-status:genshin")).toBeNull();
  });

  it("loads from localStorage on init", () => {
    window.localStorage.setItem(
      "unit-status:hsr",
      JSON.stringify({ seele: "owned" })
    );

    const { result } = renderHook(() => useUnitStatus(), {
      wrapper: makeWrapper("hsr"),
    });
    expect(result.current.getStatus("seele")).toBe("owned");
  });

  it("notifies other providers of the same game", () => {
    const wrapper = makeWrapper("hi3");
    const first = renderHook(() => useUnitStatus(), { wrapper });
    const second = renderHook(() => useUnitStatus(), { wrapper });

    act(() => {
      first.result.current.setStatus("white-comet", "owned");
    });

    expect(second.result.current.getStatus("white-comet")).toBe("owned");
  });

  it("throws outside of a provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderHook(() => useUnitStatus())).toThrow(
      "useUnitStatus must be used within UnitProvider"
    );
    spy.mockRestore();
  });
});
