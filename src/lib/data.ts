import banners from "@/data/banners.json";
import type { Banner } from "@/types/banner";

export function getBanners(): Banner[] {
  return banners as Banner[];
}

export function getBannerById(id: string): Banner | undefined {
  return (banners as Banner[]).find((b) => b.id === id);
}

export function getUniqueServants(banners: Banner[]): string[] {
  const servants = new Set<string>();
  for (const banner of banners) {
    for (const servant of banner.servants) {
      servants.add(servant.slug);
    }
  }
  return Array.from(servants).sort();
}
