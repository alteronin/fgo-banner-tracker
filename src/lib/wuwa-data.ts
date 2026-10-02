import wuwaBanners from "@/data/wuwa-banners.json";
import type { WuwaBanner } from "@/types/wuwa";

const banners = wuwaBanners as WuwaBanner[];

export function getWuwaBanners(): WuwaBanner[] {
  return banners;
}

export function getWuwaYears(): string[] {
  const years = new Set<string>();
  for (const banner of banners) {
    if (!banner.startDate) continue;
    years.add(banner.startDate.slice(0, 4));
  }
  return [...years].sort((a, b) => Number(b) - Number(a));
}

export function isWuwaBannerActive(
  banner: WuwaBanner,
  now: Date = new Date()
): boolean {
  if (!banner.startDate || !banner.endDate) return false;
  const start = new Date(banner.startDate + "T00:00:00");
  const end = new Date(banner.endDate + "T23:59:59");
  return now >= start && now <= end;
}

export function formatWuwaDateRange(banner: WuwaBanner): string {
  if (!banner.startDate || !banner.endDate) return "No dates listed";
  const start = new Date(banner.startDate + "T00:00:00");
  const month = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short" });
  const end = new Date(banner.endDate + "T00:00:00");
  if (start.getFullYear() !== end.getFullYear()) {
    return `${month(start)} ${start.getDate()}, ${start.getFullYear()} - ${month(end)} ${end.getDate()}, ${end.getFullYear()}`;
  }
  if (start.getMonth() === end.getMonth()) {
    return `${month(start)} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${month(start)} ${start.getDate()} - ${month(end)} ${end.getDate()}, ${start.getFullYear()}`;
}

export function getWuwaBannerTitle(banner: WuwaBanner): string {
  return banner.banners.map((b) => b.name).join(" / ");
}
