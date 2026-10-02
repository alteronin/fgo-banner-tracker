export type SvwbBannerType = "set" | "collab";

export interface SvwbRateUp {
  name: string;
  url: string | null;
  image: string | null;
}

export interface SvwbBanner {
  id: string;
  type: SvwbBannerType;
  version: string | null;
  phase: number | null;
  banners: SvwbRateUp[];
  startDate: string;
  endDate: string | null;
  featured5: SvwbRateUp[];
  featured4: SvwbRateUp[];
}
