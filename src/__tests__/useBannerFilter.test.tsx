import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ReactNode } from "react";
import { ServantProvider } from "@/contexts/ServantContext";
import { useBannerFilter } from "@/hooks/useBannerFilter";
import type { Banner } from "@/types/banner";

// Test banners
const testBanners: Banner[] = [
  {
    id: "banner-1",
    name: "Summer Banner 2026",
    imageUrl: "https://example.com/1.png",
    startDate: "2026-08-01",
    endDate: "2026-08-15",
    servants: [
      { name: "Artoria", slug: "artoria", rateUpType: "single" },
      { name: "Merlin", slug: "merlin", rateUpType: "shared" },
    ],
  },
  {
    id: "banner-2",
    name: "New Year Banner 2026",
    imageUrl: "https://example.com/2.png",
    startDate: "2026-01-01",
    endDate: "2026-01-15",
    servants: [
      { name: "Morgan", slug: "morgan", rateUpType: "single" },
      { name: "Artoria", slug: "artoria", rateUpType: "shared" },
    ],
  },
  {
    id: "banner-3",
    name: "Christmas Banner 2025",
    imageUrl: "https://example.com/3.png",
    startDate: "2025-12-25",
    endDate: "2025-12-31",
    servants: [
      { name: "Jeanne", slug: "jeanne", rateUpType: "single" },
    ],
  },
];

function wrapper({ children }: { children: ReactNode }) {
  return <ServantProvider>{children}</ServantProvider>;
}

describe("useBannerFilter", () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Reset URL params
    window.history.replaceState({}, "", "/");
  });

  it("returns all banners initially", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });
    expect(result.current.filteredBanners).toHaveLength(3);
  });

  it("searches by servant name", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });

    act(() => {
      result.current.handleSearch("Artoria");
    });

    expect(result.current.filteredBanners).toHaveLength(2);
  });

  it("search is case-insensitive", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });

    act(() => {
      result.current.handleSearch("artoria");
    });

    expect(result.current.filteredBanners).toHaveLength(2);
  });

  it("sorts by date descending by default", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });

    expect(result.current.filteredBanners[0].id).toBe("banner-1");
    expect(result.current.filteredBanners[1].id).toBe("banner-2");
    expect(result.current.filteredBanners[2].id).toBe("banner-3");
  });

  it("sorts by date ascending", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });

    act(() => {
      result.current.setSort("date-asc");
    });

    expect(result.current.filteredBanners[0].id).toBe("banner-3");
    expect(result.current.filteredBanners[2].id).toBe("banner-1");
  });

  it("sorts by name ascending", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });

    act(() => {
      result.current.setSort("name-asc");
    });

    expect(result.current.filteredBanners[0].name).toBe("Christmas Banner 2025");
    expect(result.current.filteredBanners[1].name).toBe("New Year Banner 2026");
    expect(result.current.filteredBanners[2].name).toBe("Summer Banner 2026");
  });

  it("sorts by servant count descending", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });

    act(() => {
      result.current.setSort("servants-desc");
    });

    expect(result.current.filteredBanners[0].servants.length).toBe(2);
    expect(result.current.filteredBanners[2].servants.length).toBe(1);
  });

  it("provides available years", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });

    expect(result.current.availableYears).toContain("2025");
    expect(result.current.availableYears).toContain("2026");
  });

  it("filters by year", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });

    act(() => {
      result.current.setYear("2025");
    });

    expect(result.current.filteredBanners).toHaveLength(1);
    expect(result.current.filteredBanners[0].id).toBe("banner-3");
  });

  it("combines search and sort", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });

    act(() => {
      result.current.handleSearch("Artoria");
    });

    act(() => {
      result.current.setSort("date-asc");
    });

    expect(result.current.filteredBanners).toHaveLength(2);
    expect(result.current.filteredBanners[0].id).toBe("banner-2");
    expect(result.current.filteredBanners[1].id).toBe("banner-1");
  });

  it("setFilter updates filter state", () => {
    const { result } = renderHook(() => useBannerFilter(testBanners), {
      wrapper,
    });

    expect(result.current.filter).toBe("all");

    act(() => {
      result.current.setFilter("owned");
    });

    expect(result.current.filter).toBe("owned");
  });
});
