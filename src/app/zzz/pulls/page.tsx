import type { Metadata } from "next";
import { PullsPage } from "@/components/PullsPage";
import { getZzzBanners } from "@/lib/zzz-data";
import { toBannerWindows } from "@/lib/pity";

export const metadata: Metadata = {
  title: { absolute: "Zenless Zone Zero Pulls" },
};

export default function ZzzPullsPage() {
  return <PullsPage game="zzz" windows={toBannerWindows(getZzzBanners())} />;
}
