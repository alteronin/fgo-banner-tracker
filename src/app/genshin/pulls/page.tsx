import type { Metadata } from "next";
import { PullsPage } from "@/components/PullsPage";
import { getGenshinBanners } from "@/lib/genshin-data";
import { toBannerWindows } from "@/lib/pity";

export const metadata: Metadata = {
  title: { absolute: "Genshin Impact Pulls" },
};

export default function GenshinPullsPage() {
  return (
    <PullsPage game="genshin" windows={toBannerWindows(getGenshinBanners())} />
  );
}
