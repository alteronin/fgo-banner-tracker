export type WuwaBannerType = "resonator" | "selector";

export interface WuwaRateUp {
  name: string;
  url: string | null;
  image: string | null;
}

export interface WuwaBanner {
  id: string;
  type: WuwaBannerType;
  version: string | null;
  phase: number | null;
  banners: WuwaRateUp[];
  startDate: string | null;
  endDate: string | null;
  featured5: WuwaRateUp[];
  featured4: WuwaRateUp[];
  featuredWeapons: WuwaRateUp[];
}
