import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/apps";
import { SvwbTracker } from "@/components/SvwbTracker";
import { UnitProvider } from "@/contexts/UnitContext";
import ShadowverseUnitsJson from "@/data/shadowverse-units.json";

const app = getAppBySlug("shadowverse");

export const metadata: Metadata = {
  title: {
    absolute: `${app?.name ?? "Shadowverse: Worlds Beyond"} Banner Tracker`,
  },
  description: app?.tagline,
};

export default function ShadowversePage() {
  if (!app) return null;
  return (
    <UnitProvider game="shadowverse" roster={ShadowverseUnitsJson}>
      <SvwbTracker app={app} />
    </UnitProvider>
  );
}
