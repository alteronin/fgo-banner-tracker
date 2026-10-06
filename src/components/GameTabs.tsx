"use client";

import Link from "next/link";

export type GameTab = "banners" | "units" | "faves" | "pulls";

export function GameTabs({ game, active }: { game: string; active: GameTab }) {
  const tabs: { key: GameTab; label: string; href: string }[] = [
    { key: "banners", label: "Banners", href: `/${game}` },
    { key: "units", label: "Units", href: `/${game}/units` },
    { key: "faves", label: "Faves", href: `/${game}/faves` },
    { key: "pulls", label: "Pulls", href: `/${game}/pulls` },
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

export type FgoTab = "banners" | "servants" | "grands" | "pulls";

export function FgoTabs({ active }: { active: FgoTab }) {
  const tabs: { key: FgoTab; label: string; href: string }[] = [
    { key: "banners", label: "Banners", href: "/" },
    { key: "servants", label: "Servants", href: "/servants" },
    { key: "grands", label: "Grands", href: "/grands" },
    { key: "pulls", label: "Pulls", href: "/pulls" },
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
