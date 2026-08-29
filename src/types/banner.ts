export interface Servant {
  name: string;
  slug: string;
  rateUpType: "single" | "shared";
}

export interface Banner {
  id: string;
  name: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  servants: Servant[];
}

export type ServantStatus = "none" | "owned" | "planning";

export type FilterOption = "all" | "owned" | "planning" | "either";
