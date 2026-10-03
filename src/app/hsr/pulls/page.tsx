import type { Metadata } from "next";
import { PullsPage } from "@/components/PullsPage";
import { getHsrBanners } from "@/lib/hsr-data";
import { toBannerWindows } from "@/lib/pity";

export const metadata: Metadata = {
  title: { absolute: "Honkai: Star Rail Pulls" },
};

export default function HsrPullsPage() {
  return <PullsPage game="hsr" windows={toBannerWindows(getHsrBanners())} />;
}
