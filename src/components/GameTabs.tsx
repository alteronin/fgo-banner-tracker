"use client";

import Link from "next/link";

export type GameTab = "banners" | "units" | "faves";

export function GameTabs({ game, active }: { game: string; active: GameTab }) {
  const tabs: { key: GameTab; label: string; href: string }[] = [
    { key: "banners", label: "Banners", href: `/${game}` },
    { key: "units", label: "Units", href: `/${game}/units` },
    { key: "faves", label: "Faves", href: `/${game}/faves` },
  ];

  return (
    <nav className="flex flex-wrap items-center gap-2" aria-label="Sections">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={active === tab.key ? "page" : undefined}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            active === tab.key
              ? "bg-white text-gray-900"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
