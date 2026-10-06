import { useSyncExternalStore } from "react";

function readSearchParam(key: string): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(key);
  return value ? value : null;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/**
 * Reads a `?key=` URL search param in a hydration-safe way
 * (server snapshot is null; React swaps to the live value after hydration).
 *
 * Combine with local override state so user edits win over the URL:
 *
 *   const urlSearch = useSearchParam("search");
 *   const [override, setOverride] = useState<string | null>(null);
 *   const query = override ?? urlSearch ?? "";
 */
export function useSearchParam(key: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readSearchParam(key),
    () => null
  );
}

