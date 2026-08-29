import banners from "@/data/banners.json";
import servants from "@/data/servants.json";
import type { Banner } from "@/types/banner";

export interface ServantData {
  slug: string;
  name: string;
  iconUrl: string;
  className: string;
}

export function getBanners(): Banner[] {
  return banners as Banner[];
}

export function getBannerById(id: string): Banner | undefined {
  return (banners as Banner[]).find((b) => b.id === id);
}

export function getUniqueServants(banners: Banner[]): string[] {
  const servantSet = new Set<string>();
  for (const banner of banners) {
    for (const servant of banner.servants) {
      servantSet.add(servant.slug);
    }
  }
  return Array.from(servantSet).sort();
}

export function getServants(): ServantData[] {
  return servants as ServantData[];
}

export function getServantBySlug(slug: string): ServantData | undefined {
  return (servants as ServantData[]).find((s) => s.slug === slug);
}

export function getUniqueServantsWithName(
  bannerList: Banner[]
): { slug: string; name: string }[] {
  const seen = new Set<string>();
  const result: { slug: string; name: string }[] = [];

  for (const banner of bannerList) {
    for (const servant of banner.servants) {
      if (!seen.has(servant.slug)) {
        seen.add(servant.slug);
        result.push({ slug: servant.slug, name: servant.name });
      }
    }
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}
