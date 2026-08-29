"use client";

import { useEffect, useCallback } from "react";

interface UseKeyboardNavigationProps {
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onEnter?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onEscape,
  onArrowUp,
  onArrowDown,
  onEnter,
  enabled = true,
}: UseKeyboardNavigationProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      switch (e.key) {
        case "Escape":
          onEscape?.();
          break;
        case "ArrowUp":
          e.preventDefault();
          onArrowUp?.();
          break;
        case "ArrowDown":
          e.preventDefault();
          onArrowDown?.();
          break;
        case "Enter":
          onEnter?.();
          break;
      }
    },
    [enabled, onEscape, onArrowUp, onArrowDown, onEnter]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
