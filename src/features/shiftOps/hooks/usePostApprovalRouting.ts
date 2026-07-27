/** Job Mitra | shiftOps/hooks/usePostApprovalRouting.ts | Phase 1 zero-dead-end router */

import { useCallback, useState } from "react";
import { getPostApprovalRoute } from "../services/readyState.service";
import type { PostApprovalRouteResult } from "../types";

function mapError(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: string }).message);
  }
  return "Routing failed";
}

/** Local/dev: Supabase anonymous/backend bridge often unset — soft-open Ready UI. */
function isAuthBridgeFailure(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("anonymous") ||
    m.includes("sign-ins are disabled") ||
    m.includes("sign-in") ||
    m.includes("signin") ||
    m.includes("auth bridge") ||
    m.includes("supabase is not configured") ||
    m.includes("supabase_bridge") ||
    m.includes("invalid login") ||
    m.includes("not authenticated") ||
    m.includes("jwt")
  );
}

export function usePostApprovalRouting(siteId?: string | null) {
  const [result, setResult] = useState<PostApprovalRouteResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [authOffline, setAuthOffline] = useState(false);

  const resolve = useCallback(async () => {
    setBusy(true);
    setError(null);
    setAwaitingApproval(false);
    setAuthOffline(false);
    try {
      const route = await getPostApprovalRoute(siteId);
      setResult(route);
      setBusy(false);
      return route;
    } catch (err) {
      const message = mapError(err);
      if (message.includes("awaiting_manager_approval")) {
        setAwaitingApproval(true);
        setError(null);
      } else if (isAuthBridgeFailure(message)) {
        setAuthOffline(true);
        setError(null);
        setResult({
          route: "ready_state",
          pending_assignment_id: null,
          membership_status: "ready_for_assignment",
        });
      } else {
        setError(message);
        setResult(null);
      }
      setBusy(false);
      return null;
    }
  }, [siteId]);

  return { result, busy, error, awaitingApproval, authOffline, resolve };
}
