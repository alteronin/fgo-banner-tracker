"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyBackup,
  buildSnapshot,
  decideSyncAction,
  fingerprintBackup,
  isBackupShape,
  readSyncMark,
  unionBackups,
  writeSyncMark,
  type SyncBackup,
} from "@/lib/backupData";
import { subscribeSyncableChange } from "@/lib/syncDirty";

export interface AccountUser {
  sub: string;
  name: string;
  email: string;
  picture: string;
}

export type SyncState = "idle" | "syncing" | "ok" | "error" | "disabled";

export interface AccountContextType {
  status: "loading" | "signed-out" | "signed-in";
  user: AccountUser | null;
  sync: SyncState;
  notice: string | null;
  signIn: () => void;
  signOut: () => void;
  retrySync: () => void;
}

const DEFAULT_CONTEXT: AccountContextType = {
  status: "signed-out",
  user: null,
  sync: "idle",
  notice: null,
  signIn: () => {},
  signOut: () => {},
  retrySync: () => {},
};

const AccountContext = createContext<AccountContextType>(DEFAULT_CONTEXT);

const PUSH_DEBOUNCE_MS = 2000;
const NOTICE_DISMISS_MS = 8000;

interface MeResponse {
  user: AccountUser | null;
  configured: boolean;
}

interface SyncGetResponse {
  updatedAt: number | null;
  data: unknown;
}

function consumeAuthNotice(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const auth = params.get("auth");
  if (!auth) return null;
  params.delete("auth");
  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    window.location.pathname + (query ? `?${query}` : "") + window.location.hash
  );
  if (auth === "not-configured") {
    return "Cloud sign-in isn't configured yet — set the Google and Upstash environment variables first.";
  }
  if (auth === "error") {
    return "Google sign-in failed. Please try again.";
  }
  return "Google sign-in failed. Please try again.";
}

const INITIAL_NOTICE = consumeAuthNotice();

export function AccountProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"loading" | "signed-out" | "signed-in">(
    "loading"
  );
  const [user, setUser] = useState<AccountUser | null>(null);
  const [sync, setSync] = useState<SyncState>("idle");
  const [notice, setNotice] = useState<string | null>(INITIAL_NOTICE);
  const configuredRef = useRef(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pushSnapshot = useCallback(
    async (snapshot: SyncBackup, fingerprint?: string): Promise<boolean> => {
      const fp = fingerprint ?? fingerprintBackup(snapshot);
      setSync("syncing");
      try {
        const res = await fetch("/api/sync", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ data: snapshot }),
        });
        if (res.status === 401) {
          setStatus("signed-out");
          setUser(null);
          setSync("idle");
          return false;
        }
        if (res.status === 503) {
          setSync("disabled");
          return false;
        }
        if (!res.ok) {
          setSync("error");
          return false;
        }
        const json = (await res.json()) as { updatedAt?: number };
        if (typeof json.updatedAt !== "number") {
          setSync("error");
          return false;
        }
        writeSyncMark({ fingerprint: fp, updatedAt: json.updatedAt });
        setSync("ok");
        return true;
      } catch {
        setSync("error");
        return false;
      }
    },
    []
  );

  const bootstrap = useCallback(async () => {
    setSync("syncing");
    let remote: SyncGetResponse | null = null;
    try {
      const res = await fetch("/api/sync", { cache: "no-store" });
      if (res.status === 401) {
        setStatus("signed-out");
        setUser(null);
        setSync("idle");
        return;
      }
      if (res.status === 503) {
        setSync("disabled");
        return;
      }
      if (!res.ok) {
        setSync("error");
        return;
      }
      remote = (await res.json()) as SyncGetResponse;
    } catch {
      setSync("error");
      return;
    }

    const local = buildSnapshot();
    const localFingerprint = fingerprintBackup(local);
    const mark = readSyncMark();
    const remoteUpdatedAt =
      typeof remote.updatedAt === "number" ? remote.updatedAt : null;
    const action = decideSyncAction({
      mark,
      localFingerprint,
      remoteUpdatedAt,
    });

    if (action === "noop") {
      setSync("ok");
      return;
    }
    if (action === "initial-push" || action === "push") {
      await pushSnapshot(local, localFingerprint);
      return;
    }

    const remoteData = remote.data;
    if (action === "adopt" && isBackupShape(remoteData)) {
      applyBackup(remoteData);
      writeSyncMark({
        fingerprint: fingerprintBackup(remoteData),
        updatedAt: remoteUpdatedAt as number,
      });
      setSync("ok");
      return;
    }
    if (isBackupShape(remoteData)) {
      const merged = unionBackups(local, remoteData);
      applyBackup(merged);
      await pushSnapshot(merged, fingerprintBackup(merged));
      return;
    }
    await pushSnapshot(local, localFingerprint);
  }, [pushSnapshot]);

  const runScheduledPush = useCallback(() => {
    const snapshot = buildSnapshot();
    const fp = fingerprintBackup(snapshot);
    const mark = readSyncMark();
    if (mark && mark.fingerprint === fp) return;
    void pushSnapshot(snapshot, fp);
  }, [pushSnapshot]);

  const schedulePush = useCallback(() => {
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      pushTimer.current = null;
      runScheduledPush();
    }, PUSH_DEBOUNCE_MS);
  }, [runScheduledPush]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let configured = false;
      let signedIn = false;
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const json = (await res.json()) as MeResponse;
        if (cancelled) return;
        configured = Boolean(json.configured);
        signedIn = Boolean(json.user);
        configuredRef.current = configured;
        if (json.user) setUser(json.user);
        setStatus(signedIn ? "signed-in" : "signed-out");
      } catch {
        if (cancelled) return;
        setStatus("signed-out");
      }
      if (cancelled) return;
      if (!configured) {
        configuredRef.current = false;
        setSync("disabled");
        return;
      }
      configuredRef.current = true;
      if (signedIn) {
        await bootstrap();
      }
    })();

    return () => {
      cancelled = true;
      if (pushTimer.current) {
        clearTimeout(pushTimer.current);
        pushTimer.current = null;
      }
    };
  }, [bootstrap]);

  useEffect(() => {
    if (status !== "signed-in") return;
    return subscribeSyncableChange(schedulePush);
  }, [status, schedulePush]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const signIn = useCallback(() => {
    setNotice(null);
    if (!configuredRef.current) {
      setNotice(
        "Cloud sign-in isn't configured yet — set the Google and Upstash environment variables first."
      );
      return;
    }
    const next = window.location.pathname + window.location.search;
    const loginUrl = new URL("/api/auth/login", window.location.origin);
    loginUrl.searchParams.set("next", next);
    window.location.href = loginUrl.toString();
  }, []);

  const signOut = useCallback(async () => {
    if (pushTimer.current) {
      clearTimeout(pushTimer.current);
      pushTimer.current = null;
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore — we clear local state regardless
    }
    setStatus("signed-out");
    setUser(null);
    setSync("idle");
    setNotice(null);
  }, []);

  const retrySync = useCallback(() => {
    if (status === "signed-in") void bootstrap();
  }, [status, bootstrap]);

  const value = useMemo<AccountContextType>(
    () => ({
      status,
      user,
      sync,
      notice,
      signIn,
      signOut,
      retrySync,
    }),
    [status, user, sync, notice, signIn, signOut, retrySync]
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount(): AccountContextType {
  return useContext(AccountContext);
}
