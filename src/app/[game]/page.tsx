import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonApp } from "@/components/ComingSoonApp";
import { TRACKED_APPS, getAppBySlug } from "@/lib/apps";

export const dynamicParams = false;

export function generateStaticParams() {
  return TRACKED_APPS.filter((app) => app.slug !== "" && app.slug !== "genshin").map(
    (app) => ({
      game: app.slug,
    })
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game } = await params;
  const app = getAppBySlug(game);
  if (!app) return { title: { absolute: "Not Found" } };
  return {
    title: { absolute: `${app.name} Banner Tracker` },
    description: app.tagline,
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ game: string }>;
}) {
  const { game } = await params;
  const app = getAppBySlug(game);
  if (!app) notFound();
  return <ComingSoonApp app={app} />;
}
