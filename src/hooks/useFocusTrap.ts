/**
 * ============================================================================
 * FILE: src/hooks/useFocusTrap.ts
 * PERAN: Custom React Hook untuk aksesibilitas keyboard (WCAG 2.2 Focus Trap).
 * PENJELASAN PRESENTASI:
 * Saat modal/dialog terbuka (seperti Detail Gedung, Lightbox Foto, atau Unduh
 * Target), hook ini mengunci navigasi tombol Tab/Shift+Tab agar tidak bocor ke
 * elemen di belakang modal, menutup modal saat tombol Escape ditekan, dan
 * mengembalikan fokus kursor ke tombol pemicu saat modal ditutup.
 * ============================================================================
 */
"use client";

import { useEffect, RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * WCAG 2.2 Focus Trap for dialogs & drawers:
 * - Moves focus into the dialog on open
 * - Loops Tab / Shift+Tab strictly within focusable descendants
 * - Invokes onEscape on Escape key
 * - Restores focus to the triggering element on unmount/close
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement | null>,
  isActive: boolean,
  onEscape?: () => void
): void {
  useEffect(() => {
    if (!isActive || typeof document === "undefined") return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const container = containerRef.current;

    const focusTimer = window.requestAnimationFrame(() => {
      if (!container) return;
      if (container.contains(document.activeElement)) return;
      const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusables.length > 0) {
        focusables[0].focus({ preventScroll: true });
      } else {
        container.focus({ preventScroll: true });
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        e.stopPropagation();
        onEscape();
        return;
      }

      if (e.key !== "Tab" || !container) return;

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => el.offsetParent !== null);

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (!active || active === last || !container.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [containerRef, isActive, onEscape]);
}
