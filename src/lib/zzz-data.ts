import zzzBanners from "@/data/zzz-banners.json";
import type { ZzzBanner } from "@/types/zzz";

const banners = zzzBanners as ZzzBanner[];

export function getZzzBanners(): ZzzBanner[] {
  return banners;
}

export function getZzzYears(): string[] {
  const years = new Set<string>();
  for (const banner of banners) {
    years.add(banner.startDate.slice(0, 4));
  }
  return [...years].sort((a, b) => Number(b) - Number(a));
}

export function isZzzBannerActive(
  banner: ZzzBanner,
  now: Date = new Date()
): boolean {
  if (!banner.endDate) return false;
  const start = new Date(banner.startDate + "T00:00:00");
  const end = new Date(banner.endDate + "T23:59:59");
  return now >= start && now <= end;
}

export function formatZzzDateRange(banner: ZzzBanner): string {
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

export function getZzzBannerTitle(banner: ZzzBanner): string {
  return banner.banners.map((b) => b.name).join(" / ");
}
