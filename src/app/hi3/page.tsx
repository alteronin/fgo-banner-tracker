import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/apps";
import { Hi3Tracker } from "@/components/Hi3Tracker";
import { UnitProvider } from "@/contexts/UnitContext";
import Hi3UnitsJson from "@/data/hi3-units.json";

const app = getAppBySlug("hi3");

export const metadata: Metadata = {
  title: { absolute: `${app?.name ?? "Honkai Impact 3rd"} Banner Tracker` },
  description: app?.tagline,
};

export default function Hi3Page() {
  if (!app) return null;
  return (
    <UnitProvider game="hi3" roster={Hi3UnitsJson}>
      <Hi3Tracker app={app} />
    </UnitProvider>
  );
}
