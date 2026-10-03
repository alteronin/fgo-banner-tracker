import type { Metadata } from "next";
import { PullsPage } from "@/components/PullsPage";
import { getWuwaBanners } from "@/lib/wuwa-data";
import { toBannerWindows } from "@/lib/pity";

export const metadata: Metadata = {
  title: { absolute: "Wuthering Waves Pulls" },
};

export default function WuwaPullsPage() {
  return <PullsPage game="wuwa" windows={toBannerWindows(getWuwaBanners())} />;
}
