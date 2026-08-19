/**
 * LIFO stack of overlay close handlers for Android hardware back.
 * Modals / sheets / drawers register while open; back pops the topmost first.
 */

export type OverlayBackClose = () => void;

const stack: OverlayBackClose[] = [];

/** Register a close handler while an overlay is open. Returns unregister. */
export function registerOverlayBack(close: OverlayBackClose): () => void {
  stack.push(close);
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    const idx = stack.lastIndexOf(close);
    if (idx >= 0) stack.splice(idx, 1);
  };
}

/** Close the topmost overlay if any. Returns true when handled. */
export function closeTopOverlay(): boolean {
  const close = stack.pop();
  if (!close) return false;
  try {
    close();
  } catch {
    /* ignore close errors */
  }
  return true;
}

export function hasOpenOverlay(): boolean {
  return stack.length > 0;
}

export function getOpenOverlayCount(): number {
  return stack.length;
}
