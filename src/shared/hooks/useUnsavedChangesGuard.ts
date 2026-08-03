/** Job Mitra | useUnsavedChangesGuard.ts — beforeunload + useBlocker dirty-form guard (Wave-4) */

import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

const DEFAULT_MESSAGE = "You have unsaved changes. Leave this page? Unsaved progress may be lost.";

/**
 * Warn on tab close/refresh (beforeunload) and in-app navigations (useBlocker).
 * Requires a data router (createHashRouter / createBrowserRouter).
 */
export function useUnsavedChangesGuard(when: boolean, message: string = DEFAULT_MESSAGE): void {
  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [when]);

  const blocker = useBlocker(when);

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
