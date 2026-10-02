import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/apps";
import { HsrTracker } from "@/components/HsrTracker";

const app = getAppBySlug("hsr");

export const metadata: Metadata = {
  title: { absolute: `${app?.name ?? "Honkai: Star Rail"} Banner Tracker` },
  description: app?.tagline,
};

export default function HsrPage() {
  if (!app) return null;
  return <HsrTracker app={app} />;
}
