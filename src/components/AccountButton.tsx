"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useAccount, type SyncState } from "@/contexts/AccountContext";

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

interface SyncLabel {
  text: string;
  className: string;
  retry: boolean;
}

function syncLabelFor(sync: SyncState): SyncLabel | null {
  switch (sync) {
    case "syncing":
      return { text: "Syncing…", className: "text-gray-400", retry: false };
    case "ok":
      return { text: "Synced", className: "text-green-400", retry: false };
    case "error":
      return { text: "Sync error", className: "text-red-400", retry: true };
    case "disabled":
      return { text: "Sync off", className: "text-gray-500", retry: false };
    default:
      return null;
  }
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export function AccountButton() {
  const { status, user, sync, notice, signIn, signOut, retrySync } =
    useAccount();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (status === "loading") {
    return (
      <div
        className="w-7 h-7 rounded-full bg-gray-800 animate-pulse"
        aria-hidden="true"
      />
    );
  }

  if (status === "signed-out") {
    return (
      <div className="flex items-center gap-2 min-w-0">
        {notice && (
          <span className="text-xs text-amber-400 max-w-[14rem] truncate" role="alert">
            {notice}
          </span>
        )}
        <button
          onClick={signIn}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 transition-all shrink-0"
        >
          <GoogleG />
          Sign in
        </button>
      </div>
    );
  }

  const label = syncLabelFor(sync);
  const displayName = user?.name || "Signed in";

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-2 min-w-0"
    >
      {notice && (
        <span className="text-xs text-amber-400 max-w-[14rem] truncate" role="alert">
          {notice}
        </span>
      )}
      {label && (
        <span className={`text-xs hidden sm:inline ${label.className}`}>
          {label.text}
          {label.retry && (
            <button
              onClick={retrySync}
              className="ml-1 underline hover:text-red-300"
            >
              Retry
            </button>
          )}
        </span>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
      >
        {user?.picture ? (
          <Image
            src={user.picture}
            alt=""
            width={28}
            height={28}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
            {initials(displayName)}
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-700 bg-gray-900 shadow-xl z-50 p-3 space-y-3"
        >
          <div className="flex items-center gap-3">
            {user?.picture ? (
              <Image
                src={user.picture}
                alt=""
                width={36}
                height={36}
                className="rounded-full shrink-0"
                unoptimized
              />
            ) : (
              <span className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-semibold flex items-center justify-center shrink-0">
                {initials(displayName)}
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            {sync === "error"
              ? "Cloud sync hit an error — your data is safe locally."
              : "Your collection syncs to this account across devices."}
          </p>
          <button
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            role="menuitem"
            className="w-full px-3 py-1.5 rounded-lg text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
