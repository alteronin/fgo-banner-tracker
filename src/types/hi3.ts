export type Hi3BannerType = "battlesuit";

export interface Hi3RateUp {
  name: string;
  url: string | null;
  image: string | null;
}

export interface Hi3Banner {
  id: string;
  type: Hi3BannerType;
  version: string | null;
  phase: number | null;
  banners: Hi3RateUp[];
  startDate: string;
  endDate: string | null;
  featured5: Hi3RateUp[];
  featured4: Hi3RateUp[];
}
