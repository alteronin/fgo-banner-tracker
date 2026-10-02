"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TRACKED_APPS, getActiveAppId } from "@/lib/apps";

export function AppSwitcher({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeId = getActiveAppId(pathname);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="app-switcher-menu"
        className="text-left group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
      >
        <span className="flex items-center gap-1.5">
          <h1 className="text-xl font-bold text-white dark:text-white light:text-gray-900">
            {title}
          </h1>
          <svg
            className={`w-4 h-4 text-gray-500 light:text-gray-400 group-hover:text-gray-300 light:group-hover:text-gray-600 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 9l6 6 6-6"
            />
          </svg>
        </span>
        <p className="text-sm text-gray-400 dark:text-gray-400 light:text-gray-600 mt-1">
          {subtitle}
        </p>
      </button>

      {open && (
        <div
          id="app-switcher-menu"
          role="menu"
          aria-label="Switch app"
          className="absolute left-0 top-full mt-2 w-80 max-h-[70vh] overflow-y-auto rounded-xl border border-gray-800 dark:border-gray-800 light:border-gray-200 bg-gray-900 dark:bg-gray-900 light:bg-white shadow-xl z-50 py-1.5"
        >
          <p className="px-3 pt-1 pb-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500 light:text-gray-400">
            Switch app
          </p>
          {TRACKED_APPS.map((app) => {
            const active = app.id === activeId;
            return (
              <Link
                key={app.id}
                href={app.path}
                role="menuitem"
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                  active
                    ? "bg-gray-800 dark:bg-gray-800 light:bg-gray-100"
                    : "hover:bg-gray-800 dark:hover:bg-gray-800 light:hover:bg-gray-100"
                }`}
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-gray-950"
                  style={{ backgroundColor: app.color }}
                  aria-hidden="true"
                >
                  {app.badge}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block truncate text-sm font-medium text-white dark:text-white light:text-gray-900">
                    {app.name}
                  </span>
                  <span className="block truncate text-xs text-gray-400 light:text-gray-500">
                    {app.tagline}
                  </span>
                </span>
                {active && (
                  <svg
                    className="w-4 h-4 shrink-0 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
