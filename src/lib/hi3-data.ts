import hi3Banners from "@/data/hi3-banners.json";
import type { Hi3Banner } from "@/types/hi3";

const banners = hi3Banners as Hi3Banner[];

export function getHi3Banners(): Hi3Banner[] {
  return banners;
}

export function getHi3Years(): string[] {
  const years = new Set<string>();
  for (const banner of banners) {
    years.add(banner.startDate.slice(0, 4));
  }
  return [...years].sort((a, b) => Number(b) - Number(a));
}

export function isHi3BannerActive(
  banner: Hi3Banner,
  now: Date = new Date()
): boolean {
  const start = new Date(banner.startDate + "T00:00:00");
  if (now < start) return false;
  if (!banner.endDate) return true;
  const end = new Date(banner.endDate + "T23:59:59");
  return now <= end;
}

export function formatHi3DateRange(banner: Hi3Banner): string {
  const start = new Date(banner.startDate + "T00:00:00");
  const month = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short" });
  if (!banner.endDate) {
    return `${month(start)} ${start.getDate()}, ${start.getFullYear()} - Ongoing`;
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

export function getHi3BannerTitle(banner: Hi3Banner): string {
  return banner.banners.map((b) => b.name).join(" / ");
}
