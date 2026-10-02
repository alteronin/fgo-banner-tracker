export type ZzzBannerType = "agent" | "wengine";

export interface ZzzRateUp {
  name: string;
  url: string | null;
  image: string | null;
}

export interface ZzzBanner {
  id: string;
  type: ZzzBannerType;
  version: string | null;
  phase: number | null;
  banners: ZzzRateUp[];
  startDate: string;
  endDate: string | null;
  featured5: ZzzRateUp[];
  featured4: ZzzRateUp[];
}
