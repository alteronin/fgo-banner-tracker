import genshinBanners from "@/data/genshin-banners.json";
import type { GenshinBanner } from "@/types/genshin";

const banners = genshinBanners as GenshinBanner[];

export function getGenshinBanners(): GenshinBanner[] {
  return banners;
}

export function getGenshinYears(): string[] {
  const years = new Set<string>();
  for (const banner of banners) {
    years.add(banner.startDate.slice(0, 4));
  }
  return [...years].sort((a, b) => Number(b) - Number(a));
}

export function isGenshinBannerActive(
  banner: GenshinBanner,
  now: Date = new Date()
): boolean {
  const start = new Date(banner.startDate + "T00:00:00");
  const end = new Date(banner.endDate + "T23:59:59");
  return now >= start && now <= end;
}

export function formatGenshinDateRange(banner: GenshinBanner): string {
  const start = new Date(banner.startDate + "T00:00:00");
  const end = new Date(banner.endDate + "T00:00:00");
  const month = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short" });
  if (start.getFullYear() !== end.getFullYear()) {
    return `${month(start)} ${start.getDate()}, ${start.getFullYear()} - ${month(end)} ${end.getDate()}, ${end.getFullYear()}`;
  }
  if (start.getMonth() === end.getMonth()) {
    return `${month(start)} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${month(start)} ${start.getDate()} - ${month(end)} ${end.getDate()}, ${start.getFullYear()}`;
}

export function getGenshinBannerTitle(banner: GenshinBanner): string {
  return banner.banners.map((b) => b.name).join(" / ");
}
