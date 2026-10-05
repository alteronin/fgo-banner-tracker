const listeners = new Set<() => void>();

export function subscribeSyncableChange(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function notifySyncableChange(): void {
  listeners.forEach((listener) => listener());
}
