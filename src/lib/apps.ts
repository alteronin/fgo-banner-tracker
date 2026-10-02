export type TrackedApp = {
  id: string;
  slug: string;
  name: string;
  badge: string;
  color: string;
  path: string;
  tagline: string;
};

export const TRACKED_APPS: TrackedApp[] = [
  {
    id: "fgo",
    slug: "",
    name: "FGO JP Banner Tracker",
    badge: "FGO",
    color: "#f59e0b",
    path: "/",
    tagline: "Track your pulls and plan your quartz",
  },
  {
    id: "genshin",
    slug: "genshin",
    name: "Genshin Impact",
    badge: "GI",
    color: "#2dd4bf",
    path: "/genshin",
    tagline: "Track your wishes and plan your primogems",
  },
  {
    id: "hi3",
    slug: "hi3",
    name: "Honkai Impact 3rd",
    badge: "HI3",
    color: "#ef4444",
    path: "/hi3",
    tagline: "Track your pulls and plan your crystals",
  },
  {
    id: "hsr",
    slug: "hsr",
    name: "Honkai: Star Rail",
    badge: "HSR",
    color: "#a78bfa",
    path: "/hsr",
    tagline: "Track your warps and plan your jade",
  },
  {
    id: "zzz",
    slug: "zzz",
    name: "Zenless Zone Zero",
    badge: "ZZZ",
    color: "#facc15",
    path: "/zzz",
    tagline: "Track your pulls and plan your polychromes",
  },
  {
    id: "wuwa",
    slug: "wuwa",
    name: "Wuthering Waves",
    badge: "WW",
    color: "#38bdf8",
    path: "/wuwa",
    tagline: "Track your convenes and plan your astrites",
  },
  {
    id: "shadowverse",
    slug: "shadowverse",
    name: "Shadowverse: Worlds Beyond",
    badge: "SV",
    color: "#34d399",
    path: "/shadowverse",
    tagline: "Track your draws and plan your rupies",
  },
];

export function getAppBySlug(slug: string): TrackedApp | undefined {
  return TRACKED_APPS.find((app) => app.slug !== "" && app.slug === slug);
}

export function getActiveAppId(pathname: string): string {
  const segment = pathname.split("/")[1] ?? "";
  const match = TRACKED_APPS.find(
    (app) => app.slug !== "" && app.slug === segment
  );
  return match ? match.id : "fgo";
}
