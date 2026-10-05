import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/apps";
import { HsrTracker } from "@/components/HsrTracker";
import { UnitProvider } from "@/contexts/UnitContext";
import HsrUnitsJson from "@/data/hsr-units.json";

const app = getAppBySlug("hsr");

export const metadata: Metadata = {
  title: { absolute: `${app?.name ?? "Honkai: Star Rail"} Banner Tracker` },
  description: app?.tagline,
};

export default function HsrPage() {
  if (!app) return null;
  return (
    <UnitProvider game="hsr" roster={HsrUnitsJson}>
      <HsrTracker app={app} />
    </UnitProvider>
  );
}
