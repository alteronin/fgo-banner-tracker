import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/apps";
import { GenshinTracker } from "@/components/GenshinTracker";

const app = getAppBySlug("genshin");

export const metadata: Metadata = {
  title: { absolute: `${app?.name ?? "Genshin Impact"} Banner Tracker` },
  description: app?.tagline,
};

export default function GenshinPage() {
  if (!app) return null;
  return <GenshinTracker app={app} />;
}
