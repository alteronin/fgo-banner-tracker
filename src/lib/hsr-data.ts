import hsrBanners from "@/data/hsr-banners.json";
import type { HsrBanner } from "@/types/hsr";

const banners = hsrBanners as HsrBanner[];

export function getHsrBanners(): HsrBanner[] {
  return banners;
}

export function getHsrYears(): string[] {
  const years = new Set<string>();
  for (const banner of banners) {
    years.add(banner.startDate.slice(0, 4));
  }
  return [...years].sort((a, b) => Number(b) - Number(a));
}

export function isHsrBannerActive(
  banner: HsrBanner,
  now: Date = new Date()
): boolean {
  if (!banner.endDate) return false;
  const start = new Date(banner.startDate + "T00:00:00");
  const end = new Date(banner.endDate + "T23:59:59");
  return now >= start && now <= end;
}

export function formatHsrDateRange(banner: HsrBanner): string {
  const start = new Date(banner.startDate + "T00:00:00");
  const month = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short" });
  if (!banner.endDate) {
    return `${month(start)} ${start.getDate()}, ${start.getFullYear()} - TBA`;
  }
  const end = new Date(banner.endDate + "T00:00:00");
  if (start.getFullYear() !== end.getFullYear()) {
    return `${month(start)} ${start.getDate()}, ${start.getFullYear()} - ${month(end)} ${end.getDate()}, ${end.getFullYear()}`;
  }
  if (start.getMonth() === end.getMonth()) {
    return `${month(start)} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${month(start)} ${start.getDate()} - ${month(end)} ${end.getDate()}, ${start.getFullYear()}`;
}

export function getHsrBannerTitle(banner: HsrBanner): string {
  return banner.banners.map((b) => b.name).join(" / ");
}
