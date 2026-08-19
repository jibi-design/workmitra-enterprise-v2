/** Job Mitra | useCommandPaletteHub.ts | Shared Cmd/Ctrl+K open state for role shells */

import { useCallback, useState } from "react";
import { useCommandPaletteHotkey } from "./useCommandPaletteHotkey";

export type CommandPaletteHub = {
  open: boolean;
  close: () => void;
  toggle: () => void;
};

/**
 * Owns command-palette open state + global hotkey.
 * Shells pass `open` / `close` into CommandPalette and navigate via their own router.
 */
export function useCommandPaletteHub(): CommandPaletteHub {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useCommandPaletteHotkey(open, toggle);

  return { open, close, toggle };
}
