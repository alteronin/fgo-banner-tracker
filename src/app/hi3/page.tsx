import type { Metadata } from "next";
import { getAppBySlug } from "@/lib/apps";
import { Hi3Tracker } from "@/components/Hi3Tracker";

const app = getAppBySlug("hi3");

export const metadata: Metadata = {
  title: { absolute: `${app?.name ?? "Honkai Impact 3rd"} Banner Tracker` },
  description: app?.tagline,
};

export default function Hi3Page() {
  if (!app) return null;
  return <Hi3Tracker app={app} />;
}
