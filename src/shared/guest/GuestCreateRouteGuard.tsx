/** Show employer create warning once per create-route visit, before form fill. */

import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useSoftAuth } from "./useSoftAuth";
import type { IntentAction } from "./intentPacket";

type CreateAction = Extract<IntentAction, "create_shift" | "create_career" | "create_planner">;

export function GuestCreateRouteGuard({
  action,
  children,
}: {
  readonly action: CreateAction;
  readonly children: ReactNode;
}) {
  const loc = useLocation();
  const { requireAuthForAction } = useSoftAuth();

  useEffect(() => {
    requireAuthForAction({
      action,
      targetId: loc.pathname,
      returnPath: `${loc.pathname}${loc.search}`,
      roleHint: "employer",
      payload: { phase: "enter" },
    });
  }, [action, loc.pathname, loc.search, requireAuthForAction]);

  return <>{children}</>;
}
