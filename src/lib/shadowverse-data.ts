import svwbBanners from "@/data/shadowverse-banners.json";
import type { SvwbBanner } from "@/types/shadowverse";

const banners = svwbBanners as SvwbBanner[];

const latestSetStart = banners
  .filter((b) => b.type === "set")
  .map((b) => b.startDate)
  .reduce((a, b) => (a > b ? a : b), "");

export function getSvwbBanners(): SvwbBanner[] {
  return banners;
}

export function getSvwbYears(): string[] {
  const years = new Set<string>();
  for (const banner of banners) {
    years.add(banner.startDate.slice(0, 4));
  }
  return [...years].sort((a, b) => Number(b) - Number(a));
}

export function isSvwbBannerActive(
  banner: SvwbBanner,
  now: Date = new Date()
): boolean {
  const start = new Date(banner.startDate + "T00:00:00");
  if (now < start) return false;
  if (banner.endDate) {
    const end = new Date(banner.endDate + "T23:59:59");
    return now <= end;
  }
  return banner.startDate === latestSetStart;
}

export function formatSvwbDateRange(banner: SvwbBanner): string {
  const start = new Date(banner.startDate + "T00:00:00");
  const month = (date: Date) =>
    date.toLocaleDateString("en-US", { month: "short" });
  if (!banner.endDate) {
    return `${month(start)} ${start.getDate()}, ${start.getFullYear()} - Permanent`;
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

export function getSvwbBannerTitle(banner: SvwbBanner): string {
  return banner.banners.map((b) => b.name).join(" / ");
}
