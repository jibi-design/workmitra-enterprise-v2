/** Job Mitra | useCommandPaletteHotkey.ts | Cmd/Ctrl+K open toggle */

import { useEffect } from "react";

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest("[contenteditable='true']"));
}

/**
 * Global hotkey: Cmd+K (mac) / Ctrl+K (win/linux).
 * When palette is closed, ignore if focus is inside an editable field.
 * When open, always allow toggle so users can dismiss from the search field.
 */
export function useCommandPaletteHotkey(open: boolean, onToggle: () => void): void {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const isChord = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (!isChord) return;
      if (!open && isEditableTarget(event.target)) return;
      event.preventDefault();
      onToggle();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onToggle]);
}
