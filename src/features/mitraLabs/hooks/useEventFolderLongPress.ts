/** Long-press pointer handlers for event folder cards. */

import { useRef } from "react";

const LONG_PRESS_MS = 520;

export function useEventFolderLongPress(onLongPress: () => void) {
  const timerRef = useRef<number | null>(null);
  const didLongRef = useRef(false);

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function consumeLongPress(): boolean {
    const did = didLongRef.current;
    didLongRef.current = false;
    return did;
  }

  return {
    consumeLongPress,
    pointerProps: {
      onPointerDown() {
        didLongRef.current = false;
        clearTimer();
        timerRef.current = window.setTimeout(() => {
          didLongRef.current = true;
          onLongPress();
        }, LONG_PRESS_MS);
      },
      onPointerUp: clearTimer,
      onPointerCancel: clearTimer,
      onPointerLeave: clearTimer,
      onContextMenu(event: { preventDefault: () => void }) {
        event.preventDefault();
        didLongRef.current = true;
        onLongPress();
      },
    },
  };
}
