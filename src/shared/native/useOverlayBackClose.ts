/** React hook — register overlay close with the hardware-back stack while `open`. */
import { useEffect } from "react";
import { registerOverlayBack } from "./overlayBackStack";

export function useOverlayBackClose(open: boolean, onClose: (() => void) | undefined): void {
  useEffect(() => {
    if (!open || !onClose) return;
    return registerOverlayBack(onClose);
  }, [open, onClose]);
}
