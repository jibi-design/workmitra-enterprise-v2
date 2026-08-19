/** Hook — client snapshot is ready; SSR/first paint stays loading. */

import { useSyncExternalStore } from "react";

function subscribe(): () => void {
  return () => undefined;
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useDailyOsReady(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
