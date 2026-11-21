"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "fbtn-show-reruns";

const listeners = new Set<() => void>();

function notifyShowRerunsChange(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) !== "0";
}

function getServerSnapshot(): boolean {
  return true;
}

export function setShowReruns(show: boolean): void {
  if (show) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    window.localStorage.setItem(STORAGE_KEY, "0");
  }
  notifyShowRerunsChange();
}

export function useShowReruns(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
