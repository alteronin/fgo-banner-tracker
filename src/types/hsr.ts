export type HsrBannerType = "character" | "lightcone";

export interface HsrRateUp {
  name: string;
  url: string | null;
  image: string | null;
}

export interface HsrBanner {
  id: string;
  type: HsrBannerType;
  version: string | null;
  phase: number | null;
  banners: HsrRateUp[];
  startDate: string;
  endDate: string | null;
  featured5: HsrRateUp[];
  featured4: HsrRateUp[];
}
