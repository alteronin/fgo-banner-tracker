import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/apps";
import { WuwaTracker } from "@/components/WuwaTracker";

const app = getAppBySlug("wuwa");

export const metadata: Metadata = {
  title: { absolute: `${app?.name ?? "Wuthering Waves"} Banner Tracker` },
  description: app?.tagline,
};

export default function WuwaPage() {
  if (!app) return null;
  return <WuwaTracker app={app} />;
}
