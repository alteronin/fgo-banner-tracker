import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/apps";
import { SvwbTracker } from "@/components/SvwbTracker";

const app = getAppBySlug("shadowverse");

export const metadata: Metadata = {
  title: {
    absolute: `${app?.name ?? "Shadowverse: Worlds Beyond"} Banner Tracker`,
  },
  description: app?.tagline,
};

export default function ShadowversePage() {
  if (!app) return null;
  return <SvwbTracker app={app} />;
}
