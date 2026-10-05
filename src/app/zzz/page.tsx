import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/apps";
import { ZzzTracker } from "@/components/ZzzTracker";
import { UnitProvider } from "@/contexts/UnitContext";
import ZzzUnitsJson from "@/data/zzz-units.json";

const app = getAppBySlug("zzz");

export const metadata: Metadata = {
  title: { absolute: `${app?.name ?? "Zenless Zone Zero"} Banner Tracker` },
  description: app?.tagline,
};

export default function ZzzPage() {
  if (!app) return null;
  return (
    <UnitProvider game="zzz" roster={ZzzUnitsJson}>
      <ZzzTracker app={app} />
    </UnitProvider>
  );
}
