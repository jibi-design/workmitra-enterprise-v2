/** Job Mitra | useUnsavedChangesGuard.ts — beforeunload + useBlocker dirty-form guard (Wave-4) */

import { useEffect, type RefObject } from "react";
import { useBlocker } from "react-router-dom";

const DEFAULT_MESSAGE = "You have unsaved changes. Leave this page? Unsaved progress may be lost.";

/**
 * Warn on tab close/refresh (beforeunload) and in-app navigations (useBlocker).
 * Requires a data router (createHashRouter / createBrowserRouter).
 *
 * Optional `bypassRef`: set `.current = true` before an intentional leave (e.g. after
 * successful publish) so the blocker does not show a confirm that Playwright/automation
 * would auto-dismiss and cancel navigation.
 */
export function useUnsavedChangesGuard(
  when: boolean,
  message: string = DEFAULT_MESSAGE,
  bypassRef?: RefObject<boolean | null>,
): void {
  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (bypassRef?.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when, bypassRef]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (bypassRef?.current) return false;
    if (
      currentLocation.pathname === nextLocation.pathname &&
      currentLocation.search === nextLocation.search &&
      currentLocation.hash === nextLocation.hash
    ) {
      return false;
    }
    return when;
  });

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    const leave = window.confirm(message);
    if (leave) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker, message]);
}
