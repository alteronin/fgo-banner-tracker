export type GenshinBannerType = "character" | "weapon" | "chronicled";

export interface GenshinRateUp {
  name: string;
  url: string | null;
  image: string | null;
}

export interface GenshinBanner {
  id: string;
  type: GenshinBannerType;
  version: string;
  phase: number | null;
  banners: GenshinRateUp[];
  startDate: string;
  endDate: string;
  featured5: GenshinRateUp[];
  featured4: GenshinRateUp[];
}
