import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/apps";
import { GenshinTracker } from "@/components/GenshinTracker";
import { UnitProvider } from "@/contexts/UnitContext";
import GenshinUnitsJson from "@/data/genshin-units.json";

const app = getAppBySlug("genshin");

export const metadata: Metadata = {
  title: { absolute: `${app?.name ?? "Genshin Impact"} Banner Tracker` },
  description: app?.tagline,
};

export default function GenshinPage() {
  if (!app) return null;
  return (
    <UnitProvider game="genshin" roster={GenshinUnitsJson}>
      <GenshinTracker app={app} />
    </UnitProvider>
  );
}
